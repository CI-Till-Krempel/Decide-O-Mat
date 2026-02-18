import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ConfirmDeleteDialog.module.css';

export default function ConfirmDeleteDialog({ question, onConfirm, onCancel, isLoading }) {
    const { t } = useTranslation();

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onCancel();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onCancel]);

    return (
        <div className={styles.overlay} onClick={onCancel}>
            <div className={styles.dialog} onClick={(e) => e.stopPropagation()} role="alertdialog" aria-label={t('decision.deleteConfirmTitle')}>
                <h2 className={styles.title}>{t('decision.deleteConfirmTitle')}</h2>
                <p className={styles.message}>{t('decision.deleteConfirmMessage')}</p>
                <div className={styles.questionPreview}>{question}</div>
                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.btnCancel}
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        type="button"
                        className={styles.btnDanger}
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {t('common.delete')}
                    </button>
                </div>
            </div>
        </div>
    );
}
