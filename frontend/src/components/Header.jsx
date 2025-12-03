import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

export default function Header() {
    const { user, logout } = useUser();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

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
                {user && !user.isAnonymous ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {user.photoURL && (
                            <img
                                src={user.photoURL}
                                alt={user.displayName}
                                style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                            />
                        )}
                        <span style={{ fontWeight: '500' }}>{user.displayName}</span>
                        <button
                            onClick={handleLogout}
                            className="btn"
                            style={{
                                fontSize: '0.875rem',
                                padding: '0.5rem 1rem',
                                background: 'var(--color-bg-secondary)',
                                color: 'var(--color-text)'
                            }}
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none', fontSize: '0.9rem' }}>
                        Login
                    </Link>
                )}
            </div>
        </header>
    );
}
