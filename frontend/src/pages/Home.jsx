import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../services/firebase';
import EncryptionService from '../services/EncryptionService';
import styles from './Home.module.css';

function ArrowIcon() {
    return (
        <svg className={styles.submitIcon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
        </svg>
    );
}

export default function Home() {
    const { t } = useTranslation();
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleStart = async () => {
        if (!question.trim()) return;

        setLoading(true);
        setError('');

        try {
            let questionToSubmit = question;
            let keyString = '';

            if (EncryptionService.isEnabled()) {
                const key = await EncryptionService.generateKey();
                keyString = await EncryptionService.exportKey(key);
                questionToSubmit = await EncryptionService.encrypt(question, key);
            }

            const createDecision = httpsCallable(functions, 'createDecision');
            const result = await createDecision({ question: questionToSubmit });

            let targetUrl = `/d/${result.data.id}`;
            if (keyString) {
                targetUrl += `#key=${keyString}`;
            }

            navigate(targetUrl);
        } catch (err) {
            console.error(err);
            setError(t('home.errorCreateFailed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.bgBlob1} />
            <div className={styles.bgBlob2} />
            <div className={styles.bgBlob3} />

            <div className={styles.content}>
                <div>
                    <h1 className={styles.headline}>{t('home.subtitle')}</h1>
                    <p className={styles.description}>{t('home.description')}</p>
                </div>

                <div className={styles.questionSection}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.inputLabel}>{t('home.inputLabel')}</label>
                        <input
                            type="text"
                            className={styles.inputField}
                            placeholder={t('home.inputPlaceholder')}
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                            disabled={loading}
                        />
                        {question && (
                            <button
                                type="button"
                                className={styles.clearButton}
                                onClick={() => setQuestion('')}
                                aria-label={t('home.clearAlt')}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
                                </svg>
                            </button>
                        )}
                    </div>

                    <button
                        className={styles.submitButton}
                        onClick={handleStart}
                        disabled={loading || !question.trim()}
                        aria-label={t('home.buttonStart')}
                    >
                        <ArrowIcon />
                    </button>
                </div>

                {error && <p className={styles.error}>{error}</p>}
            </div>
        </div>
    );
}
