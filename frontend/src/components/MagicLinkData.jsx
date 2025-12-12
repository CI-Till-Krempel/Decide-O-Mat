import React, { useState } from 'react';
import { generateMagicLink } from '../services/firebase';
import Spinner from './Spinner';

function MagicLinkData() {
    const [magicLink, setMagicLink] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await generateMagicLink();
            // Construct the full URL
            const url = `${window.location.origin}/magic?token=${token}`;
            setMagicLink(url);
        } catch (err) {
            console.error("Failed to generate magic link", err);
            setError("Failed to generate link. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (magicLink) {
            navigator.clipboard.writeText(magicLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px', marginTop: '1rem' }}>
            <h3 style={{ marginTop: 0 }}>Transfer Identity</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                Transfer your anonymous identity and votes to another device.
            </p>

            {!magicLink ? (
                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="btn"
                    style={{ width: '100%' }}
                >
                    {loading ? <Spinner size="sm" color="white" /> : 'Generate Magic Link'}
                </button>
            ) : (
                <div>
                    <div style={{
                        background: 'var(--color-bg-secondary)',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        wordBreak: 'break-all',
                        fontSize: '0.8rem',
                        marginBottom: '0.5rem',
                        fontFamily: 'monospace'
                    }}>
                        {magicLink}
                    </div>
                    <button
                        onClick={handleCopy}
                        className="btn"
                        style={{ width: '100%', background: copied ? 'var(--color-success)' : 'var(--color-primary)' }}
                    >
                        {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                    <div style={{
                        marginTop: '0.5rem',
                        color: 'var(--color-danger)',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                    }}>
                        ⚠️ CAUTION: Do not share this link. It provides full access to your account.
                    </div>
                </div>
            )}

            {error && <div style={{ color: 'var(--color-danger)', marginTop: '0.5rem', fontSize: '0.9rem' }}>{error}</div>}
        </div>
    );
}

export default MagicLinkData;
