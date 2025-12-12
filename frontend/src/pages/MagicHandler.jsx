import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useUser } from '../contexts/UserContext';
import Spinner from '../components/Spinner';

function MagicHandler() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const { user: currentUser } = useUser(); // Get current context user for display name
    const [status, setStatus] = useState(token ? 'processing' : 'error'); // processing, confirming, success, error

    // We need to track if we've already checked the user status to avoid loops
    const [hasCheckedUser, setHasCheckedUser] = useState(false);

    const performSignIn = async () => {
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
    };

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

    }, [token, currentUser, hasCheckedUser, status]); // eslint-disable-line react-hooks/exhaustive-deps


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
                    <h2>Processing...</h2>
                    <Spinner size="lg" color="var(--color-primary)" />
                </div>
            )}

            {status === 'confirming' && (
                <div style={{ maxWidth: '400px', margin: '0 auto', border: '1px solid var(--color-border)', padding: '2rem', borderRadius: '8px', background: 'white' }}>
                    <h2 style={{ color: 'var(--color-warning)' }}>Switch Account?</h2>
                    <p>You are currently logged in as:</p>
                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{currentUser?.displayName || 'Anonymous User'}</p>
                    <p style={{ margin: '1.5rem 0' }}>Using this link will <strong>overwrite</strong> your current session on this device.</p>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button onClick={handleCancel} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button onClick={handleConfirmSwitch} className="btn btn-primary">
                            Yes, Switch
                        </button>
                    </div>
                </div>
            )}

            {status === 'success' && (
                <div style={{ color: 'var(--color-success)' }}>
                    <h2>Transfer Successful!</h2>
                    <p>You are now logged in with your original identity.</p>
                    <p>Redirecting...</p>
                </div>
            )}

            {status === 'error' && (
                <div style={{ color: 'var(--color-danger)' }}>
                    <h2>Transfer Failed</h2>
                    <p>The link may be invalid or expired.</p>
                    <button onClick={() => navigate('/')} className="btn">Go Home</button>
                </div>
            )}
        </div>
    );
}

export default MagicHandler;
