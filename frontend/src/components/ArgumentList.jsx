import React, { useState, useEffect } from 'react';
import { voteArgument } from '../services/firebase';

function ArgumentList({ arguments: args, type, title, decisionId }) {
    const [voteCounts, setVoteCounts] = useState(new Map());
    const maxVotes = args.length > 0 ? Math.max(1, Math.floor(args.length / 2)) : 0;

    // Load vote counts from localStorage on mount
    useEffect(() => {
        const storageKey = `votes_${decisionId}_${type}`;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            setVoteCounts(new Map(JSON.parse(stored)));
        }
    }, [decisionId, type]);

    // Calculate total votes used
    const totalVotesUsed = Array.from(voteCounts.values()).reduce((sum, count) => sum + count, 0);

    const handleVote = async (argumentId) => {
        const currentVotes = voteCounts.get(argumentId) || 0;

        // Check if user has votes remaining
        if (totalVotesUsed >= maxVotes) {
            alert(`You have used all ${maxVotes} votes for ${type === 'pro' ? 'pros' : 'cons'}.`);
            return;
        }

        try {
            console.log("ArgumentList calling voteArgument with:", { decisionId, argumentId, change: 1 });
            await voteArgument(decisionId, argumentId, 1);

            // Update local state
            const newVoteCounts = new Map(voteCounts);
            newVoteCounts.set(argumentId, currentVotes + 1);
            setVoteCounts(newVoteCounts);

            // Persist to localStorage
            const storageKey = `votes_${decisionId}_${type}`;
            localStorage.setItem(storageKey, JSON.stringify([...newVoteCounts]));
        } catch (error) {
            console.error('Error voting:', error);
            alert('Failed to vote. Please try again.');
        }
    };

    const handleUnvote = async (argumentId) => {
        const currentVotes = voteCounts.get(argumentId) || 0;

        if (currentVotes === 0) {
            return;
        }

        try {
            await voteArgument(decisionId, argumentId, -1);

            // Update local state
            const newVoteCounts = new Map(voteCounts);
            if (currentVotes === 1) {
                newVoteCounts.delete(argumentId);
            } else {
                newVoteCounts.set(argumentId, currentVotes - 1);
            }
            setVoteCounts(newVoteCounts);

            // Persist to localStorage
            const storageKey = `votes_${decisionId}_${type}`;
            localStorage.setItem(storageKey, JSON.stringify([...newVoteCounts]));
        } catch (error) {
            console.error('Error unvoting:', error);
            alert('Failed to unvote. Please try again.');
        }
    };

    return (
        <div className="argument-list">
            <h3>{type === 'pro' ? 'Pros' : 'Cons'} for "{title}"</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                Votes used: {totalVotesUsed} / {maxVotes}
            </p>
            {args.length === 0 ? (
                <p>No arguments yet.</p>
            ) : (
                <ul>
                    {[...args].sort((a, b) => (b.votes || 0) - (a.votes || 0)).map((arg) => {
                        const myVotes = voteCounts.get(arg.id) || 0;
                        return (
                            <li key={arg.id} className="argument-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <span>{arg.text}</span>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                        {arg.votes || 0} {myVotes > 0 && `(${myVotes})`}
                                    </span>
                                    <button
                                        onClick={() => handleUnvote(arg.id)}
                                        disabled={myVotes === 0}
                                        style={{
                                            padding: '0.25rem 0.5rem',
                                            fontSize: '0.875rem',
                                            background: myVotes === 0 ? '#ccc' : 'var(--color-danger)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: myVotes === 0 ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        −
                                    </button>
                                    <button
                                        onClick={() => handleVote(arg.id)}
                                        disabled={totalVotesUsed >= maxVotes}
                                        style={{
                                            padding: '0.25rem 0.5rem',
                                            fontSize: '0.875rem',
                                            background: totalVotesUsed >= maxVotes ? '#ccc' : 'var(--color-primary)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: totalVotesUsed >= maxVotes ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        +
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default ArgumentList;
