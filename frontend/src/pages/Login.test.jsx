import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Login from '../pages/Login';
import { UserProvider } from '../contexts/UserContext';
import { BrowserRouter } from 'react-router-dom';

import en from '../locales/en.json';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => {
            const parts = key.split('.');
            let curr = en;
            for (const part of parts) {
                if (curr && typeof curr === 'object') {
                    curr = curr[part];
                } else {
                    return key;
                }
            }
            return curr || key;
        }
    })
}));

// Mock services/firebase to prevent initialization error
vi.mock('../services/firebase', () => ({
    auth: {},
}));

// Mock UserContext
const mockLoginWithGoogle = vi.fn();
const mockLoginEmail = vi.fn();
const mockRegisterEmail = vi.fn();
const mockResetPassword = vi.fn();

vi.mock('../contexts/UserContext', async () => {
    const actual = await vi.importActual('../contexts/UserContext');
    return {
        ...actual,
        useUser: () => ({
            user: { isAnonymous: true }, // Default to anonymous for login page access
            loginWithGoogle: mockLoginWithGoogle,
            loginEmail: mockLoginEmail,
            registerEmail: mockRegisterEmail,
            resetPassword: mockResetPassword,
        }),
    };
});

// Mock Navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('Login Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderLogin = () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );
    };

    const getSubmitButton = () => {
        // Find the submit button specifically (it's inside the form)
        // Or simply search for the exact text used in the submit button which might be distinct enough if mapped correctly
        // But here "Sign In" is used for both Tab and Submit.
        // Let's use getAllByRole and pick the second one (Submit) or add a selector check.
        // Better: use the type="submit" attribute if possible, but getByRole doesn't support that directly easily.
        // Let's iterate.
        const buttons = screen.getAllByRole('button', { name: /^sign in$/i });
        // Expected: Tab is first, Submit is second (or we check attributes)
        return buttons.find(b => b.type === 'submit');
    };

    it('renders login form by default', () => {
        renderLogin();
        expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
        const submitBtn = getSubmitButton();
        expect(submitBtn).toBeInTheDocument();
    });

    it('switches to register mode', async () => {
        renderLogin();
        fireEvent.click(screen.getByRole('button', { name: /register/i }));
        expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('switches to reset password mode', async () => {
        renderLogin();
        fireEvent.click(screen.getByText(/forgot password\?/i));
        expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument();
        expect(screen.queryByPlaceholderText(/••••••••/i)).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
    });

    it('calls loginEmail on sign in submit', async () => {
        renderLogin();
        fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'password123' } });

        const submitBtn = getSubmitButton();
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(mockLoginEmail).toHaveBeenCalledWith('test@example.com', 'password123');
        });
    });

    it('calls registerEmail on register submit', async () => {
        renderLogin();
        fireEvent.click(screen.getByRole('button', { name: /register/i })); // Switch tab
        fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), { target: { value: 'new@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'newpass123' } });
        fireEvent.click(screen.getByRole('button', { name: /create account/i }));

        await waitFor(() => {
            expect(mockRegisterEmail).toHaveBeenCalledWith('new@example.com', 'newpass123', false);
        });

        // Test with linking checked
        const linkCheckbox = screen.getByLabelText(/link to my current guest account/i);
        fireEvent.click(linkCheckbox);

        fireEvent.click(screen.getByRole('button', { name: /create account/i }));

        await waitFor(() => {
            expect(mockRegisterEmail).toHaveBeenCalledWith('new@example.com', 'newpass123', true);
        });
    });

    it('calls loginWithGoogle on google button click', async () => {
        renderLogin();
        fireEvent.click(screen.getByRole('button', { name: /sign in with google/i }));

        await waitFor(() => {
            expect(mockLoginWithGoogle).toHaveBeenCalledWith(false);
        });

        // Test with linking checked
        const linkCheckbox = screen.getByLabelText(/link to my current guest account/i);
        fireEvent.click(linkCheckbox);

        fireEvent.click(screen.getByRole('button', { name: /sign in with google/i }));

        await waitFor(() => {
            expect(mockLoginWithGoogle).toHaveBeenCalledWith(true);
        });
    });

    it('displays specific error message when auth/invalid-credential is returned', async () => {
        const error = new Error('Invalid credential');
        error.code = 'auth/invalid-credential';
        mockLoginEmail.mockRejectedValue(error);

        renderLogin();
        fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'wrongpass' } });

        const submitBtn = getSubmitButton();
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(screen.getByText('Invalid email or password.')).toBeInTheDocument();
        });
    });

    it('does not display error when user closes Google popup', async () => {
        const cancelError = new Error('Popup closed by user');
        cancelError.code = 'auth/popup-closed-by-user';
        mockLoginWithGoogle.mockRejectedValue(cancelError);

        renderLogin();
        fireEvent.click(screen.getByRole('button', { name: /sign in with google/i }));

        await waitFor(() => {
            expect(mockLoginWithGoogle).toHaveBeenCalled();
        });
        expect(screen.queryByText(/Failed to sign in with Google/i)).not.toBeInTheDocument();
    });

    it('displays helpful error message when Google popup is blocked', async () => {
        const blockedError = new Error('Popup blocked');
        blockedError.code = 'auth/popup-blocked';
        mockLoginWithGoogle.mockRejectedValue(blockedError);

        renderLogin();
        fireEvent.click(screen.getByRole('button', { name: /sign in with google/i }));

        await waitFor(() => {
            expect(screen.getByText(/Pop-up was blocked by your browser/i)).toBeInTheDocument();
        });
    });

    it('displays helpful error message when domain is unauthorized', async () => {
        const domainError = new Error('Unauthorized domain');
        domainError.code = 'auth/unauthorized-domain';
        mockLoginWithGoogle.mockRejectedValue(domainError);

        renderLogin();
        fireEvent.click(screen.getByRole('button', { name: /sign in with google/i }));

        await waitFor(() => {
            expect(screen.getByText(/domain is not authorized/i)).toBeInTheDocument();
        });
    });

    it('renders Google login button with icon and contrasting text color', () => {
        renderLogin();
        const googleButton = screen.getByRole('button', { name: /sign in with google/i });
        expect(googleButton).toBeInTheDocument();
        expect(screen.getByTestId('google-icon')).toBeInTheDocument();
        // Ensure text color is dark (#1f1f1f) and not white (#ffffff)
        expect(googleButton).toHaveStyle({ color: '#1f1f1f', backgroundColor: '#ffffff' });
    });
});
