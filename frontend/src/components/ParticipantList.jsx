import React from 'react';

const ParticipantList = ({ participantMap, isOpen, onClose, ownerId }) => {
    // Convert map to array
    const participants = Array.from(participantMap.entries()).map(([id, data]) => ({
        id,
        ...data
    })).sort((a, b) => {
        if (a.id === ownerId) return -1;
        if (b.id === ownerId) return 1;
        return 0;
    });

    if (!isOpen) return null;

    return (
        <div className={`participant-list-overlay ${isOpen ? 'open' : 'closed'}`}>
            <div className="participant-header">
                <h2 style={{ fontSize: '1.25rem' }}>Participants ({participants.length})</h2>
                <button
                    onClick={onClose}
                    className="participant-close-btn"
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
                    <div key={p.id} className="participant-item">
                        {p.photoURL ? (
                            <img src={p.photoURL} alt={p.name} className="participant-avatar" />
                        ) : (
                            <div className="participant-avatar" style={{
                                backgroundColor: p.isAnonymous ? '#fef08a' : '#bbf7d0', // Yellow vs Green
                            }}>
                                {p.isAnonymous ? '👤' : '🟢'}
                            </div>
                        )}
                        <div>
                            <div style={{ fontWeight: '500' }}>
                                {p.name || 'Unknown'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <span>{p.isAnonymous ? '👤' : '🟢'}</span>
                                <span>{p.isAnonymous ? 'Anonymous' : 'Verified'}</span>
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
