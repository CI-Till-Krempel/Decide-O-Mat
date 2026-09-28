import React from 'react';
import { useTranslation } from 'react-i18next';
import { relativeTime } from '../utils/relativeTime';
import styles from './DecisionCard.module.css';

export default function DecisionCard({ decision, variant = 'archived', onClick, onContextMenu }) {
    const { t } = useTranslation();

    if (!decision) return null;

    const isRunning = variant === 'running';

    const getDateDisplay = () => {
        if (!decision.createdAt) return '';

        const date = decision.createdAt?.toDate
            ? decision.createdAt.toDate()
            : (decision.createdAt instanceof Date ? decision.createdAt : new Date(decision.createdAt));

        if (!date || isNaN(date.getTime())) {
            return '';
        }

        if (isRunning) {
            return relativeTime(date);
        }
        return date.toLocaleDateString();
    };

    const roleBadge = decision.role === 'owner'
        ? t('myDecisions.roleOwner')
        : t('myDecisions.roleInvitee');

    const question = decision.question || decision.text || t('decision.unknownTitle', 'Decision');
    const dateDisplay = getDateDisplay();

    return (
        <div
            className={`${styles.card} ${isRunning ? styles.cardRunning : styles.cardArchived}`}
            onClick={onClick}
            onContextMenu={(e) => {
                e.preventDefault();
                onContextMenu?.(e);
            }}
        >
            <div className={styles.header}>
                <h3 className={styles.question}>{question}</h3>
                <button
                    className={styles.menuTrigger}
                    onClick={(e) => {
                        e.stopPropagation();
                        onContextMenu?.(e);
                    }}
                    aria-label={t('myDecisions.contextMenu.open', 'Options')}
                    type="button"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                    </svg>
                </button>
            </div>
            <div className={styles.meta}>
                <span className={`${styles.badge} ${decision.role === 'owner' ? styles.badgeOwner : styles.badgeInvitee}`}>
                    {roleBadge}
                </span>
                <span className={styles.separator}>·</span>
                <span className={styles.status}>
                    {decision.status === 'closed' ? t('myDecisions.statusClosed') : t('myDecisions.statusOpen')}
                </span>
                {dateDisplay && (
                    <>
                        <span className={styles.separator}>·</span>
                        <span className={styles.date}>{dateDisplay}</span>
                    </>
                )}
            </div>
        </div>
    );
}
