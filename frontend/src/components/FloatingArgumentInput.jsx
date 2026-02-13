import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './FloatingArgumentInput.module.css';

function SendIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z" />
        </svg>
    );
}

export default function FloatingArgumentInput({ type, onSubmit, onClose, isLoading }) {
    const { t } = useTranslation();
    const [text, setText] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
    }, []);

    const handleSubmit = () => {
        if (!text.trim() || isLoading) return;
        onSubmit(text.trim(), type);
        setText('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSubmit();
        if (e.key === 'Escape') onClose();
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className={styles.backdrop} onClick={handleBackdropClick}>
        <div className={styles.overlay}>
            <div className={styles.inputWrapper}>
                <label className={styles.inputLabel}>
                    {t('decision.argumentLabel', { defaultValue: 'Argument' })}
                </label>
                <input
                    ref={inputRef}
                    type="text"
                    className={styles.inputField}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    placeholder={type === 'pro' ? t('addArgumentForm.placeholderPro') : t('addArgumentForm.placeholderCon')}
                />
                {text && (
                    <button
                        type="button"
                        className={styles.clearButton}
                        onClick={() => setText('')}
                        aria-label="Clear"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
                        </svg>
                    </button>
                )}
            </div>
            <button
                className={styles.sendButton}
                onClick={handleSubmit}
                disabled={!text.trim() || isLoading}
                aria-label={t('addArgumentForm.buttonAdd')}
                type="button"
            >
                <SendIcon />
            </button>
        </div>
        </div>
    );
}
