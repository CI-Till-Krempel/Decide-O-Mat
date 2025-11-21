import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ArgumentList from './ArgumentList';

// Mock the firebase module
vi.mock('../services/firebase', () => ({
    voteArgument: vi.fn(),
}));

import { voteArgument as mockVoteArgument } from '../services/firebase';

describe('ArgumentList Component', () => {
    const mockDecisionId = 'test-decision-123';
    const mockTitle = 'Should we have pizza?';

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('renders empty state when no arguments', () => {
        render(
            <ArgumentList
                arguments={[]}
                type="pro"
                title={mockTitle}
                decisionId={mockDecisionId}
                readOnly={false}
            />
        );

        expect(screen.getByText(/pros for/i)).toBeInTheDocument();
        expect(screen.getByText(/no arguments yet/i)).toBeInTheDocument();
    });

    it('renders list of pro arguments', () => {
        const mockArgs = [
            { id: '1', text: 'Delicious', votes: 5 },
            { id: '2', text: 'Quick delivery', votes: 3 },
        ];

        render(
            <ArgumentList
                arguments={mockArgs}
                type="pro"
                title={mockTitle}
                decisionId={mockDecisionId}
                readOnly={false}
            />
        );

        expect(screen.getByText('Delicious')).toBeInTheDocument();
        expect(screen.getByText('Quick delivery')).toBeInTheDocument();
        // Votes are displayed, but myVotes only shows when > 0
        expect(screen.getByText(/5/)).toBeInTheDocument();
        expect(screen.getByText(/3/)).toBeInTheDocument();
    });

    it('renders list of con arguments', () => {
        const mockArgs = [
            { id: '1', text: 'Expensive', votes: 2 },
        ];

        render(
            <ArgumentList
                arguments={mockArgs}
                type="con"
                title={mockTitle}
                decisionId={mockDecisionId}
                readOnly={false}
            />
        );

        expect(screen.getByText(/cons for/i)).toBeInTheDocument();
        expect(screen.getByText('Expensive')).toBeInTheDocument();
    });

    it('sorts arguments by vote count (descending)', () => {
        const mockArgs = [
            { id: '1', text: 'Low votes', votes: 2 },
            { id: '2', text: 'High votes', votes: 10 },
            { id: '3', text: 'Medium votes', votes: 5 },
        ];

        render(
            <ArgumentList
                arguments={mockArgs}
                type="pro"
                title={mockTitle}
                decisionId={mockDecisionId}
                readOnly={false}
            />
        );

        const items = screen.getAllByRole('listitem');
        expect(items[0]).toHaveTextContent('High votes');
        expect(items[1]).toHaveTextContent('Medium votes');
        expect(items[2]).toHaveTextContent('Low votes');
    });

    it('handles upvoting an argument', async () => {
        const user = userEvent.setup();
        mockVoteArgument.mockResolvedValue({ success: true });

        const mockArgs = [
            { id: 'arg-1', text: 'Great idea', votes: 5 },
        ];

        render(
            <ArgumentList
                arguments={mockArgs}
                type="pro"
                title={mockTitle}
                decisionId={mockDecisionId}
                readOnly={false}
            />
        );

        const upvoteButton = screen.getAllByText('+')[0];
        await user.click(upvoteButton);

        await waitFor(() => {
            expect(mockVoteArgument).toHaveBeenCalledWith(mockDecisionId, 'arg-1', 1);
        });
    });

    it('handles downvoting an argument', async () => {
        const user = userEvent.setup();
        mockVoteArgument.mockResolvedValue({ success: true });

        // Set up localStorage to simulate user has voted
        const storageKey = `votes_${mockDecisionId}_pro`;
        localStorage.setItem(storageKey, JSON.stringify([['arg-1', 2]]));

        const mockArgs = [
            { id: 'arg-1', text: 'Great idea', votes: 5 },
        ];

        render(
            <ArgumentList
                arguments={mockArgs}
                type="pro"
                title={mockTitle}
                decisionId={mockDecisionId}
                readOnly={false}
            />
        );

        const downvoteButton = screen.getAllByText('−')[0];
        await user.click(downvoteButton);

        await waitFor(() => {
            expect(mockVoteArgument).toHaveBeenCalledWith(mockDecisionId, 'arg-1', -1);
        });
    });

    it('displays vote limit correctly', () => {
        const mockArgs = [
            { id: '1', text: 'Arg 1', votes: 1 },
            { id: '2', text: 'Arg 2', votes: 2 },
            { id: '3', text: 'Arg 3', votes: 3 },
            { id: '4', text: 'Arg 4', votes: 4 },
        ];

        render(
            <ArgumentList
                arguments={mockArgs}
                type="pro"
                title={mockTitle}
                decisionId={mockDecisionId}
                readOnly={false}
            />
        );

        // With 4 arguments, max votes = floor(4/2) = 2
        expect(screen.getByText(/votes used: 0 \/ 2/i)).toBeInTheDocument();
    });

    it('prevents voting when vote limit reached', () => {
        const mockArgs = [
            { id: '1', text: 'Arg 1', votes: 1 },
            { id: '2', text: 'Arg 2', votes: 2 },
        ];

        // Set up localStorage to simulate user has used all votes
        const storageKey = `votes_${mockDecisionId}_pro`;
        localStorage.setItem(storageKey, JSON.stringify([['1', 1]])); // 1 vote used, max is 1

        render(
            <ArgumentList
                arguments={mockArgs}
                type="pro"
                title={mockTitle}
                decisionId={mockDecisionId}
                readOnly={false}
            />
        );

        // When vote limit is reached, upvote buttons should be disabled
        const upvoteButtons = screen.getAllByText('+');

        // Both upvote buttons should be disabled when limit is reached
        upvoteButtons.forEach(button => {
            expect(button).toBeDisabled();
        });
    });

    it('disables voting in read-only mode', () => {
        const mockArgs = [
            { id: '1', text: 'Arg 1', votes: 5 },
        ];

        render(
            <ArgumentList
                arguments={mockArgs}
                type="pro"
                title={mockTitle}
                decisionId={mockDecisionId}
                readOnly={true}
            />
        );

        const upvoteButton = screen.getByText('+');
        const downvoteButton = screen.getByText('−');

        expect(upvoteButton).toBeDisabled();
        expect(downvoteButton).toBeDisabled();
    });

    it('persists votes to localStorage', async () => {
        const user = userEvent.setup();
        mockVoteArgument.mockResolvedValue({ success: true });

        const mockArgs = [
            { id: 'arg-1', text: 'Great idea', votes: 5 },
        ];

        render(
            <ArgumentList
                arguments={mockArgs}
                type="pro"
                title={mockTitle}
                decisionId={mockDecisionId}
                readOnly={false}
            />
        );

        const upvoteButton = screen.getByText('+');
        await user.click(upvoteButton);

        await waitFor(() => {
            const storageKey = `votes_${mockDecisionId}_pro`;
            const stored = localStorage.getItem(storageKey);
            expect(stored).toBeTruthy();
            const voteCounts = new Map(JSON.parse(stored));
            expect(voteCounts.get('arg-1')).toBe(1);
        });
    });

    it('loads votes from localStorage on mount', () => {
        const storageKey = `votes_${mockDecisionId}_pro`;
        localStorage.setItem(storageKey, JSON.stringify([['arg-1', 3]]));

        const mockArgs = [
            { id: 'arg-1', text: 'Great idea', votes: 5 },
        ];

        render(
            <ArgumentList
                arguments={mockArgs}
                type="pro"
                title={mockTitle}
                decisionId={mockDecisionId}
                readOnly={false}
            />
        );

        // Should show "5 (3)" - total votes with my votes in parentheses
        expect(screen.getByText('5 (3)')).toBeInTheDocument();
    });

    it('handles voting error gracefully', async () => {
        const user = userEvent.setup();
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });
        mockVoteArgument.mockRejectedValue(new Error('Network error'));

        const mockArgs = [
            { id: 'arg-1', text: 'Great idea', votes: 5 },
        ];

        render(
            <ArgumentList
                arguments={mockArgs}
                type="pro"
                title={mockTitle}
                decisionId={mockDecisionId}
                readOnly={false}
            />
        );

        const upvoteButton = screen.getByText('+');
        await user.click(upvoteButton);

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith('Failed to vote. Please try again.');
        });

        alertSpy.mockRestore();
    });

    it('disables downvote button when user has not voted', () => {
        const mockArgs = [
            { id: 'arg-1', text: 'Great idea', votes: 5 },
        ];

        render(
            <ArgumentList
                arguments={mockArgs}
                type="pro"
                title={mockTitle}
                decisionId={mockDecisionId}
                readOnly={false}
            />
        );

        const downvoteButton = screen.getByText('−');
        expect(downvoteButton).toBeDisabled();
    });
});
