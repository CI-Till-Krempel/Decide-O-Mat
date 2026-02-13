import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '../contexts/UserContext';
import EncryptionService from '../services/EncryptionService';
import UserSettings from './UserSettings';
import styles from './Header.module.css';

function PersonIcon() {
    return (
        <svg className={styles.userIcon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
    );
}

function EditIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
        </svg>
    );
}

export default function Header() {
    const { t } = useTranslation();
    const { user } = useUser();
    const { id: routeParamsId } = useParams();
    const location = useLocation();
    const [encryptionKey, setEncryptionKey] = useState(null);
    const [decisionId, setDecisionId] = useState(null);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        const parseUrl = async () => {
            let currentId = routeParamsId;
            if (!currentId) {
                if (location.pathname.startsWith('/decision/')) {
                    currentId = location.pathname.split('/')[2];
                } else if (location.pathname.startsWith('/d/')) {
                    currentId = location.pathname.split('/')[2];
                }
            }
            setDecisionId(currentId);

            const hash = location.hash;
            let keyString = null;
            if (hash && hash.includes('key=')) {
                keyString = hash.split('key=')[1];
            }

            if (keyString && EncryptionService.isEnabled()) {
                try {
                    const key = await EncryptionService.importKey(keyString);
                    setEncryptionKey(key);
                } catch (e) {
                    console.warn("Header: Failed to parse encryption key from url", e);
                    setEncryptionKey(null);
                }
            } else {
                setEncryptionKey(null);
            }
        };
        parseUrl();
    }, [location, routeParamsId]);

    const isActive = (path) => location.pathname === path;

    return (
        <header className={styles.navbar}>
            <div className={styles.menu}>
                <Link to="/" className={styles.logo}>
                    {t('header.appName')}
                </Link>
                <nav className={styles.navLinks}>
                    <Link
                        to="/"
                        className={`${styles.navLink} ${isActive('/') ? styles.navLinkActive : ''}`}
                    >
                        {t('header.navDecision')}
                    </Link>
                    {user && (
                        <Link
                            to="/my-decisions"
                            className={`${styles.navLink} ${isActive('/my-decisions') ? styles.navLinkActive : ''}`}
                        >
                            {t('header.navActivities')}
                        </Link>
                    )}
                </nav>
            </div>

            <div className={styles.meta}>
                {user && (
                    <>
                        <button
                            className={styles.textButton}
                            onClick={() => setShowSettings(!showSettings)}
                            type="button"
                            aria-haspopup="true"
                            aria-expanded={showSettings}
                            data-testid="settings-toggle"
                        >
                            <PersonIcon />
                            <span className={styles.userName}>
                                {user.displayName || t('userSettings.guestLabel')}
                            </span>
                            <EditIcon />
                        </button>

                        {user.isAnonymous && (
                            <Link to="/login" className={styles.textButton}>
                                {t('header.navLogin')}
                            </Link>
                        )}
                    </>
                )}

                {!user && (
                    <Link to="/login" className={styles.textButton}>
                        {t('header.navLogin')}
                    </Link>
                )}
            </div>

            {showSettings && user && (
                <UserSettings
                    decisionId={decisionId}
                    encryptionKey={encryptionKey}
                    onClose={() => setShowSettings(false)}
                />
            )}
        </header>
    );
}
