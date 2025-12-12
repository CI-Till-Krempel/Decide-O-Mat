import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { updateUserDisplayName } from '../services/firebase';
import ParticipantService from '../services/ParticipantService';
import MagicLinkData from './MagicLinkData';
import NameGenerator from '../utils/NameGenerator';

function UserSettings({ decisionId, encryptionKey }) {
    const { user, login, logout, setDisplayName, resetToInitialName, getInitialName } = useUser();
    const [isEditing, setIsEditing] = useState(false);
    const [showTransfer, setShowTransfer] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [editedName, setEditedName] = useState(user.displayName || '');

    useEffect(() => {
        setEditedName(user.displayName || '');
    }, [user.displayName]);

    const handleSave = async () => {
        if (editedName.trim()) {
            const trimmedName = editedName.trim();
            setDisplayName(trimmedName);
            setIsEditing(false);

            if (decisionId && user.userId) {
                try {
                    // Update global participant map (primary source for chips)
                    await ParticipantService.registerParticipant(decisionId, trimmedName, encryptionKey || null);
                    // Update legacy fields (optional but safe)
                    await updateUserDisplayName(decisionId, trimmedName);
                } catch (error) {
                    console.error("Failed to update display name:", error);
                }
            }
        }
    };

    const handleCancel = () => {
        setEditedName(user.displayName || '');
        setIsEditing(false);
        setShowTransfer(false);
        setShowHelp(false);
        setShowResetConfirm(false);
    };

    const handleResetClick = () => {
        setShowResetConfirm(true);
    };

    const confirmReset = async () => {
        const restoredName = resetToInitialName();
        setShowResetConfirm(false);
        // Sync with backend if participating in a decision
        if (decisionId && user.userId && restoredName) {
            try {
                // Update global participant map
                await ParticipantService.registerParticipant(decisionId, restoredName, encryptionKey || null);
                await updateUserDisplayName(decisionId, restoredName);
            } catch (error) {
                console.error("Failed to reset display name on backend:", error);
            }
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const handleLogin = async () => {
        try {
            await login();
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    if (!user.isAnonymous) {
        return (
            <div style={{
                position: 'fixed',
                top: '1rem',
                right: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                zIndex: 100
            }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                    {user.displayName}
                </span>
                <button
                    onClick={handleLogout}
                    style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        border: '1px solid var(--color-danger)',
                        borderRadius: '4px',
                        backgroundColor: 'white',
                        color: 'var(--color-danger)',
                        cursor: 'pointer'
                    }}
                >
                    Logout
                </button>
            </div>
        );
    }



    if (showTransfer) {
        return (
            <div style={{
                position: 'fixed',
                top: '1rem',
                right: '1rem',
                padding: '1rem',
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                zIndex: 100,
                minWidth: '300px'
            }}>
                <MagicLinkData />
                <button
                    onClick={() => setShowTransfer(false)}
                    style={{
                        marginTop: '0.5rem',
                        width: '100%',
                        padding: '0.5rem',
                        background: 'transparent',
                        border: '1px solid var(--color-text-muted)',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Close
                </button>
            </div>
        );
    }

    if (showResetConfirm) {
        const initialName = getInitialName();
        return (
            <div style={{
                position: 'fixed',
                top: '1rem',
                right: '1rem',
                padding: '1rem',
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                zIndex: 100,
                minWidth: '250px',
                maxWidth: '300px'
            }}>
                <h4 style={{ marginTop: 0 }}>Reset Name?</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                    This will revert your display name to your original anonymous identity:
                </p>
                <div style={{
                    padding: '0.5rem',
                    background: '#f5f5f5',
                    borderRadius: '4px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    marginBottom: '1rem',
                    fontSize: '0.9rem'
                }}>
                    {initialName || 'Original Name'}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => setShowResetConfirm(false)}
                        style={{
                            flex: 1,
                            padding: '0.5rem',
                            fontSize: '0.75rem',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            background: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={confirmReset}
                        style={{
                            flex: 1,
                            padding: '0.5rem',
                            fontSize: '0.75rem',
                            border: 'none',
                            borderRadius: '4px',
                            background: 'var(--color-danger)',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Reset
                    </button>
                </div>
            </div>
        );
    }

    if (showHelp) {
        return (
            <div style={{
                position: 'fixed',
                top: '1rem',
                right: '1rem',
                padding: '1rem',
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                zIndex: 100,
                minWidth: '250px',
                maxWidth: '300px'
            }}>
                <h4 style={{ marginTop: 0 }}>Anonymous Identity</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                    You are participating anonymously. Your identity is stored securely on this device.
                </p>
                <ul style={{ fontSize: '0.875rem', paddingLeft: '1.2rem', color: 'var(--color-text-muted)' }}>
                    <li><strong>Cipher</strong>: Your displayName is encrypted end-to-end. Only people with the link key can see it.</li>
                    <li><strong>No Login</strong>: You don't need an account. We remembered you via a secure ID.</li>
                    <li><strong>Transfer</strong>: Use the transfer button to move your identity to another device.</li>
                </ul>
                <button
                    onClick={() => setShowHelp(false)}
                    style={{
                        marginTop: '0.5rem',
                        width: '100%',
                        padding: '0.5rem',
                        background: 'transparent',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Close
                </button>
            </div>
        );
    }

    if (!isEditing) {
        return (
            <div style={{
                position: 'fixed',
                top: '1rem',
                right: '1rem',
                padding: '0.75rem',
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                gap: '0.75rem',
                zIndex: 100,
                minWidth: '200px'
            }}>
                {/* Identity Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: '500', display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>You are</span>
                        <span title={user.displayName}>{user.displayName || 'Guest'}</span>
                    </div>
                    <div>
                        <button
                            onClick={() => setIsEditing(true)}
                            style={{
                                padding: '4px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '1.1rem',
                                color: 'var(--color-primary)'
                            }}
                            title="Same Name"
                        >
                            ✏️
                        </button>
                    </div>
                </div>

                {/* Actions Group */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={handleResetClick}
                        style={{
                            flex: 1,
                            padding: '0.4rem',
                            fontSize: '0.75rem',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            background: 'white',
                            cursor: 'pointer'
                        }}
                        title="Reset to your initial anonymous name"
                    >
                        🔄 Reset
                    </button>
                    <button
                        onClick={() => setShowTransfer(true)}
                        style={{
                            flex: 1,
                            padding: '0.4rem',
                            fontSize: '0.75rem',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            background: 'white',
                            cursor: 'pointer'
                        }}
                        title="Transfer Identity"
                    >
                        ↔ Transfer
                    </button>
                </div>

                <div style={{ height: '1px', background: '#eee', margin: '0.25rem 0' }}></div>

                {/* Footer Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                        onClick={handleLogin}
                        style={{
                            padding: '0.4rem 0.8rem',
                            fontSize: '0.75rem',
                            border: '1px solid var(--color-success)',
                            borderRadius: '4px',
                            backgroundColor: 'white',
                            color: 'var(--color-success)',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setShowHelp(true)}
                        style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            border: '1px solid #ccc',
                            background: 'white',
                            color: '#666',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        title="Help"
                    >
                        ?
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            padding: '1rem',
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            zIndex: 100,
            minWidth: '250px'
        }}>
            <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 'bold' }}>
                Edit Your Name
            </div>
            <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder="Enter your name"
                autoFocus
                style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    marginBottom: '0.5rem',
                    boxSizing: 'border-box'
                }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                    onClick={handleCancel}
                    style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        backgroundColor: 'white',
                        cursor: 'pointer'
                    }}
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={!editedName.trim()}
                    style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.75rem',
                        border: 'none',
                        borderRadius: '4px',
                        backgroundColor: editedName.trim() ? 'var(--color-primary)' : '#ccc',
                        color: 'white',
                        cursor: editedName.trim() ? 'pointer' : 'not-allowed'
                    }}
                >
                    Save
                </button>
            </div>
        </div>
    );
}

export default UserSettings;
