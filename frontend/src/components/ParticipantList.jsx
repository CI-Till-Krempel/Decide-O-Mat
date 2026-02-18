import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ParticipantList.module.css';

const ParticipantList = ({ participantMap, isOpen, onClose, ownerId }) => {
    const { t } = useTranslation();

    const participants = Array.from((participantMap || new Map()).entries()).map(([id, data]) => ({
        id,
        ...data
    })).sort((a, b) => {
        if (a.id === ownerId) return -1;
        if (b.id === ownerId) return 1;
        return 0;
    });

    return (
        <>
            {isOpen && <div className={styles.backdrop} onClick={onClose} />}
            <div className={`${styles.overlay} ${isOpen ? styles.overlayOpen : styles.overlayClosed}`}>
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        {t('participantList.title', { count: participants.length })}
                    </h2>
                    <button onClick={onClose} className={styles.closeBtn} aria-label={t('userSettings.buttonClose')}>
                        &times;
                    </button>
                </div>

                <div className={styles.list}>
                    {participants.length === 0 && (
                        <div className={styles.empty}>
                            {t('participantList.empty')}
                        </div>
                    )}

                    {participants.map((p) => (
                        <div key={p.id} className={styles.item}>
                            {p.photoURL ? (
                                <img src={p.photoURL} alt={p.name} className={styles.avatar} />
                            ) : (
                                <div className={`${styles.avatar} ${p.isAnonymous ? styles.avatarAnonymous : styles.avatarVerified}`}>
                                    {p.isAnonymous ? '👤' : '🟢'}
                                </div>
                            )}
                            <div>
                                <div className={styles.name}>
                                    {p.name || t('participantList.unknown')}
                                </div>
                                <div className={styles.status}>
                                    <span>{p.isAnonymous ? '👤' : '🟢'}</span>
                                    <span>{p.isAnonymous ? t('participantList.statusAnonymous') : t('participantList.statusVerified')}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.help}>
                    <p>🟡 {t('participantList.helpAnonymous')}</p>
                    <p>🟢 {t('participantList.helpVerified')}</p>
                </div>
            </div>
        </>
    );
};

export default ParticipantList;
