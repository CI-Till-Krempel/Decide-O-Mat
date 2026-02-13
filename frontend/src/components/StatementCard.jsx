import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { voteArgument, subscribeToArgumentVotes } from '../services/firebase';
import { useUser } from '../contexts/UserContext';
import ParticipantService from '../services/ParticipantService';
import styles from './StatementCard.module.css';

function HeartIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
    );
}

export default function StatementCard({ argument, decisionId, readOnly, canVote, participantMap, encryptionKey, onVoteChange, onNameRequired, onError }) {
    const { t } = useTranslation();
    const { user } = useUser();
    const [votes, setVotes] = useState([]);
    const [voting, setVoting] = useState(false);

    useEffect(() => {
        const unsubscribe = subscribeToArgumentVotes(decisionId, argument.id, (newVotes) => {
            setVotes(newVotes);
        });
        return () => unsubscribe();
    }, [decisionId, argument.id]);

    const hasVoted = votes.some(v => v.userId === user.userId);
    const isOwn = argument.authorId === user.userId;

    useEffect(() => {
        if (onVoteChange) {
            onVoteChange(argument.id, hasVoted);
        }
    }, [hasVoted, argument.id, onVoteChange]);

    const handleVote = async () => {
        if (readOnly || voting || (!hasVoted && !canVote)) return;

        if (!user.displayName) {
            if (onNameRequired) onNameRequired();
            return;
        }

        setVoting(true);
        try {
            if (user.displayName && (!participantMap || !participantMap.has(user.userId))) {
                try {
                    await ParticipantService.registerParticipant(decisionId, user.displayName, encryptionKey || null);
                } catch (e) {
                    console.warn("Auto-registration failed", e);
                }
            }
            const nameToSend = encryptionKey ? null : user.displayName;
            await voteArgument(decisionId, argument.id, nameToSend);
        } catch (error) {
            console.error("Error voting:", error);
            if (onError) onError(t('argumentItem.errorVoteFailed'));
        } finally {
            setVoting(false);
        }
    };

    const authorName = participantMap?.get(argument.authorId)?.name || argument.authorName;

    return (
        <div className={`${styles.card} ${isOwn ? styles.ownCard : ''}`}>
            <div className={styles.header}>
                <span className={`${styles.authorLabel} ${isOwn ? styles.ownLabel : ''}`}>
                    {isOwn
                        ? t('argumentItem.yourStatement')
                        : t('argumentItem.statementBy', { name: authorName || t('decision.anonymous') })
                    }
                </span>
            </div>

            <div className={styles.body}>
                <span className={styles.text}>{argument.text}</span>
                {!isOwn && (
                    <button
                        className={`${styles.voteButton} ${hasVoted ? styles.voteButtonActive : ''}`}
                        onClick={handleVote}
                        disabled={readOnly || voting || (!hasVoted && !canVote)}
                        aria-label={hasVoted ? t('decision.votedLabel') : t('decision.voteLabel')}
                        type="button"
                    >
                        <HeartIcon />
                    </button>
                )}
            </div>

            {votes.length > 0 && (
                <div className={styles.voterSection}>
                    <span className={styles.voterLabel}>{t('argumentItem.approvalFrom')}</span>
                    <div className={styles.voterChips}>
                        {votes.map(vote => (
                            <span key={vote.userId} className={styles.chip}>
                                {participantMap?.get(vote.userId)?.name || vote.displayName || t('decision.anonymous')}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
