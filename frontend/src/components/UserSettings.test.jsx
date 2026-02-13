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
            getInitialName: mockGetInitialName
        });
    });

    it('renders delete button for verified users', () => {
        useUser.mockReturnValue({
            user: { isAnonymous: false, displayName: 'Verified User', providers: ['google.com'] },
            logout: mockLogout,
            deleteAccount: mockDeleteAccount,
            getInitialName: mockGetInitialName
        });

        render(<UserSettings />);
        expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('opens delete confirmation modal when delete button is clicked', () => {
        useUser.mockReturnValue({
            user: { isAnonymous: false, displayName: 'Verified User', providers: ['google.com'] },
            logout: mockLogout,
            deleteAccount: mockDeleteAccount,
            getInitialName: mockGetInitialName
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
            getInitialName: mockGetInitialName
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
            getInitialName: mockGetInitialName
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
            getInitialName: mockGetInitialName
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
});
