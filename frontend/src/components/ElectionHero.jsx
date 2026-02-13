import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ElectionHero.module.css';

function ThumbsUpIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
        </svg>
    );
}

function ThumbsDownIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" />
        </svg>
    );
}

function StatsIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
        </svg>
    );
}

export default function ElectionHero({ question, onVoteYes, onVoteNo, isClosed, userVote, votingTarget, finalResult, finalVotesList, participantMap }) {
    const { t } = useTranslation();

    const yesVoters = (finalVotesList || []).filter(v => v.vote === 'yes');
    const noVoters = (finalVotesList || []).filter(v => v.vote === 'no');

    const renderVoterChips = (voters) => {
        if (voters.length === 0) return null;
        return (
            <div className={styles.voterChips}>
                {voters.map(vote => (
                    <span key={vote.userId} className={styles.chip}>
                        {participantMap?.get(vote.userId)?.name || vote.displayName || t('decision.anonymous')}
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className={styles.hero}>
            <button className={styles.statsButton} aria-label="Statistics" type="button">
                <StatsIcon />
            </button>

            <h1 className={styles.question}>{question}</h1>

            {isClosed && finalResult && (
                <div className={`${styles.closedBanner} ${finalResult === 'Approved' ? styles.approved : styles.rejected}`}>
                    {t('decision.decisionClosed', { result: t(`decision.result${finalResult}`) })}
                </div>
            )}

            <div className={styles.voteButtons}>
                <div className={styles.voteColumn}>
                    <button
                        className={`${styles.voteButton} ${userVote === 'yes' ? styles.voteButtonActive : ''}`}
                        onClick={onVoteYes}
                        disabled={isClosed || !!votingTarget}
                        aria-label={t('decision.voteYes')}
                        type="button"
                    >
                        <ThumbsUpIcon />
                    </button>
                    {renderVoterChips(yesVoters)}
                </div>
                <div className={styles.voteColumn}>
                    <button
                        className={`${styles.voteButton} ${userVote === 'no' ? styles.voteButtonActive : ''}`}
                        onClick={onVoteNo}
                        disabled={isClosed || !!votingTarget}
                        aria-label={t('decision.voteNo')}
                        type="button"
                    >
                        <ThumbsDownIcon />
                    </button>
                    {renderVoterChips(noVoters)}
                </div>
            </div>
        </div>
    );
}
