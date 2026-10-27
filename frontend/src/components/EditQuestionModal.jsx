import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './EditQuestionModal.module.css';

export default function EditQuestionModal({
    question = '',
    onSave = () => {},
    onCancel = () => {},
    isLoading = false,
    title = '',
    maxLength = 1000,
}) {
    const { t } = useTranslation();
    const [value, setValue] = useState(question || '');
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onCancel?.();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onCancel]);

    const trimmed = (value || '').trim();
    const initialTrimmed = (question || '').trim();
    const isUnchanged = trimmed === initialTrimmed;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (trimmed && !isUnchanged) {
            onSave?.(trimmed);
        }
    };

    const dialogTitle = title || t('decision.editQuestion');

    return (
        <div className={styles.overlay} onClick={() => onCancel?.()}>
            <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={dialogTitle}
            >
                <h2 className={styles.title}>{dialogTitle}</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        ref={inputRef}
                        className={styles.input}
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        maxLength={maxLength}
                        disabled={isLoading}
                        aria-label={dialogTitle}
                    />
                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={styles.btnCancel}
                            onClick={() => onCancel?.()}
                            disabled={isLoading}
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            className={styles.btnSave}
                            disabled={isLoading || !trimmed || isUnchanged}
                        >
                            {t('common.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
