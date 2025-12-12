import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { getUserDecisions } from '../services/firebase';
import EncryptionService from '../services/EncryptionService';

const MyDecisions = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [decisions, setDecisions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDecisions = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const data = await getUserDecisions(user.userId);

                // Content Decryption
                const decryptedData = await Promise.all(data.map(async (d) => {
                    try {
                        // Check for stored key
                        const key = await EncryptionService.getStoredKey(d.id);
                        if (key && d.question) {
                            try {
                                const plain = await EncryptionService.decrypt(d.question, key);
                                return { ...d, question: plain };
                            } catch {
                                // Decryption failed (wrong key?), keep original
                                return d;
                            }
                        }
                    } catch {
                        // Key retrieval failed, ignore
                    }
                    return d;
                }));

                setDecisions(decryptedData);
            } catch (err) {
                console.error("Failed to fetch decisions:", err);
                setError("Failed to load your decisions.");
            } finally {
                setLoading(false);
            }
        };

        fetchDecisions();
    }, [user]);

    if (!user) {
        return (
            <div className="container">
                <p>Please log in to view your decisions.</p>
            </div>
        );
    }

    if (loading) {
        return <div className="container"><p>Loading...</p></div>;
    }

    return (
        <div className="container">
            <h1>My Decisions</h1>
            {error && <p className="error">{error}</p>}

            {decisions.length === 0 ? (
                <p>You haven't created or participated in any decisions yet.</p>
            ) : (
                <ul className="decision-list" style={{ listStyle: 'none', padding: 0 }}>
                    {decisions.map((decision) => (
                        <li
                            key={decision.id}
                            className="decision-item card"
                            onClick={() => {
                                const key = EncryptionService.getStoredKeyString(decision.id);
                                const hash = key ? `#key=${key}` : '';
                                navigate(`/d/${decision.id}${hash}`);
                            }}
                            style={{ cursor: 'pointer', marginBottom: '1rem', padding: '1rem' }}
                        >
                            <div className="decision-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0 }}>{decision.question}</h3>
                                {decision.role === 'owner' && (
                                    <span className="badge" style={{
                                        backgroundColor: 'var(--color-primary)',
                                        color: 'white',
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '4px',
                                        fontSize: '0.8rem'
                                    }}>
                                        Owner
                                    </span>
                                )}
                                {decision.role === 'participant' && (
                                    <span className="badge" style={{
                                        backgroundColor: 'var(--color-secondary)',
                                        color: 'white',
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '4px',
                                        fontSize: '0.8rem'
                                    }}>
                                        Invitee
                                    </span>
                                )}
                            </div>
                            <div className="decision-meta" style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                                <span className={`status-indicator ${decision.status === 'closed' ? 'closed' : 'open'}`}>
                                    {decision.status === 'closed' ? 'Closed' : 'Open'}
                                </span>
                                <span className="separator"> • </span>
                                <span>{new Date(decision.createdAt?.toDate ? decision.createdAt.toDate() : decision.createdAt).toLocaleDateString()}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MyDecisions;
