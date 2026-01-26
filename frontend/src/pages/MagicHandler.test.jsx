import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import MagicHandler from './MagicHandler';

// Mock firebase
vi.mock('firebase/auth', () => ({
    getAuth: vi.fn(),
    signInWithCustomToken: vi.fn(),
}));
import { signInWithCustomToken } from 'firebase/auth';

// Mock shared firebase service
vi.mock('../services/firebase', () => ({
    auth: { currentUser: null },
}));

// Mock UserContext
vi.mock('../contexts/UserContext', () => ({
    useUser: vi.fn(() => ({ user: null })),
}));

const renderWithRouter = (initialEntry) => {
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <Routes>
                <Route path="/magic" element={<MagicHandler />} />
                <Route path="/" element={<div>Home Page</div>} />
            </Routes>
        </MemoryRouter>
    );
};

describe('MagicHandler', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows loading state initially', async () => {
        // Return a pending promise so state doesn't update during test
        signInWithCustomToken.mockReturnValue(new Promise(() => { }));
        renderWithRouter('/magic?token=test-token');
        expect(screen.getByText(/Processing/i)).toBeInTheDocument();
    });

    it('calls signInWithCustomToken with token from URL', async () => {
        signInWithCustomToken.mockResolvedValue({ user: { uid: 'test-uid' } });
        renderWithRouter('/magic?token=valid-token');

        await waitFor(() => {
            expect(signInWithCustomToken).toHaveBeenCalledWith(expect.anything(), 'valid-token');
        });
    });

    it('shows success message and redirects on success', async () => {
        vi.useFakeTimers();
        try {
            signInWithCustomToken.mockResolvedValue({ user: { uid: 'test-uid' } });
            renderWithRouter('/magic?token=valid-token');

            await waitFor(() => {
                expect(screen.getByText(/transfer successful/i)).toBeInTheDocument();
            });

            // Fast-forward time to trigger redirect
            vi.advanceTimersByTime(2500);

            await waitFor(() => {
                expect(screen.getByText('Home Page')).toBeInTheDocument();
            });
        } finally {
            vi.useRealTimers();
        }
    });

    it('shows error message on failure', async () => {
        // Mock console.error to suppress logs
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        signInWithCustomToken.mockRejectedValue(new Error('Invalid token'));

        renderWithRouter('/magic?token=invalid-token');

        await waitFor(() => {
            expect(screen.getByText(/transfer failed/i)).toBeInTheDocument();
        });

        consoleSpy.mockRestore();
    });

    it('shows error if no token provided', () => {
        renderWithRouter('/magic');
        expect(screen.getByText(/transfer failed/i)).toBeInTheDocument();
        expect(signInWithCustomToken).not.toHaveBeenCalled();
    });
});
