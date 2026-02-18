import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ElectionHero from './ElectionHero';
import { HERO_MODES } from './ElectionHero.modes';

vi.mock('react-i18next', () => {
    const translations = {
        'decision.voteYes': 'Yes',
        'decision.voteNo': 'No',
        'decision.anonymous': 'Anonymous',
        'decision.resultApproved': 'Approved',
        'decision.resultRejected': 'Rejected',
        'decision.resultNoVotes': 'No Votes',
    };
    return {
        useTranslation: () => ({ t: (key) => translations[key] || key }),
    };
});

const defaultProps = {
    question: 'Should we adopt TypeScript?',
    onVoteYes: vi.fn(),
    onVoteNo: vi.fn(),
    isClosed: false,
    userVote: null,
    votingTarget: null,
    finalResult: null,
    finalVotesList: [],
    participantMap: new Map(),
};

describe('ElectionHero', () => {
    describe('voting mode (default)', () => {
        it('renders the question', () => {
            render(<ElectionHero {...defaultProps} />);
            expect(screen.getByText('Should we adopt TypeScript?')).toBeInTheDocument();
        });

        it('renders vote buttons', () => {
            render(<ElectionHero {...defaultProps} />);
            expect(screen.getByLabelText('Yes')).toBeInTheDocument();
            expect(screen.getByLabelText('No')).toBeInTheDocument();
        });

        it('does not render results section', () => {
            render(<ElectionHero {...defaultProps} />);
            expect(screen.queryByText('Approved')).not.toBeInTheDocument();
            expect(screen.queryByText('Rejected')).not.toBeInTheDocument();
        });

        it('highlights active vote button', () => {
            render(<ElectionHero {...defaultProps} userVote="yes" />);
            const yesBtn = screen.getByLabelText('Yes');
            expect(yesBtn.className).toContain('voteButtonActive');
        });

        it('disables buttons when closed', () => {
            render(<ElectionHero {...defaultProps} isClosed={true} />);
            expect(screen.getByLabelText('Yes')).toBeDisabled();
            expect(screen.getByLabelText('No')).toBeDisabled();
        });

        it('disables buttons when votingTarget is set', () => {
            render(<ElectionHero {...defaultProps} votingTarget="yes" />);
            expect(screen.getByLabelText('Yes')).toBeDisabled();
            expect(screen.getByLabelText('No')).toBeDisabled();
        });

        it('calls onVoteYes when yes button clicked', async () => {
            const onVoteYes = vi.fn();
            const user = userEvent.setup();
            render(<ElectionHero {...defaultProps} onVoteYes={onVoteYes} />);
            await user.click(screen.getByLabelText('Yes'));
            expect(onVoteYes).toHaveBeenCalledTimes(1);
        });

        it('calls onVoteNo when no button clicked', async () => {
            const onVoteNo = vi.fn();
            const user = userEvent.setup();
            render(<ElectionHero {...defaultProps} onVoteNo={onVoteNo} />);
            await user.click(screen.getByLabelText('No'));
            expect(onVoteNo).toHaveBeenCalledTimes(1);
        });
    });

    describe('results mode', () => {
        it('does not render vote buttons', () => {
            render(<ElectionHero {...defaultProps} mode={HERO_MODES.RESULTS} finalResult="Approved" />);
            expect(screen.queryByLabelText('Yes')).not.toBeInTheDocument();
            expect(screen.queryByLabelText('No')).not.toBeInTheDocument();
        });

        it('renders Approved result', () => {
            render(<ElectionHero {...defaultProps} mode={HERO_MODES.RESULTS} finalResult="Approved" />);
            expect(screen.getByText('Approved')).toBeInTheDocument();
        });

        it('renders Rejected result', () => {
            render(<ElectionHero {...defaultProps} mode={HERO_MODES.RESULTS} finalResult="Rejected" />);
            expect(screen.getByText('Rejected')).toBeInTheDocument();
        });

        it('renders No Votes result when finalResult is NoVotes', () => {
            render(<ElectionHero {...defaultProps} mode={HERO_MODES.RESULTS} finalResult="NoVotes" />);
            expect(screen.getByText('No Votes')).toBeInTheDocument();
        });

        it('renders fallback No Votes when finalResult is null', () => {
            render(<ElectionHero {...defaultProps} mode={HERO_MODES.RESULTS} finalResult={null} />);
            expect(screen.getByText('No Votes')).toBeInTheDocument();
        });

        it('renders voter chips in results mode', () => {
            const finalVotesList = [
                { userId: 'u1', vote: 'yes', displayName: 'Alice' },
                { userId: 'u2', vote: 'no', displayName: 'Bob' },
            ];
            render(<ElectionHero {...defaultProps} mode={HERO_MODES.RESULTS} finalResult="Approved" finalVotesList={finalVotesList} />);
            expect(screen.getByText('Alice')).toBeInTheDocument();
            expect(screen.getByText('Bob')).toBeInTheDocument();
        });
    });

    describe('voter chips', () => {
        it('uses participant map name over displayName', () => {
            const participantMap = new Map([['u1', { name: 'Participant Alice' }]]);
            const finalVotesList = [{ userId: 'u1', vote: 'yes', displayName: 'Vote Alice' }];
            render(<ElectionHero {...defaultProps} finalVotesList={finalVotesList} participantMap={participantMap} />);
            expect(screen.getByText('Participant Alice')).toBeInTheDocument();
            expect(screen.queryByText('Vote Alice')).not.toBeInTheDocument();
        });

        it('falls back to Anonymous when no name available', () => {
            const finalVotesList = [{ userId: 'u1', vote: 'yes' }];
            render(<ElectionHero {...defaultProps} finalVotesList={finalVotesList} />);
            expect(screen.getByText('Anonymous')).toBeInTheDocument();
        });
    });
});
