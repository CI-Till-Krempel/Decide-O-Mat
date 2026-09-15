import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useUser } from '../contexts/UserContext';
import Spinner from '../components/Spinner';

function getTokenFromUrl(searchParams) {
    const queryToken = searchParams.get('token');
    if (queryToken) return queryToken;
    if (typeof window !== 'undefined' && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        return hashParams.get('token');
    }
    return null;
}

function MagicHandler() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [token] = useState(() => getTokenFromUrl(searchParams));
    const { user: currentUser } = useUser(); // Get current context user for display name
    const [status, setStatus] = useState(token ? 'processing' : 'error'); // processing, confirming, success, error

    useEffect(() => {
        if (typeof window !== 'undefined' && (searchParams.get('token') || window.location.hash.includes('token='))) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [searchParams]);

    // We need to track if we've already checked the user status to avoid loops
    const [hasCheckedUser, setHasCheckedUser] = useState(false);

    const performSignIn = useCallback(async () => {
        try {
            await signInWithCustomToken(auth, token);
            setStatus('success');
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (error) {
            console.error("Magic link failed", error);
            setStatus('error');
        }
    }, [token, navigate]);

    useEffect(() => {
        if (!token) {
            return;
        }

        // Wait for initial auth load
        // currentUser is null initially? No, useUser returns loading. 
        // But hook runs after mount.
        // We can check auth.currentUser directly for synchronous state mostly, 
        // but useUser gives us the "Decide-O-Mat" enriched user (with local name).

        // This effect might run multiple times.
        if (hasCheckedUser) return;

        // If we are already confirmed or errored, do nothing here.
        if (status !== 'processing') return;

        const checkAndProcess = async () => {
            // Artificial delay to ensure auth is settled if needed? 
            // auth.currentUser is usually ready if we are in the app, but this is a fresh load.
            // We should rely on auth state change?
            // Actually, `useUser` handles loading state for us in the parent usually?
            // No, App.jsx renders MagicHandler inside UserProvider. UserProvider handles loading.
            // So if we are here, UserProvider has loaded.

            if (currentUser) {
                // User is logged in.
                setStatus('confirming');
                setHasCheckedUser(true);
            } else {
                // No user, proceed purely.
                setHasCheckedUser(true);
                performSignIn();
            }
        };

        // We need to wait for UserContext loading? UserProvider renders children only after loading is false.
        // So currentUser is stable-ish.
        checkAndProcess();

    }, [token, currentUser, hasCheckedUser, status, performSignIn]);


    const handleConfirmSwitch = () => {
        setStatus('processing');
        performSignIn();
    };

    const handleCancel = () => {
        navigate('/');
    };

    return (
        <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
            {status === 'processing' && (
                <div>
                    <h2>{t('magicHandler.processing')}</h2>
                    <Spinner size="lg" color="var(--color-primary)" />
                </div>
            )}

            {status === 'confirming' && (
                <div style={{ maxWidth: '400px', margin: '0 auto', border: '1px solid var(--color-border)', padding: '2rem', borderRadius: '8px', background: 'white' }}>
                    <h2 style={{ color: 'var(--color-warning)' }}>{t('magicHandler.confirmTitle')}</h2>
                    <p>{t('magicHandler.confirmCurrentUser')}</p>
                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{currentUser?.displayName || 'Anonymous User'}</p>
                    <p style={{ margin: '1.5rem 0' }}>{t('magicHandler.confirmWarning')}</p>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button onClick={handleCancel} className="btn btn-secondary">
                            {t('magicHandler.buttonCancel')}
                        </button>
                        <button onClick={handleConfirmSwitch} className="btn btn-primary">
                            {t('magicHandler.buttonConfirm')}
                        </button>
                    </div>
                </div>
            )}

            {status === 'success' && (
                <div style={{ color: 'var(--color-success)' }}>
                    <h2>{t('magicHandler.successTitle')}</h2>
                    <p>{t('magicHandler.successMessage')}</p>
                    <p>{t('magicHandler.redirecting')}</p>
                </div>
            )}

            {status === 'error' && (
                <div style={{ color: 'var(--color-danger)' }}>
                    <h2>{t('magicHandler.errorTitle')}</h2>
                    <p>{t('magicHandler.errorMessage')}</p>
                    <button onClick={() => navigate('/')} className="btn">{t('magicHandler.buttonGoHome')}</button>
                </div>
            )}
        </div>
    );
}

export default MagicHandler;
