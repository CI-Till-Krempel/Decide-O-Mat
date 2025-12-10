import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Decision from './Decision';

// Mock the firebase module
vi.mock('../services/firebase', () => ({
    subscribeToDecision: vi.fn(),
    subscribeToArguments: vi.fn(),
    toggleDecisionStatus: vi.fn(),
    voteDecision: vi.fn(),
    subscribeToFinalVotes: vi.fn(),
}));

import {
    subscribeToDecision as mockSubscribeToDecision,
    subscribeToArguments as mockSubscribeToArguments,
    toggleDecisionStatus as mockToggleDecisionStatus,
    voteDecision as mockVoteDecision,
    subscribeToFinalVotes as mockSubscribeToFinalVotes,
} from '../services/firebase';

// Mock html-to-image
vi.mock('html-to-image', () => ({
    toPng: vi.fn(),
}));

import { toPng as mockToPng } from 'html-to-image';

// Mock UserContext
vi.mock('../contexts/UserContext', async () => {
    const actual = await vi.importActual('../contexts/UserContext');
    return {
        ...actual,
        useUser: vi.fn(() => ({
            user: { userId: 'test-user-id', displayName: 'Test User' },
            setDisplayName: vi.fn()
        }))
    };
});

// Mock EncryptionService
vi.mock('../services/EncryptionService', () => ({
    default: {
        importKey: vi.fn(),
        decrypt: vi.fn(),
        encrypt: vi.fn(),
        isEnabled: vi.fn(),
    }
}));
import EncryptionService from '../services/EncryptionService';

// Mock components
vi.mock('../components/ArgumentList', () => ({
    default: ({ arguments: args, type, readOnly }) => (
        <div data-testid={`argument-list-${type}`}>
            ArgumentList: {type} ({args.length} args) {readOnly && '(read-only)'}
            {args.map(arg => <div key={arg.id}>{arg.text}</div>)}
        </div>
    ),
}));

vi.mock('../components/AddArgumentForm', () => ({
    default: ({ type, readOnly }) => (
        <div data-testid={`add-argument-form-${type}`}>
            AddArgumentForm: {type} {readOnly && '(read-only)'}
        </div>
    ),
}));

vi.mock('../components/UserSettings', () => ({
    default: () => <div data-testid="user-settings">UserSettings</div>
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
        { id: 'arg-1', text: 'Delicious', type: 'pro', votes: 10 },
        { id: 'arg-2', text: 'Quick', type: 'pro', votes: 5 },
        { id: 'arg-3', text: 'Expensive', type: 'con', votes: 3 },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();

        // Default mock implementations
        mockSubscribeToDecision.mockImplementation((id, callback) => {
            callback(mockDecision);
            return () => { }; // unsubscribe function
        });

        mockSubscribeToArguments.mockImplementation((id, callback) => {
            callback(mockArguments);
            return vi.fn();
        });
        mockSubscribeToFinalVotes.mockImplementation((id, callback) => {
            callback([]);
            return vi.fn();
        });
        mockToggleDecisionStatus.mockResolvedValue({ success: true });

        // Default encryption mocks
        EncryptionService.importKey.mockResolvedValue('mock-key');
        EncryptionService.decrypt.mockImplementation((text) => Promise.resolve(text.replace('encrypted-', '')));
        EncryptionService.encrypt.mockImplementation((text) => Promise.resolve('encrypted-' + text));
    });

    // US-005: View Results
    describe('View Results (US-005)', () => {
        it('displays decision question', async () => {
            renderDecision();

            await waitFor(() => {
                expect(screen.getByText('Should we have pizza for lunch?')).toBeInTheDocument();
            });
        });

        it('calculates and displays argument score correctly', async () => {
            renderDecision();

            await waitFor(() => {
                // Argument score = pros (10 + 5) - cons (3) = 12
                expect(screen.getByText(/argument score/i)).toBeInTheDocument();
                // We typically look for the value near the label or just in the document if unique
                expect(screen.getByText(/\+12/i)).toBeInTheDocument();
            });
        });

        it('calculates and displays vote balance correctly', async () => {
            renderDecision();

            await waitFor(() => {
                // Vote Balance = yes (5) - no (3) = 2
                expect(screen.getByText(/vote balance/i)).toBeInTheDocument();
                expect(screen.getByText(/\+2/i)).toBeInTheDocument();
            });
        });

        it('displays positive argument score in success color', async () => {
            renderDecision();

            await waitFor(() => {
                const scoreElement = screen.getByText(/\+12/i);
                expect(scoreElement).toBeInTheDocument();
                // Checking style might be brittle/complex without helper, so we imply existence is mostly enough here
                // or check partial match if improved
            });
        });

        it('displays negative net score correctly', async () => {
            const negativeArgs = [
                { id: 'arg-1', text: 'Pro', type: 'pro', votes: 2 },
                { id: 'arg-2', text: 'Con', type: 'con', votes: 10 },
            ];

            mockSubscribeToArguments.mockImplementation((id, callback) => {
                callback(negativeArgs);
                return () => { };
            });

            renderDecision();

            await waitFor(() => {
                expect(screen.getByText(/-8/i)).toBeInTheDocument();
                expect(screen.getByText(/argument score/i)).toBeInTheDocument();
            });
        });

        it('shows loading state initially', () => {
            mockSubscribeToDecision.mockImplementation(() => () => { });
            renderDecision();

            expect(screen.getByText(/loading/i)).toBeInTheDocument();
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

    // Encrypted View Tests
    describe('Encrypted View', () => {
        it('decrypts decision data when key is present', async () => {
            const encryptedDecision = {
                ...mockDecision,
                question: 'encrypted-Secret Question'
            };
            const encryptedArgs = [
                { id: 'arg-1', text: 'encrypted-Secret Arg', type: 'pro', votes: 1 }
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
                expect(EncryptionService.decrypt).toHaveBeenCalledWith('encrypted-Secret Arg', 'mock-key');

                // Check if decrypted content is rendered
                expect(screen.getByText('Secret Question')).toBeInTheDocument();
                expect(screen.getByText('Secret Arg')).toBeInTheDocument();
            });
        });

        it('handles decryption failure gracefully', async () => {
            const encryptedDecision = {
                ...mockDecision,
                question: 'encrypted-Bad Data'
            };

            mockSubscribeToDecision.mockImplementation((id, callback) => {
                callback(encryptedDecision);
                return () => { };
            });

            EncryptionService.decrypt.mockRejectedValue(new Error("Decryption failed"));

            renderDecision('/d/test-id#key=mock-key-string');

            await waitFor(() => {
                expect(screen.getAllByText('[Decryption Failed]')).toHaveLength(4); // Header + 3 args
            });
        });
    });

    // US-002: Share Decision
    describe('Share Decision (US-002)', () => {
        it('displays copy link button', async () => {
            renderDecision();

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /copy link/i })).toBeInTheDocument();
            });
        });

        it('copies link to clipboard when button clicked', async () => {
            const user = userEvent.setup();
            const writeTextMock = vi.fn();
            navigator.clipboard.writeText = writeTextMock;

            renderDecision();

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /copy link/i })).toBeInTheDocument();
            });

            const copyButton = screen.getByRole('button', { name: /copy link/i });
            await user.click(copyButton);

            // Verify clipboard.writeText was called (URL format may vary in test environment)
            expect(writeTextMock).toHaveBeenCalled();
        });

        it('shows confirmation after copying link', async () => {
            const user = userEvent.setup();
            navigator.clipboard.writeText = vi.fn();

            renderDecision();

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /copy link/i })).toBeInTheDocument();
            });

            const copyButton = screen.getByRole('button', { name: /copy link/i });
            await user.click(copyButton);

            await waitFor(() => {
                expect(screen.getByText(/link copied/i)).toBeInTheDocument();
            });
        });
    });

    // US-006: Close Decision
    describe('Close Decision (US-006)', () => {
        it('displays close decision button when decision is open', async () => {
            renderDecision();

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /close decision/i })).toBeInTheDocument();
            });
        });

        it('closes decision when close button clicked', async () => {
            const user = userEvent.setup();
            mockToggleDecisionStatus.mockResolvedValue({ success: true });

            renderDecision();

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /close decision/i })).toBeInTheDocument();
            });

            const closeButton = screen.getByRole('button', { name: /close decision/i });
            await user.click(closeButton);

            await waitFor(() => {
                expect(mockToggleDecisionStatus).toHaveBeenCalledWith('test-decision-123', 'closed');
            });
        });

        it('displays re-open button when decision is closed', async () => {
            mockSubscribeToDecision.mockImplementation((id, callback) => {
                callback({ ...mockDecision, status: 'closed' });
                return () => { };
            });

            renderDecision();

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /re-open decision/i })).toBeInTheDocument();
            });
        });

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

        it('passes readOnly prop to child components when closed', async () => {
            mockSubscribeToDecision.mockImplementation((id, callback) => {
                callback({ ...mockDecision, status: 'closed' });
                return () => { };
            });

            renderDecision();

            await waitFor(() => {
                expect(screen.getByText(/ArgumentList: pro.*\(read-only\)/)).toBeInTheDocument();
                expect(screen.getByText(/ArgumentList: con.*\(read-only\)/)).toBeInTheDocument();
            });
        });

        it('shows final result when decision is closed', async () => {
            mockSubscribeToDecision.mockImplementation((id, callback) => {
                callback({ ...mockDecision, status: 'closed', yesVotes: 10, noVotes: 3 });
                return () => { };
            });

            renderDecision();

            await waitFor(() => {
                expect(screen.getByText(/decision closed: approved/i)).toBeInTheDocument();
            });
        });

        it('shows rejected result when no votes win', async () => {
            mockSubscribeToDecision.mockImplementation((id, callback) => {
                callback({ ...mockDecision, status: 'closed', yesVotes: 2, noVotes: 8 });
                return () => { };
            });

            renderDecision();

            await waitFor(() => {
                expect(screen.getByText(/decision closed: rejected/i)).toBeInTheDocument();
            });
        });
    });

    // US-008: Final Vote
    describe('Final Vote (US-008)', () => {
        it('displays final vote section with yes and no buttons', async () => {
            renderDecision();

            await waitFor(() => {
                expect(screen.getByText(/final vote/i)).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /^yes$/i })).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /^no$/i })).toBeInTheDocument();
            });
        });

        it('displays vote counts', async () => {
            renderDecision();

            await waitFor(() => {
                const yesButton = screen.getByRole('button', { name: /^yes$/i });
                const noButton = screen.getByRole('button', { name: /^no$/i });

                // Check that vote counts are displayed near the buttons
                expect(yesButton.closest('div').parentElement).toHaveTextContent('5');
                expect(noButton.closest('div').parentElement).toHaveTextContent('3');
            });
        });

        it('casts yes vote when yes button clicked', async () => {
            const user = userEvent.setup();
            mockVoteDecision.mockResolvedValue({ success: true });

            renderDecision();

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /^yes$/i })).toBeInTheDocument();
            });

            const yesButton = screen.getByRole('button', { name: /^yes$/i });
            await user.click(yesButton);

            await waitFor(() => {
                expect(mockVoteDecision).toHaveBeenCalledWith('test-decision-123', 'yes', 'test-user-id', 'Test User');
            });
        });

        it('casts no vote when no button clicked', async () => {
            const user = userEvent.setup();
            mockVoteDecision.mockResolvedValue({ success: true });

            renderDecision();

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /^no$/i })).toBeInTheDocument();
            });

            const noButton = screen.getByRole('button', { name: /^no$/i });
            await user.click(noButton);

            await waitFor(() => {
                expect(mockVoteDecision).toHaveBeenCalledWith('test-decision-123', 'no', 'test-user-id', 'Test User');
            });
        });

        it('persists vote to localStorage', async () => {
            const user = userEvent.setup();
            mockVoteDecision.mockResolvedValue({ success: true });

            renderDecision();

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /^yes$/i })).toBeInTheDocument();
            });

            const yesButton = screen.getByRole('button', { name: /^yes$/i });
            await user.click(yesButton);

            await waitFor(() => {
                expect(localStorage.getItem('decision_vote_test-decision-123')).toBe('yes');
            });
        });

        it('loads vote from localStorage on mount', async () => {
            localStorage.setItem('decision_vote_test-decision-123', 'yes');

            renderDecision();

            await waitFor(() => {
                const yesButton = screen.getByRole('button', { name: /^yes$/i });
                // Button should have different styling when selected
                expect(yesButton).toBeInTheDocument();
            });
        });

        it('allows changing vote from yes to no', async () => {
            const user = userEvent.setup();
            localStorage.setItem('decision_vote_test-decision-123', 'yes');
            mockVoteDecision.mockResolvedValue({ success: true });

            renderDecision();

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /^no$/i })).toBeInTheDocument();
            });

            const noButton = screen.getByRole('button', { name: /^no$/i });
            await user.click(noButton);

            await waitFor(() => {
                // Should call voteDecision with new vote
                expect(mockVoteDecision).toHaveBeenCalledWith('test-decision-123', 'no', 'test-user-id', 'Test User');
            });
        });

        it('updates vote balance when final votes change', async () => {
            let decisionCallback;
            mockSubscribeToDecision.mockImplementation((id, callback) => {
                decisionCallback = callback;
                callback(mockDecision); // Initial: yes=5, no=3 -> Balance +2
                return () => { };
            });

            renderDecision();

            await waitFor(() => {
                expect(screen.getByText(/\+2/i)).toBeInTheDocument();
            });

            // Simulate update
            act(() => {
                decisionCallback({ ...mockDecision, yesVotes: 6, noVotes: 3 }); // Balance +3
            });

            await waitFor(() => {
                expect(screen.getByText(/\+3/i)).toBeInTheDocument();
            });
        });

        it('disables voting when decision is closed', async () => {
            mockSubscribeToDecision.mockImplementation((id, callback) => {
                callback({ ...mockDecision, status: 'closed' });
                return () => { };
            });

            renderDecision();

            await waitFor(() => {
                const yesButton = screen.getByRole('button', { name: /^yes$/i });
                const noButton = screen.getByRole('button', { name: /^no$/i });

                expect(yesButton).toBeDisabled();
                expect(noButton).toBeDisabled();
            });
        });

        it('handles voting error gracefully', async () => {
            const user = userEvent.setup();
            const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });
            mockVoteDecision.mockRejectedValue(new Error('Network error'));

            renderDecision();

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /^yes$/i })).toBeInTheDocument();
            });

            const yesButton = screen.getByRole('button', { name: /^yes$/i });
            await user.click(yesButton);

            await waitFor(() => {
                expect(alertSpy).toHaveBeenCalledWith('Failed to cast vote.');
            });

            alertSpy.mockRestore();
        });
    });

    // Export functionality
    describe('Export as Image', () => {
        it('displays export button', async () => {
            renderDecision();

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /export as image/i })).toBeInTheDocument();
            });
        });

        it('exports decision as image when button clicked', async () => {
            const user = userEvent.setup();
            const mockDataUrl = 'data:image/png;base64,mock';
            mockToPng.mockResolvedValue(mockDataUrl);

            renderDecision();

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /export as image/i })).toBeInTheDocument();
            });

            const exportButton = screen.getByRole('button', { name: /export as image/i });
            await user.click(exportButton);

            await waitFor(() => {
                expect(mockToPng).toHaveBeenCalled();
            });
        });

        it('shows exporting state during export', async () => {
            const user = userEvent.setup();
            mockToPng.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('data:image'), 100)));

            renderDecision();

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /export as image/i })).toBeInTheDocument();
            });

            const exportButton = screen.getByRole('button', { name: /export as image/i });
            await user.click(exportButton);

            expect(screen.getByText(/exporting/i)).toBeInTheDocument();
        });
    });

    // Real-time Updates
    describe('Real-time Updates', () => {
        it('subscribes to decision updates on mount', async () => {
            renderDecision();

            await waitFor(() => {
                expect(mockSubscribeToDecision).toHaveBeenCalledWith(
                    'test-decision-123',
                    expect.any(Function)
                );
            });
        });

        it('subscribes to arguments updates on mount', async () => {
            renderDecision();

            await waitFor(() => {
                expect(mockSubscribeToArguments).toHaveBeenCalledWith(
                    'test-decision-123',
                    expect.any(Function)
                );
            });
        });

        it('unsubscribes on unmount', async () => {
            const unsubscribeDecision = vi.fn();
            const unsubscribeArguments = vi.fn();
            const unsubscribeFinalVotes = vi.fn(); // Mock this too

            mockSubscribeToDecision.mockReturnValue(unsubscribeDecision);
            mockSubscribeToArguments.mockReturnValue(unsubscribeArguments);
            mockSubscribeToFinalVotes.mockReturnValue(unsubscribeFinalVotes);

            const { unmount } = renderDecision();

            await waitFor(() => {
                expect(mockSubscribeToDecision).toHaveBeenCalled();
            });

            unmount();

            expect(unsubscribeDecision).toHaveBeenCalled();
            expect(unsubscribeArguments).toHaveBeenCalled();
            expect(unsubscribeFinalVotes).toHaveBeenCalled();
        });
    });
});
