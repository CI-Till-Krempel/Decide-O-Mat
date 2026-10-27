import React from 'react';
import { useTranslation } from 'react-i18next';
import BallotIcon from './icons/BallotIcon';
import StatsIcon from './icons/StatsIcon';
import QRCodeIcon from './icons/QRCodeIcon';
import { HERO_MODES } from './ElectionHero.modes';
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

function UsersIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
    );
}

export default function ElectionHero({ question, onVoteYes, onVoteNo, isClosed, userVote, votingTarget, finalResult, finalVotesList, participantMap, mode = HERO_MODES.VOTING, onOpenStats, onShowQRCode, onOpenParticipants }) {
    const { t } = useTranslation();

    const yesVoters = (finalVotesList || []).filter(v => v.vote === 'yes');
    const noVoters = (finalVotesList || []).filter(v => v.vote === 'no');

    const renderVoterChips = (voters) => {
        if (voters.length === 0) return null;
        return (
            <div className={styles.voterChips}>
                {voters.map(vote => {
                    const participant = participantMap?.get ? participantMap.get(vote.userId) : participantMap?.[vote.userId];
                    const name = participant?.name || vote.displayName || t('decision.anonymous');
                    return (
                        <span key={vote.userId} className={styles.chip}>
                            {name}
                        </span>
                    );
                })}
            </div>
        );
    };

    const getResultLabel = () => {
        if (finalResult === 'Approved') return t('decision.resultApproved');
        if (finalResult === 'Rejected') return t('decision.resultRejected');
        return t('decision.resultNoVotes');
    };

    const getResultClass = () => {
        if (finalResult === 'Approved') return styles.resultApproved;
        if (finalResult === 'Rejected') return styles.resultRejected;
        return '';
    };

    return (
        <div className={styles.hero}>
            <div className={styles.topActions}>
                {onOpenParticipants && (
                    <button
                        type="button"
                        className={styles.actionButton}
                        onClick={onOpenParticipants}
                        aria-label={t('decision.participantsButton')}
                        title={t('decision.participantsButton')}
                        data-testid="participants-button"
                    >
                        <UsersIcon />
                    </button>
                )}
                {onShowQRCode && (
                    <button
                        type="button"
                        className={styles.actionButton}
                        onClick={onShowQRCode}
                        aria-label={t('decision.showQRCode')}
                        title={t('decision.showQRCode')}
                        data-testid="qr-code-button"
                    >
                        <QRCodeIcon />
                    </button>
                )}
                <button
                    type="button"
                    className={`${styles.actionButton} ${styles.statsButton}`}
                    onClick={onOpenStats}
                    aria-label={t('decision.statistics')}
                    title={t('decision.statistics')}
                    data-testid="stats-button"
                >
                    <StatsIcon />
                </button>
            </div>

            <h1 className={styles.question}>{question}</h1>

            {mode === HERO_MODES.RESULTS && (
                <div className={styles.resultsSection}>
                    <span className={styles.resultIcon}><BallotIcon /></span>
                    <span className={`${styles.resultText} ${getResultClass()}`}>
                        {getResultLabel()}
                    </span>
                </div>
            )}

            <div className={styles.voteButtons}>
                <div className={styles.voteColumn}>
                    {mode === HERO_MODES.VOTING && (
                        <button
                            className={`${styles.voteButton} ${userVote === 'yes' ? styles.voteButtonActive : ''}`}
                            onClick={onVoteYes}
                            disabled={isClosed || !!votingTarget}
                            aria-label={t('decision.voteYes')}
                            aria-pressed={userVote === 'yes'}
                            type="button"
                        >
                            <ThumbsUpIcon />
                        </button>
                    )}
                    {renderVoterChips(yesVoters)}
                </div>
                <div className={styles.voteColumn}>
                    {mode === HERO_MODES.VOTING && (
                        <button
                            className={`${styles.voteButton} ${userVote === 'no' ? styles.voteButtonActive : ''}`}
                            onClick={onVoteNo}
                            disabled={isClosed || !!votingTarget}
                            aria-label={t('decision.voteNo')}
                            aria-pressed={userVote === 'no'}
                            type="button"
                        >
                            <ThumbsDownIcon />
                        </button>
                    )}
                    {renderVoterChips(noVoters)}
                </div>
            </div>
        </div>
    );
}
