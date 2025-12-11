import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ArgumentItem from './ArgumentItem';

// Mock the firebase module
vi.mock('../services/firebase', () => ({
    voteArgument: vi.fn(),
    subscribeToArgumentVotes: vi.fn(),
}));

import { voteArgument as mockVoteArgument, subscribeToArgumentVotes as mockSubscribeToArgumentVotes } from '../services/firebase';

// Mock UserContext
vi.mock('../contexts/UserContext', async () => {
    return {
        useUser: vi.fn(() => ({
            user: { userId: 'test-user-id', displayName: 'Test User' }
        }))
    };
});

describe('ArgumentItem Component', () => {
    const mockDecisionId = 'test-decision-123';
    const mockArgument = {
        id: 'arg-1',
        text: 'Test Argument',
        authorName: 'Author',
        votes: 0
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Default mock implementation for subscription
        mockSubscribeToArgumentVotes.mockImplementation((decisionId, argumentId, callback) => {
            callback([]); // No votes initially
            return vi.fn(); // Unsubscribe function
        });
    });

    it('renders argument text and author', () => {
        render(<ArgumentItem argument={mockArgument} decisionId={mockDecisionId} readOnly={false} canVote={true} />);

        expect(screen.getByText('Test Argument')).toBeInTheDocument();
        expect(screen.getByText(/Added by Author/)).toBeInTheDocument();
    });

    it('displays vote button', () => {
        render(<ArgumentItem argument={mockArgument} decisionId={mockDecisionId} readOnly={false} canVote={true} />);

        const voteButton = screen.getByRole('button', { name: /Vote/i });
        expect(voteButton).toBeInTheDocument();
        expect(voteButton).not.toBeDisabled();
    });

    it('handles voting', async () => {
        const user = userEvent.setup();
        mockVoteArgument.mockResolvedValue({ success: true });

        render(<ArgumentItem argument={mockArgument} decisionId={mockDecisionId} readOnly={false} canVote={true} />);

        const voteButton = screen.getByRole('button', { name: /Vote/i });
        await user.click(voteButton);

        expect(mockVoteArgument).toHaveBeenCalledWith(mockDecisionId, mockArgument.id, 'Test User');
    });

    it('displays voter chips', () => {
        const mockVotes = [
            { userId: 'user-1', displayName: 'Alice' },
            { userId: 'user-2', displayName: 'Bob' }
        ];

        mockSubscribeToArgumentVotes.mockImplementation((decisionId, argumentId, callback) => {
            callback(mockVotes);
            return vi.fn();
        });

        render(<ArgumentItem argument={mockArgument} decisionId={mockDecisionId} readOnly={false} canVote={true} />);

        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('shows "Voted" state when user has voted', () => {
        const mockVotes = [
            { userId: 'test-user-id', displayName: 'Test User' }
        ];

        mockSubscribeToArgumentVotes.mockImplementation((decisionId, argumentId, callback) => {
            callback(mockVotes);
            return vi.fn();
        });

        render(<ArgumentItem argument={mockArgument} decisionId={mockDecisionId} readOnly={false} canVote={true} />);

        const voteButton = screen.getByRole('button', { name: /Voted \(1\)/i });
        expect(voteButton).toBeInTheDocument();
        // Should still be enabled to allow unvoting (though unvote logic is same as vote logic in backend currently)
        expect(voteButton).not.toBeDisabled();
    });

    it('disables voting in read-only mode', () => {
        render(<ArgumentItem argument={mockArgument} decisionId={mockDecisionId} readOnly={true} canVote={true} />);

        const voteButton = screen.getByRole('button');
        expect(voteButton).toBeDisabled();
    });

    it('disables voting when limit reached (canVote=false) and user has not voted', () => {
        render(<ArgumentItem argument={mockArgument} decisionId={mockDecisionId} readOnly={false} canVote={false} />);

        const voteButton = screen.getByRole('button');
        expect(voteButton).toBeDisabled();
    });

    it('allows unvoting even when limit reached (canVote=false) if user has voted', () => {
        const mockVotes = [
            { userId: 'test-user-id', displayName: 'Test User' }
        ];

        mockSubscribeToArgumentVotes.mockImplementation((decisionId, argumentId, callback) => {
            callback(mockVotes);
            return vi.fn();
        });

        render(<ArgumentItem argument={mockArgument} decisionId={mockDecisionId} readOnly={false} canVote={false} />);

        const voteButton = screen.getByRole('button');
        expect(voteButton).not.toBeDisabled();
    });
});
