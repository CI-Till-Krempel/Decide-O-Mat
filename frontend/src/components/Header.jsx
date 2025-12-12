import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import EncryptionService from '../services/EncryptionService';

import UserSettings from './UserSettings';

export default function Header() {
    const { user } = useUser();
    const { id: routeParamsId } = useParams();
    const location = useLocation();
    const [encryptionKey, setEncryptionKey] = useState(null);
    const [decisionId, setDecisionId] = useState(null);

    useEffect(() => {
        const parseUrl = async () => {
            // Extract decisionId from path if not found in params (Header is often outside Route so useParams might be empty)
            let currentId = routeParamsId;
            if (!currentId) {
                if (location.pathname.startsWith('/decision/')) {
                    const parts = location.pathname.split('/');
                    currentId = parts[2];
                } else if (location.pathname.startsWith('/d/')) {
                    const parts = location.pathname.split('/');
                    currentId = parts[2];
                }
            }
            setDecisionId(currentId);

            // Extract Key from Hash (format #key=...)
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

    return (
        <header style={{
            padding: '1rem 2rem',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'white',
            marginBottom: '2rem'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <Link to="/" style={{ textDecoration: 'none', color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '1.5rem' }}>
                    Decide-O-Mat
                </Link>
                {user && (
                    <Link to="/my-decisions" style={{ textDecoration: 'none', color: 'var(--text-color)', fontWeight: '500' }}>
                        My Decisions
                    </Link>
                )}
            </div>
            <div>
                {/* Unified User Settings / Login / Logout */}
                <UserSettings decisionId={decisionId} encryptionKey={encryptionKey} />
            </div>
        </header>
    );
}
