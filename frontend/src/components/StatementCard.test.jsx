import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import StatementCard from './StatementCard';
import { useUser } from '../contexts/UserContext';
import { voteArgument } from '../services/firebase';
import ParticipantService from '../services/ParticipantService';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key, options) => {
            if (options?.name) return `Statement by ${options.name}`;
            return key;
        }
    })
}));

vi.mock('../contexts/UserContext');
vi.mock('../services/firebase', () => ({
    voteArgument: vi.fn(),
    updateArgumentText: vi.fn(),
    subscribeToArgumentVotes: vi.fn((decisionId, argumentId, callback) => {
        callback([]);
        return vi.fn();
    })
}));

vi.mock('../services/ParticipantService', () => ({
    default: {
        registerParticipant: vi.fn().mockResolvedValue({})
    }
}));

describe('StatementCard Null Safety & Functionality', () => {
    const mockArgument = {
        id: 'arg-1',
        text: 'Clean Architecture is great',
        authorId: 'author-1',
        authorName: 'Alice'
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders safely when user is null without throwing TypeError', () => {
        useUser.mockReturnValue({ user: null });

        expect(() => {
            render(
                <StatementCard
                    argument={mockArgument}
                    decisionId="dec-1"
                    canVote={true}
                    participantMap={undefined}
                />
            );
        }).not.toThrow();

        expect(screen.getByText('Clean Architecture is great')).toBeInTheDocument();
        expect(screen.getByText('Statement by Alice')).toBeInTheDocument();
    });

    it('renders safely when participantMap is null or undefined', () => {
        useUser.mockReturnValue({ user: { userId: 'user-2', displayName: 'Bob' } });

        expect(() => {
            render(
                <StatementCard
                    argument={mockArgument}
                    decisionId="dec-1"
                    canVote={true}
                    participantMap={undefined}
                />
            );
        }).not.toThrow();

        expect(screen.getByText('Clean Architecture is great')).toBeInTheDocument();
    });

    it('does not crash when clicking vote and participantMap is undefined', async () => {
        useUser.mockReturnValue({ user: { userId: 'user-2', displayName: 'Bob' } });
        voteArgument.mockResolvedValue({});

        render(
            <StatementCard
                argument={mockArgument}
                decisionId="dec-1"
                canVote={true}
                participantMap={undefined}
            />
        );

        const voteButton = screen.getByRole('button', { name: 'decision.voteLabel' });
        await fireEvent.click(voteButton);

        await waitFor(() => {
            expect(voteArgument).toHaveBeenCalledWith('dec-1', 'arg-1', 'Bob');
        });
    });

    it('triggers onNameRequired if user has no displayName when voting', async () => {
        useUser.mockReturnValue({ user: { userId: 'user-2', displayName: '' } });
        const onNameRequired = vi.fn();

        render(
            <StatementCard
                argument={mockArgument}
                decisionId="dec-1"
                canVote={true}
                participantMap={new Map()}
                onNameRequired={onNameRequired}
            />
        );

        const voteButton = screen.getByRole('button', { name: 'decision.voteLabel' });
        await fireEvent.click(voteButton);

        expect(onNameRequired).toHaveBeenCalledWith('arg-1');
        expect(voteArgument).not.toHaveBeenCalled();
    });
});
