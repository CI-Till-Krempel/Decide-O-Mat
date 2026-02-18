import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, expect, describe, it, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import MyDecisions from './MyDecisions';
import { useUser } from '../contexts/UserContext';
import * as firebaseService from '../services/firebase';

vi.mock('react-i18next', () => {
    const translations = {
        'myDecisions.title': 'My Decisions',
        'myDecisions.runningTitle': 'Which decisions are currently running?',
        'myDecisions.archiveTitle': 'All activities',
        'myDecisions.loginPrompt': 'Please log in to view your decisions.',
        'myDecisions.empty': "You haven't created or participated in any decisions yet.",
        'myDecisions.error': 'Failed to load your decisions.',
        'myDecisions.roleOwner': 'Owner',
        'myDecisions.roleInvitee': 'Invitee',
        'myDecisions.statusOpen': 'Open',
        'myDecisions.statusClosed': 'Closed',
        'myDecisions.contextMenu.open': 'Options',
        'myDecisions.contextMenu.view': 'View',
        'myDecisions.contextMenu.copyLink': 'Copy Link',
        'myDecisions.contextMenu.close': 'Close Decision',
        'myDecisions.contextMenu.reopen': 'Reopen Decision',
        'myDecisions.contextMenu.edit': 'Edit Question',
        'myDecisions.contextMenu.delete': 'Delete',
        'decision.copyLinkSuccess': 'Link Copied!',
        'decision.errors.statusUpdateFailed': 'Failed to update decision status.',
    };
    const t = (key, opts) => {
        if (key === 'myDecisions.timeAgo') return `${opts?.time || ''} ago`;
        return translations[key] || key;
    };
    return {
        useTranslation: () => ({ t }),
    };
});

vi.mock('../services/firebase', () => ({
    getUserDecisions: vi.fn(),
    toggleDecisionStatus: vi.fn(),
}));

vi.mock('../services/EncryptionService', () => ({
    default: {
        getStoredKey: vi.fn().mockResolvedValue(null),
        getStoredKeyString: vi.fn().mockReturnValue(null),
        decrypt: vi.fn(),
    }
}));

vi.mock('../contexts/UserContext', () => ({
    useUser: vi.fn(),
}));

vi.mock('../components/Toast', () => ({
    default: ({ message }) => <div data-testid="toast">{message}</div>
}));

vi.mock('../components/Spinner', () => ({
    default: () => <div role="status" aria-label="loading">Loading...</div>
}));

const mockUser = {
    userId: 'test-user-id',
    displayName: 'Test User'
};

const renderMyDecisions = () => {
    return render(
        <BrowserRouter>
            <MyDecisions />
        </BrowserRouter>
    );
};

describe('MyDecisions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useUser.mockReturnValue({ user: mockUser });
    });

    it('shows login prompt when user is not logged in', () => {
        useUser.mockReturnValue({ user: null });
        renderMyDecisions();
        expect(screen.getByText('Please log in to view your decisions.')).toBeInTheDocument();
    });

    it('shows empty state when no decisions', async () => {
        firebaseService.getUserDecisions.mockResolvedValue([]);
        renderMyDecisions();
        await waitFor(() => {
            expect(screen.getByText(/haven't created/i)).toBeInTheDocument();
        });
    });

    it('renders running decisions in running section', async () => {
        const mockDecisions = [
            { id: '1', question: 'Running Decision', role: 'owner', status: 'open', createdAt: new Date() }
        ];
        firebaseService.getUserDecisions.mockResolvedValue(mockDecisions);

        renderMyDecisions();
        await waitFor(() => {
            expect(screen.getByText('Which decisions are currently running?')).toBeInTheDocument();
            expect(screen.getByText('Running Decision')).toBeInTheDocument();
        });
    });

    it('renders archived decisions in archive section', async () => {
        const mockDecisions = [
            { id: '2', question: 'Archived Decision', role: 'owner', status: 'closed', createdAt: new Date() }
        ];
        firebaseService.getUserDecisions.mockResolvedValue(mockDecisions);

        renderMyDecisions();
        await waitFor(() => {
            expect(screen.getByText('All activities')).toBeInTheDocument();
            expect(screen.getByText('Archived Decision')).toBeInTheDocument();
        });
    });

    it('renders owner badge for owner decisions', async () => {
        const mockDecisions = [
            { id: '1', question: 'My Decision', role: 'owner', status: 'open', createdAt: new Date() }
        ];
        firebaseService.getUserDecisions.mockResolvedValue(mockDecisions);

        renderMyDecisions();
        await waitFor(() => {
            expect(screen.getByText('Owner')).toBeInTheDocument();
        });
    });

    it('renders invitee badge for participant decisions', async () => {
        const mockDecisions = [
            { id: '2', question: 'Other Decision', role: 'participant', status: 'open', createdAt: new Date() }
        ];
        firebaseService.getUserDecisions.mockResolvedValue(mockDecisions);

        renderMyDecisions();
        await waitFor(() => {
            expect(screen.getByText('Invitee')).toBeInTheDocument();
        });
    });

    describe('Context Menu', () => {
        it('opens context menu when options button is clicked', async () => {
            const user = userEvent.setup();
            const mockDecisions = [
                { id: '1', question: 'Test Decision', role: 'owner', status: 'open', createdAt: new Date() }
            ];
            firebaseService.getUserDecisions.mockResolvedValue(mockDecisions);

            renderMyDecisions();
            await waitFor(() => {
                expect(screen.getByText('Test Decision')).toBeInTheDocument();
            });

            await user.click(screen.getByLabelText('Options'));

            await waitFor(() => {
                expect(screen.getByRole('menu')).toBeInTheDocument();
                expect(screen.getByText('View')).toBeInTheDocument();
                expect(screen.getByText('Copy Link')).toBeInTheDocument();
            });
        });

        it('shows owner actions for owner decisions', async () => {
            const user = userEvent.setup();
            const mockDecisions = [
                { id: '1', question: 'Test Decision', role: 'owner', status: 'open', createdAt: new Date() }
            ];
            firebaseService.getUserDecisions.mockResolvedValue(mockDecisions);

            renderMyDecisions();
            await waitFor(() => {
                expect(screen.getByText('Test Decision')).toBeInTheDocument();
            });

            await user.click(screen.getByLabelText('Options'));

            await waitFor(() => {
                expect(screen.getByText('Close Decision')).toBeInTheDocument();
                expect(screen.getByText('Edit Question')).toBeInTheDocument();
                expect(screen.getByText('Delete')).toBeInTheDocument();
            });
        });

        it('does not show owner actions for participant decisions', async () => {
            const user = userEvent.setup();
            const mockDecisions = [
                { id: '1', question: 'Test Decision', role: 'participant', status: 'open', createdAt: new Date() }
            ];
            firebaseService.getUserDecisions.mockResolvedValue(mockDecisions);

            renderMyDecisions();
            await waitFor(() => {
                expect(screen.getByText('Test Decision')).toBeInTheDocument();
            });

            await user.click(screen.getByLabelText('Options'));

            await waitFor(() => {
                expect(screen.getByText('View')).toBeInTheDocument();
                expect(screen.queryByText('Delete')).not.toBeInTheDocument();
            });
        });

        it('shows reopen for closed decisions', async () => {
            const user = userEvent.setup();
            const mockDecisions = [
                { id: '1', question: 'Closed Decision', role: 'owner', status: 'closed', createdAt: new Date() }
            ];
            firebaseService.getUserDecisions.mockResolvedValue(mockDecisions);

            renderMyDecisions();
            await waitFor(() => {
                expect(screen.getByText('Closed Decision')).toBeInTheDocument();
            });

            await user.click(screen.getByLabelText('Options'));

            await waitFor(() => {
                expect(screen.getByText('Reopen Decision')).toBeInTheDocument();
            });
        });
    });

    it('shows error message on fetch failure', async () => {
        firebaseService.getUserDecisions.mockRejectedValue(new Error('Network error'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        renderMyDecisions();
        await waitFor(() => {
            expect(screen.getByText('Failed to load your decisions.')).toBeInTheDocument();
        });
        consoleSpy.mockRestore();
    });
});
