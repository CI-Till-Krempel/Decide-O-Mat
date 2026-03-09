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

describe('MagicHandler', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows loading state initially', async () => {
        signInWithCustomToken.mockReturnValue(new Promise(() => { }));
        render(
            <MemoryRouter initialEntries={['/magic?token=test-token']}>
                <Routes>
                    <Route path="/magic" element={<MagicHandler />} />
                </Routes>
            </MemoryRouter>
        );
        expect(screen.getByText(/Processing/i)).toBeInTheDocument();
    });

    it('calls signInWithCustomToken with token from URL', async () => {
        signInWithCustomToken.mockResolvedValue({ user: { uid: 'test-uid' } });
        render(
            <MemoryRouter initialEntries={['/magic?token=valid-token']}>
                <Routes>
                    <Route path="/magic" element={<MagicHandler />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(signInWithCustomToken).toHaveBeenCalledWith(expect.anything(), 'valid-token');
        });
    });

    it('shows success message and redirects on success', async () => {
        signInWithCustomToken.mockResolvedValue({ user: { uid: 'test-uid' } });
        render(
            <MemoryRouter initialEntries={['/magic?token=valid-token']}>
                <Routes>
                    <Route path="/magic" element={<MagicHandler />} />
                    <Route path="/" element={<div>Home Page</div>} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/transfer successful/i)).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByText('Home Page')).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('shows error message on failure', async () => {
        signInWithCustomToken.mockRejectedValue(new Error('Invalid token'));

        render(
            <MemoryRouter initialEntries={['/magic?token=invalid-token']}>
                <Routes>
                    <Route path="/magic" element={<MagicHandler />} />
                    <Route path="/" element={<div>Home Page</div>} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/transfer failed/i)).toBeInTheDocument();
        });
    });

    it('shows error if no token provided', () => {
        render(
            <MemoryRouter initialEntries={['/magic']}>
                <Routes>
                    <Route path="/magic" element={<MagicHandler />} />
                    <Route path="/" element={<div>Home Page</div>} />
                </Routes>
            </MemoryRouter>
        );
        expect(screen.getByText(/transfer failed/i)).toBeInTheDocument();
        expect(signInWithCustomToken).not.toHaveBeenCalled();
    });
});
