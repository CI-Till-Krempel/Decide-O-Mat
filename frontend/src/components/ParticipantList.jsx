import React from 'react';

const ParticipantList = ({ participantMap, isOpen, onClose }) => {
    // Convert map to array
    const participants = Array.from(participantMap.entries()).map(([id, data]) => ({
        id,
        ...data
    }));

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            height: '100vh',
            width: '300px',
            backgroundColor: 'var(--color-surface)',
            boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
            zIndex: 1000,
            padding: '2rem 1rem',
            overflowY: 'auto',
            transition: 'transform 0.3s ease-in-out',
            transform: isOpen ? 'translateX(0)' : 'translateX(100%)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem' }}>Participants ({participants.length})</h2>
                <button
                    onClick={onClose}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer'
                    }}
                >
                    &times;
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {participants.length === 0 && (
                    <div style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>
                        No participants yet.
                    </div>
                )}

                {participants.map((p) => (
                    <div key={p.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.5rem',
                        borderRadius: '8px',
                        backgroundColor: 'var(--color-background)',
                        border: '1px solid var(--color-border)'
                    }}>
                        {p.photoURL ? (
                            <img src={p.photoURL} alt={p.name} style={{ width: 32, height: 32, borderRadius: '50%' }} />
                        ) : (
                            <div style={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                backgroundColor: p.isAnonymous ? '#fef08a' : '#bbf7d0', // Yellow vs Green
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem'
                            }}>
                                {p.isAnonymous ? '👤' : '🟢'}
                            </div>
                        )}
                        <div>
                            <div style={{ fontWeight: '500' }}>
                                {p.name || 'Unknown'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                {p.isAnonymous ? 'Anonymous' : 'Verified'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                <p>🟡 Anonymous accounts are temporary.</p>
                <p>🟢 Verified accounts are permanent.</p>
            </div>
        </div>
    );
};

export default ParticipantList;
