import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './NamePrompt.module.css';

function NamePrompt({ onSave, onCancel }) {
    const { t } = useTranslation();
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            onSave(name.trim());
        }
    };

    return (
        <div className={styles.overlay} onClick={onCancel}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={t('namePrompt.title')}>
                <h2 className={styles.title}>{t('namePrompt.title')}</h2>
                <p className={styles.description}>
                    {t('namePrompt.description')}
                </p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t('namePrompt.placeholder')}
                        autoFocus
                        className={styles.input}
                    />
                    <div className={styles.actions}>
                        {onCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                className={styles.btnCancel}
                            >
                                {t('namePrompt.buttonCancel')}
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={!name.trim()}
                            className={styles.btnSave}
                        >
                            {t('namePrompt.buttonSave')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default NamePrompt;
