import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

function Login() {
    const { t } = useTranslation();
    const { loginWithGoogle, loginEmail, registerEmail, resetPassword, user } = useUser();
    const navigate = useNavigate();
    const [mode, setMode] = useState('login'); // 'login', 'register', 'reset'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [shouldLink, setShouldLink] = useState(false);

    // If already logged in (and not anonymous), redirect to home
    React.useEffect(() => {
        if (user && !user.isAnonymous) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            await loginWithGoogle(shouldLink);
            navigate(-1); // Go back to where they came from
        } catch {
            setError(t('login.errors.googleFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            if (mode === 'login') {
                await loginEmail(email, password);
                navigate(-1);
            } else if (mode === 'register') {
                await registerEmail(email, password, shouldLink);
                navigate(-1);
            } else if (mode === 'reset') {
                await resetPassword(email);
                setMessage(t('login.resetMessage'));
            }
        } catch (err) {
            console.error(err);
            let msg = t('login.errors.genericFailed');
            if (err.code === 'auth/wrong-password') msg = t('login.errors.wrongPassword');
            if (err.code === 'auth/user-not-found') msg = t('login.errors.userNotFound');
            if (err.code === 'auth/invalid-credential') msg = t('login.errors.invalidCredential');
            if (err.code === 'auth/email-already-in-use') msg = t('login.errors.emailInUse');
            if (err.code === 'auth/weak-password') msg = t('login.errors.weakPassword');
            if (err.code === 'auth/invalid-email') msg = t('login.errors.invalidEmail');
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                    {mode === 'login' && t('login.titleWelcome')}
                    {mode === 'register' && t('login.titleRegister')}
                    {mode === 'reset' && t('login.titleReset')}
                </h2>

                {error && <div style={{ color: 'var(--color-danger)', marginBottom: '1rem', background: '#fee2e2', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}
                {message && <div style={{ color: 'var(--color-success)', marginBottom: '1rem', background: '#dcfce7', padding: '0.5rem', borderRadius: '4px' }}>{message}</div>}

                {/* Tabs */}
                <div style={{ display: 'flex', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                    <button
                        type="button"
                        onClick={() => { setMode('login'); setError(''); setMessage(''); }}
                        style={{
                            flex: 1,
                            padding: '0.5rem',
                            background: 'none',
                            border: 'none',
                            borderBottom: mode === 'login' ? '2px solid var(--color-primary)' : '2px solid transparent',
                            color: mode === 'login' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                            fontWeight: mode === 'login' ? '600' : '400'
                        }}
                    >
                        {t('login.tabSignIn')}
                    </button>
                    <button
                        type="button"
                        onClick={() => { setMode('register'); setError(''); setMessage(''); }}
                        style={{
                            flex: 1,
                            padding: '0.5rem',
                            background: 'none',
                            border: 'none',
                            borderBottom: mode === 'register' ? '2px solid var(--color-primary)' : '2px solid transparent',
                            color: mode === 'register' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                            fontWeight: mode === 'register' ? '600' : '400'
                        }}
                    >
                        {t('login.tabRegister')}
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: 'var(--color-text-muted)' }}>{t('login.labelEmail')}</label>
                        <input
                            type="email"
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder={t('login.placeholderEmail')}
                        />
                    </div>

                    {mode !== 'reset' && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: 'var(--color-text-muted)' }}>{t('login.labelPassword')}</label>
                            <input
                                type="password"
                                className="input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                minLength={6}
                            />
                        </div>
                    )}

                    {user && user.isAnonymous && mode !== 'reset' && (
                        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                            <input
                                type="checkbox"
                                id="link-account"
                                checked={shouldLink}
                                onChange={(e) => setShouldLink(e.target.checked)}
                                style={{ marginRight: '0.5rem' }}
                            />
                            <label htmlFor="link-account" style={{ fontSize: '0.875rem', color: 'var(--color-text-main)' }}>
                                {t('login.linkAccountCheckbox')}
                            </label>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ width: '100%', marginBottom: '1rem', padding: '0.75rem' }}
                    >
                        {loading ? t('login.buttonProcessing') : (
                            <>
                                {mode === 'login' && t('login.buttonSignIn')}
                                {mode === 'register' && t('login.buttonCreateAccount')}
                                {mode === 'reset' && t('login.buttonSendReset')}
                            </>
                        )}
                    </button>
                </form>

                {mode === 'login' && (
                    <div style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '0.875rem' }}>
                        <button
                            onClick={() => setMode('reset')}
                            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', textDecoration: 'underline' }}
                        >
                            {t('login.forgotPassword')}
                        </button>
                    </div>
                )}

                {(mode === 'login' || mode === 'register') && (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0' }}>
                            <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></div>
                            <span style={{ padding: '0 0.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{t('login.dividerOr')}</span>
                            <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="btn"
                            style={{
                                width: '100%',
                                background: 'white',
                                border: '1px solid var(--color-border)',
                                color: 'var(--color-text-main)'
                            }}
                        >
                            <span style={{ marginRight: '0.5rem' }}>G</span>
                            {mode === 'register' ? t('login.googleSignUp') : t('login.googleSignIn')}
                        </button>
                    </>
                )}

                {mode === 'reset' && (
                    <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem' }}>
                        <button
                            onClick={() => setMode('login')}
                            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', textDecoration: 'underline' }}
                        >
                            {t('login.backToLogin')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Login;
