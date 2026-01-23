import React, { useState, useEffect } from 'react';
import { voteArgument, subscribeToArgumentVotes } from '../services/firebase';
import { useUser } from '../contexts/UserContext';
import NamePrompt from './NamePrompt';
import ParticipantService from '../services/ParticipantService';

function ArgumentItem({ argument, decisionId, readOnly, onVoteChange, canVote, participantMap, encryptionKey }) {
    const { user, setDisplayName } = useUser();
    const [votes, setVotes] = useState([]);
    const [voting, setVoting] = useState(false);
    const [showNamePrompt, setShowNamePrompt] = useState(false);

    useEffect(() => {
        const unsubscribe = subscribeToArgumentVotes(decisionId, argument.id, (newVotes) => {
            setVotes(newVotes);
        });
        return () => unsubscribe();
    }, [decisionId, argument.id]);

    const hasVoted = votes.some(v => v.userId === user.userId);

    useEffect(() => {
        if (onVoteChange) {
            onVoteChange(argument.id, hasVoted);
        }
    }, [hasVoted, argument.id, onVoteChange]);

    const handleVote = async () => {
        if (readOnly || voting || (!hasVoted && !canVote)) return;

        // Check if user has a display name
        if (!user.displayName) {
            setShowNamePrompt(true);
            return;
        }

        await performVote();
    };

    const performVote = async () => {
        setVoting(true);

        try {
            // Register participant if not known (works for both encrypted and unencrypted)
            if (user.displayName && (!participantMap || !participantMap.has(user.userId))) {
                try {
                    await ParticipantService.registerParticipant(decisionId, user.displayName, encryptionKey || null);
                } catch (e) {
                    console.warn("Auto-registration failed", e);
                }
            }

            // Only send display name if we are NOT using encryption.
            // If encryption is on, the name is in the participant map (registered above).
            const nameToSend = encryptionKey ? null : user.displayName;
            await voteArgument(decisionId, argument.id, nameToSend);
        } catch (error) {
            console.error("Error voting:", error);
            alert("Failed to vote. Please try again.");
        } finally {
            setVoting(false);
        }
    };

    // ... handleNameSave ...


    const handleNameSave = async (name) => {
        setDisplayName(name);
        setShowNamePrompt(false);
        // Perform the vote after saving the name
        await performVote();
    };

    const authorName = participantMap?.get(argument.authorId)?.name || argument.authorName;

    return (
        <>
            {showNamePrompt && (
                <NamePrompt
                    onSave={handleNameSave}
                    onCancel={() => setShowNamePrompt(false)}
                />
            )}
            <li className="argument-item" style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '1.1rem' }}>{argument.text}</span>
                        {authorName && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                                Added by {authorName}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleVote}
                        disabled={readOnly || voting || (!hasVoted && !canVote)}
                        style={{
                            padding: '0.5rem 1rem',
                            fontSize: '0.875rem',
                            background: hasVoted ? 'var(--color-primary)' : 'white',
                            color: hasVoted ? 'white' : 'var(--color-primary)',
                            border: '1px solid var(--color-primary)',
                            borderRadius: '20px',
                            cursor: (readOnly || voting || (!hasVoted && !canVote)) ? 'not-allowed' : 'pointer',
                            opacity: (readOnly || (!hasVoted && !canVote)) ? 0.5 : 1,
                            marginLeft: '1rem',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {hasVoted ? 'Voted' : 'Vote'} ({votes.length})
                    </button>
                </div>

                {/* Voter Chips */}
                {votes.length > 0 && (
                    <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {votes.map(vote => (
                            <span key={vote.userId} style={{
                                fontSize: '0.75rem',
                                background: 'var(--color-bg-secondary)',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '12px',
                                color: 'var(--color-text)',
                                border: '1px solid var(--color-border)'
                            }}>
                                {participantMap?.get(vote.userId)?.name || vote.displayName || 'Anonymous'}
                            </span>
                        ))}
                    </div>
                )}
            </li>
        </>
    );
}

export default ArgumentItem;
