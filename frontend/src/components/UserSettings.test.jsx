import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UserSettings from './UserSettings';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

// Mock dependencies
vi.mock('react-i18next', () => {
    const translations = {
        'userSettings.deleteTitle': 'Delete Account?',
        'userSettings.deleteWarning': 'This action is irreversible. Not even we can undo this.',
        'userSettings.deleteVotesWarning': 'Your votes will be anonymized to preserve decision integrity.',
        'userSettings.deletePasswordLabel': 'Confirm Password:',
        'userSettings.deleteError': 'Failed to delete account. Check password.',
        'userSettings.buttonCancel': 'Cancel',
        'userSettings.buttonDelete': 'Delete',
        'userSettings.buttonLogout': 'Logout',
        'userSettings.buttonClose': 'Close',
        'userSettings.avatarAlt': 'Avatar',
        'userSettings.buttonResetPassword': 'Reset Password',
        'userSettings.resetPasswordSent': 'Password reset link sent to your email.',
        'userSettings.resetPasswordError': 'Failed to send reset email.',
        'userSettings.editNameButton': 'Edit Name',
        'userSettings.editTitle': 'Change Display Name',
        'userSettings.buttonSave': 'Save',
    };
    const t = (key) => translations[key] || key;
    return { useTranslation: () => ({ t }) };
});
vi.mock('../contexts/UserContext');
vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn()
}));
vi.mock('../services/firebase', () => ({
    updateUserDisplayName: vi.fn()
}));
vi.mock('../services/ParticipantService', () => ({
    default: {
        registerParticipant: vi.fn()
    }
}));

// Mock utils
vi.mock('../utils/NameGenerator', () => ({
    default: { generate: () => 'New Anonymous Name' }
}));
vi.mock('./MagicLinkData', () => ({ default: () => <div>MagicLinkData</div> }));

describe('UserSettings Integration', () => {
    const mockLogout = vi.fn();
    const mockDeleteAccount = vi.fn();
    const mockSetDisplayName = vi.fn();
    const mockResetToInitialName = vi.fn();
    const mockGetInitialName = vi.fn(() => 'Initial Name');
    const mockResetPassword = vi.fn();
    const mockNavigate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
        useUser.mockReturnValue({
            user: { isAnonymous: true, displayName: 'Anonymous User' },
            logout: mockLogout,
            deleteAccount: mockDeleteAccount,
            setDisplayName: mockSetDisplayName,
            resetToInitialName: mockResetToInitialName,
            getInitialName: mockGetInitialName,
            resetPassword: mockResetPassword
        });
    });

    it('renders delete button for verified users', () => {
        useUser.mockReturnValue({
            user: { isAnonymous: false, displayName: 'Verified User', providers: ['google.com'] },
            logout: mockLogout,
            deleteAccount: mockDeleteAccount,
            getInitialName: mockGetInitialName,
            resetPassword: mockResetPassword
        });

        render(<UserSettings />);
        expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('opens delete confirmation modal when delete button is clicked', () => {
        useUser.mockReturnValue({
            user: { isAnonymous: false, displayName: 'Verified User', providers: ['google.com'] },
            logout: mockLogout,
            deleteAccount: mockDeleteAccount,
            getInitialName: mockGetInitialName,
            resetPassword: mockResetPassword
        });

        render(<UserSettings />);
        fireEvent.click(screen.getByText('Delete'));
        expect(screen.getByText('Delete Account?')).toBeInTheDocument();
    });

    it('shows password input for password participants', () => {
        useUser.mockReturnValue({
            user: { isAnonymous: false, displayName: 'Verified User', providers: ['password'] },
            logout: mockLogout,
            deleteAccount: mockDeleteAccount,
            getInitialName: mockGetInitialName,
            resetPassword: mockResetPassword
        });

        render(<UserSettings />);
        fireEvent.click(screen.getByText('Delete'));
        expect(screen.getByText('Confirm Password:')).toBeInTheDocument();
    });

    it('does NOT show password input for Google participants', () => {
        useUser.mockReturnValue({
            user: { isAnonymous: false, displayName: 'Verified User', providers: ['google.com'] },
            logout: mockLogout,
            deleteAccount: mockDeleteAccount,
            getInitialName: mockGetInitialName,
            resetPassword: mockResetPassword
        });

        render(<UserSettings />);
        fireEvent.click(screen.getByText('Delete'));
        expect(screen.queryByText('Confirm Password:')).not.toBeInTheDocument();
    });

    it('calls deleteAccount when confirmed', async () => {
        useUser.mockReturnValue({
            user: { isAnonymous: false, displayName: 'Verified User', providers: ['google.com'] },
            logout: mockLogout,
            deleteAccount: mockDeleteAccount,
            getInitialName: mockGetInitialName,
            resetPassword: mockResetPassword
        });

        render(<UserSettings />);
        fireEvent.click(screen.getByText('Delete'));

        const buttons = screen.getAllByText('Delete');
        const confirmButton = buttons[buttons.length - 1];

        fireEvent.click(confirmButton);
        await waitFor(() => {
            expect(mockDeleteAccount).toHaveBeenCalled();
        });
    });

    it('renders email and display name for registered users', () => {
        useUser.mockReturnValue({
            user: { isAnonymous: false, displayName: 'Jane Doe', email: 'jane@example.com', providers: ['password'] },
            logout: mockLogout,
            deleteAccount: mockDeleteAccount,
            getInitialName: mockGetInitialName,
            resetPassword: mockResetPassword
        });

        render(<UserSettings />);
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
        expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    it('allows registered users to edit their display name', async () => {
        useUser.mockReturnValue({
            user: { isAnonymous: false, displayName: 'Jane Doe', email: 'jane@example.com', providers: ['password'] },
            logout: mockLogout,
            deleteAccount: mockDeleteAccount,
            setDisplayName: mockSetDisplayName,
            getInitialName: mockGetInitialName,
            resetPassword: mockResetPassword
        });

        render(<UserSettings />);
        const editBtn = screen.getByTitle('Edit Name');
        fireEvent.click(editBtn);

        expect(screen.getByText('Change Display Name')).toBeInTheDocument();
        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'Jane Updated' } });
        fireEvent.click(screen.getByText('Save'));

        expect(mockSetDisplayName).toHaveBeenCalledWith('Jane Updated');
    });

    it('shows Reset Password button for password-registered users and sends reset email', async () => {
        mockResetPassword.mockResolvedValue();
        useUser.mockReturnValue({
            user: { isAnonymous: false, displayName: 'Jane Doe', email: 'jane@example.com', providers: ['password'] },
            logout: mockLogout,
            deleteAccount: mockDeleteAccount,
            getInitialName: mockGetInitialName,
            resetPassword: mockResetPassword
        });

        render(<UserSettings />);
        const resetBtn = screen.getByText('Reset Password');
        expect(resetBtn).toBeInTheDocument();

        fireEvent.click(resetBtn);
        await waitFor(() => {
            expect(mockResetPassword).toHaveBeenCalledWith('jane@example.com');
            expect(screen.getByText('Password reset link sent to your email.')).toBeInTheDocument();
        });
    });

    it('does not show Reset Password button for Google-registered users without password provider', () => {
        useUser.mockReturnValue({
            user: { isAnonymous: false, displayName: 'Google User', email: 'google@example.com', providers: ['google.com'] },
            logout: mockLogout,
            deleteAccount: mockDeleteAccount,
            getInitialName: mockGetInitialName,
            resetPassword: mockResetPassword
        });

        render(<UserSettings />);
        expect(screen.queryByText('Reset Password')).not.toBeInTheDocument();
    });
});
