import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './EditQuestionModal.module.css';

export default function EditQuestionModal({ question, onSave, onCancel, isLoading }) {
    const { t } = useTranslation();
    const [value, setValue] = useState(question);
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onCancel();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onCancel]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = value.trim();
        if (trimmed && trimmed !== question) {
            onSave(trimmed);
        }
    };

    return (
        <div className={styles.overlay} onClick={onCancel}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={t('decision.editQuestion')}>
                <h2 className={styles.title}>{t('decision.editQuestion')}</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        ref={inputRef}
                        className={styles.input}
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        maxLength={1000}
                        disabled={isLoading}
                    />
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
                            type="submit"
                            className={styles.btnSave}
                            disabled={isLoading || !value.trim() || value.trim() === question}
                        >
                            {t('common.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
