import React from 'react';
import { useLocation } from 'react-router-dom';
import EncryptionService from '../services/EncryptionService';
import LockIcon from './LockIcon';

const Footer = () => {
    const location = useLocation();
    const isEncrypted = EncryptionService.isEnabled();
    const hasKey = location.hash && location.hash.includes('key=');

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
                    <span>v1.4</span>
                </>
            ) : (
                <>
                    <span style={{ color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        🔓 Unencrypted (Staging)
                    </span>
                    <span>|</span>
                    <span>v1.4</span>
                </>
            )}
        </footer>
    );
};

export default Footer;
