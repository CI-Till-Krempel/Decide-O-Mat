import React from 'react';
import { Link, useParams } from 'react-router-dom';

import UserSettings from './UserSettings';

export default function Header() {
    // Actually UserSettings handles it. So we can remove useUser from Header entirely if imports allow.
    // But let's just remove the destructuring for now or remove the line if possible.


    // Attempt to get decisionId from params if we are on a decision page
    // Note: This might not work if Header is outside the Routes that define :id
    // But commonly it is. We can parse location.pathname manually if needed.
    // For now let's just render UserSettings. If it needs decisionId to update votes, we might need a context or verify if useParams works.
    const { id: decisionId } = useParams();



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
            <Link to="/" style={{ textDecoration: 'none', color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '1.5rem' }}>
                Decide-O-Mat
            </Link>
            <div>
                {/* Unified User Settings / Login / Logout */}
                <UserSettings decisionId={decisionId} />
            </div>
        </header>
    );
}
