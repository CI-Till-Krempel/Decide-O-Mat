import React, { useState, useCallback } from 'react';
import ArgumentItem from './ArgumentItem';

function ArgumentList({ arguments: args, type, decisionId, readOnly, participantMap, encryptionKey, onError }) {
    const [votedArgIds, setVotedArgIds] = useState(new Set());

    const handleVoteChange = useCallback((argId, isVoted) => {
        setVotedArgIds(prev => {
            const newSet = new Set(prev);
            if (isVoted) {
                newSet.add(argId);
            } else {
                newSet.delete(argId);
            }
            return newSet;
        });
    }, []);

    if (!args || args.length === 0) {
        return (
            <div className="argument-list">
                <h2 className={type === 'pro' ? 'pros-title' : 'cons-title'}>
                    {type === 'pro' ? 'Pros' : 'Cons'}
                </h2>
                <p className="no-arguments">No {type === 'pro' ? 'pros' : 'cons'} yet. Be the first to add one!</p>
            </div>
        );
    }

    // ... (rest of the file until return)

    const voteLimit = Math.ceil(args.length / 2);
    const canVote = votedArgIds.size < voteLimit;

    return (
        <div className="argument-list">
            <h2 className={type === 'pro' ? 'pros-title' : 'cons-title'}>
                {type === 'pro' ? 'Pros' : 'Cons'}
            </h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {[...args].sort((a, b) => (b.votes || 0) - (a.votes || 0)).map((arg) => (
                    <ArgumentItem
                        key={arg.id}
                        argument={arg}
                        decisionId={decisionId}
                        readOnly={readOnly}
                        onVoteChange={handleVoteChange}
                        canVote={canVote}
                        participantMap={participantMap}
                        encryptionKey={encryptionKey}
                        onError={onError}
                    />
                ))}
            </ul>
        </div>
    );
}

export default ArgumentList;
