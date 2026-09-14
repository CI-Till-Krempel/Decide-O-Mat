import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import StatsIcon from './icons/StatsIcon';
import styles from './StatisticsModal.module.css';

export default function StatisticsModal({
    question,
    finalVotesList = [],
    argumentsList = [],
    decision,
    onClose
}) {
    const { t } = useTranslation();

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Vote metrics
    const yesVotes = finalVotesList.length > 0
        ? finalVotesList.filter(v => (v.vote || v.choice) === 'yes').length
        : (decision?.yesVotes || 0);

    const noVotes = finalVotesList.length > 0
        ? finalVotesList.filter(v => (v.vote || v.choice) === 'no').length
        : (decision?.noVotes || 0);

    const totalVotes = yesVotes + noVotes;
    const yesPercent = totalVotes > 0 ? Math.round((yesVotes / totalVotes) * 100) : 0;
    const noPercent = totalVotes > 0 ? 100 - yesPercent : 0;

    let voteBalanceText = '0';
    if (yesVotes > noVotes) {
        voteBalanceText = `+${yesVotes - noVotes}`;
    } else if (noVotes > yesVotes) {
        voteBalanceText = `-${noVotes - yesVotes}`;
    }

    // Argument metrics
    const proArguments = argumentsList.filter(a => a.type === 'pro' || a.column === 'pro');
    const conArguments = argumentsList.filter(a => a.type === 'con' || a.column === 'con');
    const totalArguments = proArguments.length + conArguments.length;

    // Top argument
    let topArgument = null;
    let maxVotes = 0;
    for (const arg of argumentsList) {
        const score = arg.votes || 0;
        if (score > maxVotes) {
            maxVotes = score;
            topArgument = arg;
        }
    }

    const hasActivity = totalVotes > 0 || totalArguments > 0;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="statistics-modal-title"
            >
                <div className={styles.header}>
                    <div className={styles.titleArea}>
                        <div className={styles.titleRow}>
                            <span className={styles.titleIcon}>
                                <StatsIcon size={24} />
                            </span>
                            <h2 id="statistics-modal-title" className={styles.title}>
                                {t('statisticsModal.title')}
                            </h2>
                        </div>
                        {question && (
                            <div className={styles.questionPreview}>
                                {question}
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label={t('common.close')}
                    >
                        ✕
                    </button>
                </div>

                {!hasActivity ? (
                    <div className={styles.emptyState}>
                        {t('statisticsModal.emptyState')}
                    </div>
                ) : (
                    <div className={styles.metricsGrid}>
                        {/* Vote Summary Card */}
                        <div className={styles.statCard}>
                            <span className={styles.statLabel}>{t('statisticsModal.totalVotes')}</span>
                            <span className={styles.statNumber}>{totalVotes}</span>
                            {totalVotes > 0 ? (
                                <>
                                    <div className={styles.breakdownRow}>
                                        <span className={styles.yesText}>
                                            {t('statisticsModal.yesVotes')}: {yesVotes} ({yesPercent}%)
                                        </span>
                                        <span className={styles.noText}>
                                            {t('statisticsModal.noVotes')}: {noVotes} ({noPercent}%)
                                        </span>
                                    </div>
                                    <div className={styles.progressBar} aria-label={`${yesPercent}% Yes, ${noPercent}% No`}>
                                        <div className={styles.progressYes} style={{ width: `${yesPercent}%` }} />
                                        <div className={styles.progressNo} style={{ width: `${noPercent}%` }} />
                                    </div>
                                </>
                            ) : (
                                <span className={styles.questionPreview}>{t('statisticsModal.noVotesYet')}</span>
                            )}
                        </div>

                        {/* Vote Balance Card */}
                        <div className={styles.statCard}>
                            <span className={styles.statLabel}>{t('statisticsModal.voteBalance')}</span>
                            <span className={`${styles.statNumber} ${yesVotes > noVotes ? styles.yesText : (noVotes > yesVotes ? styles.noText : '')}`}>
                                {voteBalanceText}
                            </span>
                            <span className={styles.questionPreview}>
                                {t('decision.voteBalance')}
                            </span>
                        </div>

                        {/* Arguments Breakdown Card */}
                        <div className={styles.statCard}>
                            <span className={styles.statLabel}>{t('statisticsModal.arguments')}</span>
                            <span className={styles.statNumber}>{totalArguments}</span>
                            {totalArguments > 0 ? (
                                <div className={styles.breakdownRow}>
                                    <span className={styles.proText}>
                                        {t('statisticsModal.proArguments')}: {proArguments.length}
                                    </span>
                                    <span className={styles.conText}>
                                        {t('statisticsModal.conArguments')}: {conArguments.length}
                                    </span>
                                </div>
                            ) : (
                                <span className={styles.questionPreview}>{t('statisticsModal.noArgumentsYet')}</span>
                            )}
                        </div>

                        {/* Top Argument Card */}
                        <div className={`${styles.statCard} ${styles.statCardFull}`}>
                            <span className={styles.statLabel}>{t('statisticsModal.topArgument')}</span>
                            {topArgument ? (
                                <div className={styles.topArgumentContent}>
                                    <span>&ldquo;{topArgument.text}&rdquo;</span>
                                    <div>
                                        <span className={`${styles.topArgumentBadge} ${topArgument.type === 'con' || topArgument.column === 'con' ? styles.badgeCon : styles.badgePro}`}>
                                            {(topArgument.type === 'con' || topArgument.column === 'con') ? t('statisticsModal.conArguments') : t('statisticsModal.proArguments')} • {t('statisticsModal.topScore')}: {topArgument.votes || 0}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <span className={styles.questionPreview}>{t('statisticsModal.noArgumentsYet')}</span>
                            )}
                        </div>
                    </div>
                )}

                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.btnClose}
                        onClick={onClose}
                    >
                        {t('statisticsModal.close')}
                    </button>
                </div>
            </div>
        </div>
    );
}
