import React, { useState, useEffect } from 'react';
import { voteArgument } from '../services/firebase';

function ArgumentList({ arguments: args, type, title, decisionId }) {
    const [votedArgs, setVotedArgs] = useState(new Set());
    const maxVotes = Math.floor(args.length / 2);

    // Load voted arguments from localStorage on mount
    useEffect(() => {
        const storageKey = `votes_${decisionId}_${type}`;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            setVotedArgs(new Set(JSON.parse(stored)));
        }
    }, [decisionId, type]);

    const handleVote = async (argumentId, isVoted) => {
        const change = isVoted ? -1 : 1;

        // Check vote limit when adding a vote
        if (!isVoted && votedArgs.size >= maxVotes) {
            alert(`You can only vote for ${maxVotes} ${type === 'pro' ? 'pros' : 'cons'}.`);
            return;
        }

        try {
            await voteArgument(decisionId, argumentId, change);

            // Update local state
            const newVotedArgs = new Set(votedArgs);
            if (isVoted) {
                newVotedArgs.delete(argumentId);
            } else {
                newVotedArgs.add(argumentId);
            }
            setVotedArgs(newVotedArgs);

            // Persist to localStorage
            const storageKey = `votes_${decisionId}_${type}`;
            localStorage.setItem(storageKey, JSON.stringify([...newVotedArgs]));
        } catch (error) {
            console.error('Error voting:', error);
            alert('Failed to vote. Please try again.');
        }
    };

    return (
        <div className="argument-list">
            <h3>{type === 'pro' ? 'Pros' : 'Cons'} for "{title}"</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                Votes: {votedArgs.size} / {maxVotes}
            </p>
            {args.length === 0 ? (
                <p>No arguments yet.</p>
            ) : (
                <ul>
                    {args.map((arg) => {
                        const isVoted = votedArgs.has(arg.id);
                        return (
                            <li key={arg.id} className="argument-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <span>{arg.text}</span>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                        {arg.votes || 0}
                                    </span>
                                    <button
                                        onClick={() => handleVote(arg.id, isVoted)}
                                        style={{
                                            padding: '0.25rem 0.5rem',
                                            fontSize: '0.875rem',
                                            background: isVoted ? 'var(--color-danger)' : 'var(--color-primary)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {isVoted ? '✓' : '+'}
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
