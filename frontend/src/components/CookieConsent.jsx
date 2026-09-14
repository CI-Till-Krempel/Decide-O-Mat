import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    getConsent,
    setConsent,
    hasConsent,
    CONSENT_CHANGE_EVENT,
    OPEN_COOKIE_PREFERENCES_EVENT
} from '../services/ConsentService';
import styles from './CookieConsent.module.css';

export default function CookieConsent() {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(() => !hasConsent());
    const [showPreferences, setShowPreferences] = useState(false);
    const [analyticsChecked, setAnalyticsChecked] = useState(() => Boolean(getConsent()?.analytics));

    useEffect(() => {
        const handleOpenPreferences = () => {
            const latest = getConsent();
            setAnalyticsChecked(Boolean(latest?.analytics));
            setShowPreferences(true);
            setIsOpen(true);
        };

        const handleConsentChanged = (e) => {
            if (e.detail) {
                setAnalyticsChecked(Boolean(e.detail.analytics));
            }
        };

        window.addEventListener(OPEN_COOKIE_PREFERENCES_EVENT, handleOpenPreferences);
        window.addEventListener(CONSENT_CHANGE_EVENT, handleConsentChanged);

        return () => {
            window.removeEventListener(OPEN_COOKIE_PREFERENCES_EVENT, handleOpenPreferences);
            window.removeEventListener(CONSENT_CHANGE_EVENT, handleConsentChanged);
        };
    }, []);

    if (!isOpen) return null;

    const handleAcceptAll = () => {
        setConsent({ analytics: true });
        setIsOpen(false);
        setShowPreferences(false);
    };

    const handleEssentialOnly = () => {
        setConsent({ analytics: false });
        setIsOpen(false);
        setShowPreferences(false);
    };

    const handleSavePreferences = () => {
        setConsent({ analytics: analyticsChecked });
        setIsOpen(false);
        setShowPreferences(false);
    };

    return (
        <div className={styles.overlay} data-testid="cookie-consent-overlay">
            <div
                className={styles.banner}
                role="dialog"
                aria-modal="true"
                aria-labelledby="cookie-consent-title"
                aria-describedby="cookie-consent-desc"
                data-testid="cookie-consent-banner"
            >
                <div className={styles.header}>
                    <h2 id="cookie-consent-title" className={styles.title}>
                        {t('cookieConsent.title')}
                    </h2>
                </div>

                <p id="cookie-consent-desc" className={styles.description}>
                    {t('cookieConsent.description')}{' '}
                    <Link to="/legal/privacy" className={styles.privacyLink} onClick={() => setIsOpen(false)}>
                        {t('cookieConsent.privacyPolicyLink')}
                    </Link>
                </p>

                {showPreferences && (
                    <div className={styles.preferences} data-testid="cookie-preferences-details">
                        <div className={styles.category}>
                            <div className={styles.categoryContent}>
                                <span className={styles.categoryTitle}>{t('cookieConsent.essentialCategory')}</span>
                                <span className={styles.categoryDesc}>{t('cookieConsent.essentialDesc')}</span>
                            </div>
                            <span className={styles.badge}>{t('cookieConsent.essentialCategory')}</span>
                        </div>

                        <div className={styles.category}>
                            <div className={styles.categoryContent}>
                                <span className={styles.categoryTitle}>{t('cookieConsent.analyticsCategory')}</span>
                                <span className={styles.categoryDesc}>{t('cookieConsent.analyticsDesc')}</span>
                            </div>
                            <label className={styles.toggleLabel}>
                                <input
                                    type="checkbox"
                                    className={styles.checkbox}
                                    checked={analyticsChecked}
                                    onChange={(e) => setAnalyticsChecked(e.target.checked)}
                                    aria-label={t('cookieConsent.analyticsCategory')}
                                    data-testid="analytics-checkbox"
                                />
                            </label>
                        </div>
                    </div>
                )}

                <div className={styles.actions}>
                    {showPreferences ? (
                        <>
                            <button
                                type="button"
                                className={styles.btnPrimary}
                                onClick={handleSavePreferences}
                                data-testid="save-preferences-button"
                            >
                                {t('cookieConsent.savePreferences')}
                            </button>
                            <button
                                type="button"
                                className={styles.btnSecondary}
                                onClick={handleEssentialOnly}
                                data-testid="essential-only-button"
                            >
                                {t('cookieConsent.essentialOnly')}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                className={styles.btnPrimary}
                                onClick={handleAcceptAll}
                                data-testid="accept-all-button"
                            >
                                {t('cookieConsent.acceptAll')}
                            </button>
                            <button
                                type="button"
                                className={styles.btnSecondary}
                                onClick={handleEssentialOnly}
                                data-testid="essential-only-button"
                            >
                                {t('cookieConsent.essentialOnly')}
                            </button>
                            <button
                                type="button"
                                className={styles.btnOutline}
                                onClick={() => setShowPreferences(true)}
                                data-testid="customize-button"
                            >
                                {t('cookieConsent.customize')}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
