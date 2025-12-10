import React from 'react';
import { useLocation } from 'react-router-dom';
import EncryptionService from '../services/EncryptionService';
import LockIcon from './LockIcon';

const Footer = () => {
    const location = useLocation();
    const isEncrypted = EncryptionService.isEnabled();
    const hasKey = location.hash && location.hash.includes('key=');
    // Safe access to global __APP_ENV__ which might be replaced by Vite or undefined in tests
    const appEnv = typeof __APP_ENV__ !== 'undefined' ? __APP_ENV__ : 'Local';
    const appVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0';

    return (
        <footer style={{
            padding: '1rem',
            textAlign: 'center',
            marginTop: 'auto',
            borderTop: '1px solid var(--color-border)',
            fontSize: '0.875rem',
            color: 'var(--color-text-muted)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem'
        }}>
            {isEncrypted ? (
                <>
                    <span style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <LockIcon isOpen={!!hasKey} size={14} /> End-to-End Encrypted
                    </span>
                    <span>|</span>
                    <span>v{appVersion}</span>
                </>
            ) : (
                <>
                    <span style={{ color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <LockIcon isOpen={true} size={14} color="var(--color-danger)" /> Unencrypted ({appEnv})
                    </span>
                    <span>|</span>
                    <span>v{appVersion}</span>
                </>
            )}
        </footer>
    );
};

export default Footer;
