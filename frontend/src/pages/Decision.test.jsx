import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Decision from './Decision';

// Mock i18next — t function must be a stable reference to avoid infinite re-render
// (Decision.jsx has t in a useEffect dependency array, matching real react-i18next behavior)
vi.mock('react-i18next', () => {
    const translations = {
        'decision.notFound': 'Decision not found',
        'decision.decryptionFailed': '[Decryption Failed]',
        'decision.voteYes': 'Yes',
        'decision.voteNo': 'No',
        'decision.votedLabel': 'Voted',
        'decision.voteLabel': 'Vote',
        'decision.anonymous': 'Anonymous',
        'decision.copyLinkButton': 'Copy Link',
        'decision.copyLinkSuccess': 'Link Copied!',
        'decision.resultApproved': 'Approved',
        'decision.resultRejected': 'Rejected',
        'decision.resultNoVotes': 'No Votes',
        'decision.errors.voteFailed': 'Failed to cast vote.',
        'argumentList.addPro': 'Add pro',
        'argumentList.addCon': 'Add contra',
        'addArgumentForm.placeholderPro': 'Add a Pro...',
        'addArgumentForm.placeholderCon': 'Add a Con...',
        'addArgumentForm.buttonAdd': 'Add',
        'addArgumentForm.errorFailed': 'Failed to add argument.',
        'argumentItem.yourStatement': 'Your Statement',
        'argumentItem.approvalFrom': 'Approval from',
        'argumentItem.errorVoteFailed': 'Failed to vote.',
    };
    const t = (key, opts) => {
        if (key === 'decision.decisionClosed') return `Decision Closed: ${opts?.result || ''}`;
        if (key === 'argumentItem.statementBy') return `Statement by ${opts?.name || ''}`;
        return translations[key] || key;
    };
    return {
        useTranslation: () => ({ t }),
    };
});

// Mock the firebase module
vi.mock('../services/firebase', () => ({
    subscribeToDecision: vi.fn(),
    subscribeToArguments: vi.fn(),
    subscribeToArgumentVotes: vi.fn(),
    toggleDecisionStatus: vi.fn(),
    voteDecision: vi.fn(),
    voteArgument: vi.fn(),
    addArgument: vi.fn(),
    subscribeToFinalVotes: vi.fn(),
}));

import {
    subscribeToDecision as mockSubscribeToDecision,
    subscribeToArguments as mockSubscribeToArguments,
    voteDecision as mockVoteDecision,
    subscribeToFinalVotes as mockSubscribeToFinalVotes,
} from '../services/firebase';

// Mock UserContext — simple factory mock (no vi.importActual to avoid Firebase init in CI)
vi.mock('../contexts/UserContext', () => ({
    useUser: vi.fn(() => ({
        user: { userId: 'test-user-id', displayName: 'Test User' },
        setDisplayName: vi.fn()
    }))
}));
import { useUser } from '../contexts/UserContext';

// Mock EncryptionService
vi.mock('../services/EncryptionService', () => ({
    default: {
        importKey: vi.fn(),
        decrypt: vi.fn(),
        encrypt: vi.fn(),
        isEnabled: vi.fn(),
        storeKey: vi.fn(),
        getStoredKey: vi.fn(),
        getStoredKeyString: vi.fn(),
    }
}));
import EncryptionService from '../services/EncryptionService';

// Mock ParticipantService
vi.mock('../services/ParticipantService', () => ({
    default: {
        subscribeToParticipants: vi.fn(),
        registerParticipant: vi.fn(),
    }
}));
import ParticipantService from '../services/ParticipantService';

// Mock ParticipantList component
vi.mock('../components/ParticipantList', () => ({
    default: () => <div data-testid="participant-list">ParticipantList</div>
}));

// Mock Spinner
vi.mock('../components/Spinner', () => ({
    default: () => <div role="status" aria-label="loading">Loading...</div>
}));

// Mock ElectionHero — lightweight version that exposes the same prop interface
vi.mock('../components/ElectionHero', () => ({
    default: ({ question, onVoteYes, onVoteNo, isClosed, userVote, finalResult }) => (
        <div data-testid="election-hero">
            <h1>{question}</h1>
            {isClosed && finalResult && (
                <div>{`Decision Closed: ${finalResult}`}</div>
            )}
            <button aria-label="Yes" onClick={onVoteYes} disabled={isClosed}>Yes</button>
            <button aria-label="No" onClick={onVoteNo} disabled={isClosed}>No</button>
            {userVote && <span data-testid="user-vote">{userVote}</span>}
        </div>
    )
}));

// Mock StatementCard — avoids subscribeToArgumentVotes subscriptions
vi.mock('../components/StatementCard', () => ({
    default: ({ argument }) => (
        <div data-testid={`statement-${argument.id}`}>{argument.text}</div>
    )
}));

// Mock FloatingArgumentInput
vi.mock('../components/FloatingArgumentInput', () => ({
    default: ({ type, onClose }) => (
        <div data-testid="floating-input">
            <input
                placeholder={type === 'pro' ? 'Add a Pro...' : 'Add a Con...'}
                data-testid="arg-input"
            />
            <button onClick={onClose} aria-label="Close">Close</button>
        </div>
    )
}));

// Mock FAB
vi.mock('../components/FAB', () => ({
    default: ({ onClick, label }) => (
        <button aria-label={label} onClick={onClick} data-testid="fab">{label}</button>
    )
}));

// Mock ColumnHeader
vi.mock('../components/ColumnHeader', () => ({
    default: ({ label, onAdd, disabled }) => (
        <div data-testid={`column-header-${label}`}>
            <span>{label}</span>
            <button aria-label={label} onClick={onAdd} disabled={disabled}>+</button>
        </div>
    )
}));

const renderDecision = (initialUrl = '/d/test-decision-123') => {
    return render(
        <MemoryRouter initialEntries={[initialUrl]}>
            <Routes>
                <Route path="/d/:id" element={<Decision />} />
            </Routes>
        </MemoryRouter>
    );
};

describe('Decision Component', () => {
    const mockDecision = {
        id: 'test-decision-123',
        question: 'Should we have pizza for lunch?',
        status: 'open',
        yesVotes: 5,
        noVotes: 3,
    };

    const mockArguments = [
        { id: 'arg-1', text: 'Delicious', type: 'pro', votes: 10, authorId: 'other-user', authorName: 'Alice' },
        { id: 'arg-2', text: 'Quick', type: 'pro', votes: 5, authorId: 'other-user', authorName: 'Alice' },
        { id: 'arg-3', text: 'Expensive', type: 'con', votes: 3, authorId: 'other-user', authorName: 'Bob' },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();

        useUser.mockReturnValue({
            user: { userId: 'test-user-id', displayName: 'Test User' },
            setDisplayName: vi.fn()
        });

        mockSubscribeToDecision.mockImplementation((id, callback) => {
            callback(mockDecision);
            return () => { };
        });

        mockSubscribeToArguments.mockImplementation((id, callback) => {
            callback(mockArguments);
            return vi.fn();
        });

        mockSubscribeToFinalVotes.mockImplementation((id, callback) => {
            callback([]);
            return vi.fn();
        });

        EncryptionService.importKey.mockResolvedValue('mock-key');
        EncryptionService.decrypt.mockImplementation((text) => Promise.resolve(text.replace('encrypted-', '')));
        EncryptionService.encrypt.mockImplementation((text) => Promise.resolve('encrypted-' + text));

        ParticipantService.subscribeToParticipants.mockImplementation((id, key, callback) => {
            callback(new Map());
            return vi.fn();
        });
        ParticipantService.registerParticipant.mockResolvedValue();
    });

    describe('View Results (US-005)', () => {
        it('displays decision question in hero', async () => {
            renderDecision();
            await waitFor(() => {
                expect(screen.getByText('Should we have pizza for lunch?')).toBeInTheDocument();
            });
        });

        it('displays statement cards for arguments', async () => {
            renderDecision();
            await waitFor(() => {
                expect(screen.getByText('Delicious')).toBeInTheDocument();
                expect(screen.getByText('Quick')).toBeInTheDocument();
                expect(screen.getByText('Expensive')).toBeInTheDocument();
            });
        });

        it('shows loading state initially', () => {
            mockSubscribeToDecision.mockImplementation(() => () => { });
            mockSubscribeToArguments.mockImplementation(() => () => { });
            mockSubscribeToFinalVotes.mockImplementation(() => () => { });
            ParticipantService.subscribeToParticipants.mockImplementation(() => () => { });

            renderDecision();
            expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();
        });

        it('shows not found state when decision does not exist', async () => {
            mockSubscribeToDecision.mockImplementation((id, callback) => {
                callback(null);
                return () => { };
            });

            renderDecision();
            await waitFor(() => {
                expect(screen.getByText(/decision not found/i)).toBeInTheDocument();
            });
        });
    });

    describe('Encrypted View', () => {
        it('decrypts decision data when key is present', async () => {
            const encryptedDecision = { ...mockDecision, question: 'encrypted-Secret Question' };
            const encryptedArgs = [
                { id: 'arg-1', text: 'encrypted-Secret Arg', type: 'pro', votes: 1, authorId: 'other', authorName: 'encrypted-Alice' }
            ];

            mockSubscribeToDecision.mockImplementation((id, callback) => {
                callback(encryptedDecision);
                return () => { };
            });
            mockSubscribeToArguments.mockImplementation((id, callback) => {
                callback(encryptedArgs);
                return () => { };
            });

            renderDecision('/d/test-id#key=mock-key-string');

            await waitFor(() => {
                expect(EncryptionService.importKey).toHaveBeenCalledWith('mock-key-string');
                expect(EncryptionService.decrypt).toHaveBeenCalledWith('encrypted-Secret Question', 'mock-key');
                expect(screen.getByText('Secret Question')).toBeInTheDocument();
                expect(screen.getByText('Secret Arg')).toBeInTheDocument();
            });
        });

        it('handles decryption failure gracefully', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            const encryptedDecision = { ...mockDecision, question: 'encrypted-Bad Data' };

            mockSubscribeToDecision.mockImplementation((id, callback) => {
                callback(encryptedDecision);
                return () => { };
            });

            EncryptionService.decrypt.mockRejectedValue(new Error("Decryption failed"));

            renderDecision('/d/test-id#key=mock-key-string');

            await waitFor(() => {
                expect(screen.getAllByText('[Decryption Failed]').length).toBeGreaterThan(0);
            });
            consoleSpy.mockRestore();
        });

        it('subscribes to participant map with encryption key', async () => {
            renderDecision('/d/test-id#key=mock-key-string');

            await waitFor(() => {
                expect(ParticipantService.subscribeToParticipants).toHaveBeenCalled();
            });
        });
    });

    describe('Share Decision (US-002)', () => {
        it('displays FAB for sharing', async () => {
            renderDecision();
            await waitFor(() => {
                expect(screen.getByLabelText('Copy Link')).toBeInTheDocument();
            });
        });

        it('copies link to clipboard when FAB clicked', async () => {
            const user = userEvent.setup();
            const writeTextMock = vi.fn();
            navigator.clipboard.writeText = writeTextMock;

            renderDecision();
            await waitFor(() => {
                expect(screen.getByLabelText('Copy Link')).toBeInTheDocument();
            });

            await user.click(screen.getByLabelText('Copy Link'));
            expect(writeTextMock).toHaveBeenCalled();
        });

        it('shows confirmation toast after copying link', async () => {
            const user = userEvent.setup();
            navigator.clipboard.writeText = vi.fn();

            renderDecision();
            await waitFor(() => {
                expect(screen.getByLabelText('Copy Link')).toBeInTheDocument();
            });

            await user.click(screen.getByLabelText('Copy Link'));

            await waitFor(() => {
                expect(screen.getByText(/link copied/i)).toBeInTheDocument();
            });
        });
    });

    describe('Close Decision (US-006)', () => {
        it('shows decision closed banner when closed', async () => {
            mockSubscribeToDecision.mockImplementation((id, callback) => {
                callback({ ...mockDecision, status: 'closed' });
                return () => { };
            });

            renderDecision();
            await waitFor(() => {
                expect(screen.getByText(/decision closed/i)).toBeInTheDocument();
            });
        });

        it('shows approved result when yes votes win', async () => {
            mockSubscribeToDecision.mockImplementation((id, callback) => {
                callback({ ...mockDecision, status: 'closed', yesVotes: 10, noVotes: 3 });
                return () => { };
            });

            renderDecision();
            await waitFor(() => {
                expect(screen.getByText(/approved/i)).toBeInTheDocument();
            });
        });

        it('shows rejected result when no votes win', async () => {
            mockSubscribeToDecision.mockImplementation((id, callback) => {
                callback({ ...mockDecision, status: 'closed', yesVotes: 2, noVotes: 8 });
                return () => { };
            });

            renderDecision();
            await waitFor(() => {
                expect(screen.getByText(/rejected/i)).toBeInTheDocument();
            });
        });
    });

    describe('Final Vote (US-008)', () => {
        it('displays thumbs up/down vote buttons', async () => {
            renderDecision();
            await waitFor(() => {
                expect(screen.getByLabelText('Yes')).toBeInTheDocument();
                expect(screen.getByLabelText('No')).toBeInTheDocument();
            });
        });

        it('casts yes vote when thumbs up clicked', async () => {
            const user = userEvent.setup();
            mockVoteDecision.mockResolvedValue({ success: true });

            renderDecision();
            await waitFor(() => {
                expect(screen.getByLabelText('Yes')).toBeInTheDocument();
            });

            await user.click(screen.getByLabelText('Yes'));

            await waitFor(() => {
                expect(mockVoteDecision).toHaveBeenCalledWith('test-decision-123', 'yes', 'Test User');
            });
        });

        it('casts no vote when thumbs down clicked', async () => {
            const user = userEvent.setup();
            mockVoteDecision.mockResolvedValue({ success: true });

            renderDecision();
            await waitFor(() => {
                expect(screen.getByLabelText('No')).toBeInTheDocument();
            });

            await user.click(screen.getByLabelText('No'));

            await waitFor(() => {
                expect(mockVoteDecision).toHaveBeenCalledWith('test-decision-123', 'no', 'Test User');
            });
        });

        it('persists vote to localStorage', async () => {
            const user = userEvent.setup();
            mockVoteDecision.mockResolvedValue({ success: true });

            renderDecision();
            await waitFor(() => {
                expect(screen.getByLabelText('Yes')).toBeInTheDocument();
            });

            await user.click(screen.getByLabelText('Yes'));

            await waitFor(() => {
                expect(localStorage.getItem('decision_vote_test-decision-123')).toBe('yes');
            });
        });

        it('disables voting when decision is closed', async () => {
            mockSubscribeToDecision.mockImplementation((id, callback) => {
                callback({ ...mockDecision, status: 'closed' });
                return () => { };
            });

            renderDecision();
            await waitFor(() => {
                expect(screen.getByLabelText('Yes')).toBeDisabled();
                expect(screen.getByLabelText('No')).toBeDisabled();
            });
        });

        it('handles voting error gracefully', async () => {
            const user = userEvent.setup();
            mockVoteDecision.mockRejectedValue(new Error('Network error'));

            renderDecision();
            await waitFor(() => {
                expect(screen.getByLabelText('Yes')).toBeInTheDocument();
            });

            await user.click(screen.getByLabelText('Yes'));

            await waitFor(() => {
                expect(screen.getByText('Failed to cast vote.')).toBeInTheDocument();
            });
        });
    });

    describe('Column Layout', () => {
        it('displays column headers for pro and con', async () => {
            renderDecision();
            await waitFor(() => {
                expect(screen.getByText('Add pro')).toBeInTheDocument();
                expect(screen.getByText('Add contra')).toBeInTheDocument();
            });
        });

        it('opens floating input when add pro button clicked', async () => {
            const user = userEvent.setup();
            renderDecision();

            await waitFor(() => {
                expect(screen.getByLabelText('Add pro')).toBeInTheDocument();
            });

            await user.click(screen.getByLabelText('Add pro'));

            await waitFor(() => {
                expect(screen.getByPlaceholderText('Add a Pro...')).toBeInTheDocument();
            });
        });

        it('opens floating input when add con button clicked', async () => {
            const user = userEvent.setup();
            renderDecision();

            await waitFor(() => {
                expect(screen.getByLabelText('Add contra')).toBeInTheDocument();
            });

            await user.click(screen.getByLabelText('Add contra'));

            await waitFor(() => {
                expect(screen.getByPlaceholderText('Add a Con...')).toBeInTheDocument();
            });
        });
    });

    describe('Real-time Updates', () => {
        it('subscribes to decision updates on mount', async () => {
            renderDecision();
            await waitFor(() => {
                expect(mockSubscribeToDecision).toHaveBeenCalledWith('test-decision-123', expect.any(Function));
            });
        });

        it('subscribes to arguments updates on mount', async () => {
            renderDecision();
            await waitFor(() => {
                expect(mockSubscribeToArguments).toHaveBeenCalledWith('test-decision-123', expect.any(Function));
            });
        });

        it('unsubscribes on unmount', async () => {
            const unsubscribeDecision = vi.fn();
            const unsubscribeArguments = vi.fn();
            const unsubscribeFinalVotes = vi.fn();
            const unsubscribeParticipants = vi.fn();

            mockSubscribeToDecision.mockReturnValue(unsubscribeDecision);
            mockSubscribeToArguments.mockReturnValue(unsubscribeArguments);
            mockSubscribeToFinalVotes.mockReturnValue(unsubscribeFinalVotes);
            ParticipantService.subscribeToParticipants.mockImplementation(() => unsubscribeParticipants);

            const { unmount } = renderDecision('/d/test-id#key=mock-key-string');

            await waitFor(() => {
                expect(mockSubscribeToDecision).toHaveBeenCalled();
            });

            await waitFor(() => {
                expect(ParticipantService.subscribeToParticipants).toHaveBeenCalled();
            });

            unmount();

            expect(unsubscribeDecision).toHaveBeenCalled();
            expect(unsubscribeArguments).toHaveBeenCalled();
            expect(unsubscribeFinalVotes).toHaveBeenCalled();
            expect(unsubscribeParticipants).toHaveBeenCalled();
        });
    });
});
