import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import StatisticsModal from './StatisticsModal';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => {
            const translations = {
                'statisticsModal.title': 'Decision Statistics',
                'statisticsModal.totalVotes': 'Total Votes',
                'statisticsModal.yesVotes': 'Yes',
                'statisticsModal.noVotes': 'No',
                'statisticsModal.voteBalance': 'Vote Balance',
                'statisticsModal.arguments': 'Arguments',
                'statisticsModal.proArguments': 'Pro',
                'statisticsModal.conArguments': 'Con',
                'statisticsModal.topArgument': 'Highest Scoring Argument',
                'statisticsModal.topScore': 'Score',
                'statisticsModal.emptyState': 'No activity recorded for this decision yet.',
                'statisticsModal.close': 'Close',
                'common.close': 'Close',
            };
            return translations[key] || key;
        }
    })
}));

describe('StatisticsModal', () => {
    const mockOnClose = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders empty state when there are no votes and no arguments', () => {
        render(
            <StatisticsModal
                question="Should we adopt TypeScript?"
                finalVotesList={[]}
                argumentsList={[]}
                onClose={mockOnClose}
            />
        );

        expect(screen.getByText('Decision Statistics')).toBeInTheDocument();
        expect(screen.getByText('Should we adopt TypeScript?')).toBeInTheDocument();
        expect(screen.getByText('No activity recorded for this decision yet.')).toBeInTheDocument();
    });

    it('computes and renders voting and argument metrics accurately', () => {
        const votes = [
            { userId: 'u1', vote: 'yes' },
            { userId: 'u2', vote: 'yes' },
            { userId: 'u3', vote: 'yes' },
            { userId: 'u4', vote: 'no' },
        ];

        const argumentsList = [
            { id: 'a1', text: 'Catch bugs early at compile time', type: 'pro', votes: 5 },
            { id: 'a2', text: 'Great IDE autocomplete', type: 'pro', votes: 2 },
            { id: 'a3', text: 'Build step overhead', type: 'con', votes: 1 },
        ];

        render(
            <StatisticsModal
                question="Should we adopt TypeScript?"
                finalVotesList={votes}
                argumentsList={argumentsList}
                onClose={mockOnClose}
            />
        );

        // Total votes
        expect(screen.getByText('Total Votes')).toBeInTheDocument();
        expect(screen.getByText('4')).toBeInTheDocument();
        expect(screen.getByText(/Yes: 3 \(75%\)/)).toBeInTheDocument();
        expect(screen.getByText(/No: 1 \(25%\)/)).toBeInTheDocument();

        // Vote balance (+2)
        expect(screen.getByText('+2')).toBeInTheDocument();

        // Arguments
        expect(screen.getByText('Arguments')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText(/Pro: 2/)).toBeInTheDocument();
        expect(screen.getByText(/Con: 1/)).toBeInTheDocument();

        // Top argument highlight
        expect(screen.getByText('Highest Scoring Argument')).toBeInTheDocument();
        expect(screen.getByText(/Catch bugs early at compile time/)).toBeInTheDocument();
        expect(screen.getByText(/Score: 5/)).toBeInTheDocument();
    });

    it('triggers onClose when close button is clicked', () => {
        render(
            <StatisticsModal
                question="Should we adopt TypeScript?"
                finalVotesList={[]}
                argumentsList={[]}
                onClose={mockOnClose}
            />
        );

        const closeBtns = screen.getAllByRole('button', { name: 'Close' });
        fireEvent.click(closeBtns[0]);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('triggers onClose on Escape key press', () => {
        render(
            <StatisticsModal
                question="Should we adopt TypeScript?"
                finalVotesList={[]}
                argumentsList={[]}
                onClose={mockOnClose}
            />
        );

        fireEvent.keyDown(document, { key: 'Escape' });
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
});
