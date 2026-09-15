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

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => {
            const translations = {
                'magicHandler.processing': 'Processing...',
                'magicHandler.confirmTitle': 'Switch Account?',
                'magicHandler.confirmCurrentUser': 'You are currently logged in as:',
                'magicHandler.confirmWarning': 'Using this link will overwrite your current session on this device.',
                'magicHandler.buttonCancel': 'Cancel',
                'magicHandler.buttonConfirm': 'Yes, Switch',
                'magicHandler.successTitle': 'Transfer Successful!',
                'magicHandler.successMessage': 'You are now logged in with your original identity.',
                'magicHandler.redirecting': 'Redirecting...',
                'magicHandler.errorTitle': 'Transfer Failed',
                'magicHandler.errorMessage': 'The link may be invalid or expired.',
                'magicHandler.buttonGoHome': 'Go Home'
            };
            return translations[key] || key;
        },
    }),
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
        signInWithCustomToken.mockResolvedValue({ user: { uid: 'test-uid' } });
        renderWithRouter('/magic?token=valid-token');

        await waitFor(() => {
            expect(screen.getByText(/transfer successful/i)).toBeInTheDocument();
        });

        // Wait for the 2 second redirect timeout
        await waitFor(() => {
            expect(screen.getByText('Home Page')).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('shows error message on failure', async () => {
        signInWithCustomToken.mockRejectedValue(new Error('Invalid token'));

        renderWithRouter('/magic?token=invalid-token');

        await waitFor(() => {
            expect(screen.getByText(/transfer failed/i)).toBeInTheDocument();
        });
    });

    it('shows error if no token provided', () => {
        renderWithRouter('/magic');
        expect(screen.getByText(/transfer failed/i)).toBeInTheDocument();

        expect(signInWithCustomToken).not.toHaveBeenCalled();
    });

    it('imports transferred decision keys upon successful sign in', async () => {
        const sampleKeys = { 'dec-123': 'test-secret-key' };
        const encodedKeys = btoa(encodeURIComponent(JSON.stringify(sampleKeys)));
        signInWithCustomToken.mockResolvedValue({ user: { uid: 'test-uid' } });

        renderWithRouter(`/magic?token=valid-token&keys=${encodedKeys}`);

        await waitFor(() => {
            expect(signInWithCustomToken).toHaveBeenCalledWith(expect.anything(), 'valid-token');
        });

        const storedInLocalStorage = JSON.parse(localStorage.getItem('dom_decision_keys') || '{}');
        expect(storedInLocalStorage['dec-123']).toBe('test-secret-key');
    });

    it('cleans up token and keys from URL history immediately upon mount', async () => {
        const replaceStateSpy = vi.spyOn(window.history, 'replaceState');
        signInWithCustomToken.mockReturnValue(new Promise(() => { }));

        renderWithRouter('/magic?token=secret-token&keys=secret-keys');

        expect(replaceStateSpy).toHaveBeenCalledWith({}, document.title, window.location.pathname);
        replaceStateSpy.mockRestore();
    });

    it('accepts and imports token and keys passed via hash fragment', async () => {
        const sampleKeys = { 'dec-hash': 'hash-secret-key' };
        const encodedKeys = btoa(encodeURIComponent(JSON.stringify(sampleKeys)));
        window.location.hash = `#token=hash-token&keys=${encodedKeys}`;
        const replaceStateSpy = vi.spyOn(window.history, 'replaceState');
        signInWithCustomToken.mockResolvedValue({ user: { uid: 'test-uid' } });

        renderWithRouter('/magic');

        await waitFor(() => {
            expect(signInWithCustomToken).toHaveBeenCalledWith(expect.anything(), 'hash-token');
        });

        const storedInLocalStorage = JSON.parse(localStorage.getItem('dom_decision_keys') || '{}');
        expect(storedInLocalStorage['dec-hash']).toBe('hash-secret-key');
        expect(replaceStateSpy).toHaveBeenCalledWith({}, document.title, window.location.pathname);

        window.location.hash = '';
        replaceStateSpy.mockRestore();
    });
});
