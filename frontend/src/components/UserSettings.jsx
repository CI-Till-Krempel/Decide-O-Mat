import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { updateUserDisplayName } from '../services/firebase';
import ParticipantService from '../services/ParticipantService';
import MagicLinkData from './MagicLinkData';

const panelStyle = {
    position: 'fixed',
    top: '4rem',
    right: '1rem',
    padding: '1rem',
    backgroundColor: 'var(--color-bg-card)',
    border: '1px solid var(--color-border-card)',
    borderRadius: 'var(--radius-sm)',
    boxShadow: 'var(--shadow-lg)',
    zIndex: 110,
    minWidth: '280px',
    maxWidth: '320px',
    color: 'var(--color-text-on-surface)',
};

const btnSecondary = {
    padding: '0.5rem',
    fontSize: '0.75rem',
    border: '1px solid var(--color-border-outline)',
    borderRadius: 'var(--radius-xs)',
    background: 'transparent',
    color: 'var(--color-text-on-surface)',
    cursor: 'pointer',
};

const btnDanger = {
    padding: '0.5rem',
    fontSize: '0.75rem',
    border: 'none',
    borderRadius: 'var(--radius-xs)',
    background: 'var(--color-danger)',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
};

function UserSettings({ decisionId, encryptionKey, onClose }) {
    const { user, logout, deleteAccount, setDisplayName, resetToInitialName, getInitialName } = useUser();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [showTransfer, setShowTransfer] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [editedName, setEditedName] = useState(user?.displayName || '');
    const panelRef = useRef(null);

    const handleClose = () => {
        setIsEditing(false);
        setShowTransfer(false);
        setShowHelp(false);
        setShowResetConfirm(false);
        setShowDeleteConfirm(false);
        setDeletePassword('');
        setDeleteError('');
        if (onClose) onClose();
    };

    useEffect(() => {
        if (user?.displayName && user.displayName !== editedName) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setEditedName(user.displayName);
        }
    }, [user?.displayName]); // eslint-disable-line react-hooks/exhaustive-deps

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                handleClose();
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    });

    const handleSave = async () => {
        if (editedName.trim()) {
            const trimmedName = editedName.trim();
            setDisplayName(trimmedName);
            setIsEditing(false);

            if (decisionId && user.userId) {
                try {
                    await ParticipantService.registerParticipant(decisionId, trimmedName, encryptionKey || null);
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
        setShowDeleteConfirm(false);
        setDeletePassword('');
        setDeleteError('');
    };

    const confirmReset = async () => {
        const restoredName = resetToInitialName();
        setShowResetConfirm(false);
        if (decisionId && user.userId && restoredName) {
            try {
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
            handleClose();
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const handleDeleteAccount = async () => {
        setDeleteError('');
        try {
            await deleteAccount(deletePassword);
            setShowDeleteConfirm(false);
            handleClose();
        } catch (error) {
            setDeleteError("Failed to delete account. Check password.");
            console.error(error);
        }
    };

    const handleLogin = () => {
        handleClose();
        navigate('/login');
    };

    if (!user) return null;

    // Delete confirmation
    if (showDeleteConfirm) {
        const needsPassword = user.providers && user.providers.includes('password');
        return (
            <div ref={panelRef} style={panelStyle}>
                <h4 style={{ marginTop: 0, color: 'var(--color-danger)' }}>Delete Account?</h4>
                <p style={{ fontSize: '0.85rem' }}>
                    This action is <strong>irreversible</strong>. Not even we can undo this.
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    Your votes will be anonymized to preserve decision integrity.
                </p>
                {needsPassword && (
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem', color: 'var(--color-text-muted)' }}>Confirm Password:</label>
                        <input
                            type="password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            className="input"
                        />
                    </div>
                )}
                {deleteError && <div style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{deleteError}</div>}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={handleCancel} style={{ ...btnSecondary, flex: 1 }}>Cancel</button>
                    <button onClick={handleDeleteAccount} style={{ ...btnDanger, flex: 1 }}>Delete</button>
                </div>
            </div>
        );
    }

    // Authenticated (non-anonymous) user
    if (!user.isAnonymous) {
        return (
            <div ref={panelRef} style={{ ...panelStyle, display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 'auto' }}>
                {user.photoURL && (
                    <img
                        src={user.photoURL}
                        alt="Avatar"
                        style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                    />
                )}
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                    {user.displayName}
                </span>
                <button onClick={handleLogout} style={btnSecondary}>
                    Logout
                </button>
                <button onClick={() => setShowDeleteConfirm(true)} style={btnDanger}>
                    Delete
                </button>
            </div>
        );
    }

    // Transfer panel
    if (showTransfer) {
        return (
            <div ref={panelRef} style={panelStyle}>
                <MagicLinkData />
                <button onClick={() => setShowTransfer(false)} style={{ ...btnSecondary, marginTop: '0.5rem', width: '100%' }}>
                    Close
                </button>
            </div>
        );
    }

    // Reset confirmation
    if (showResetConfirm) {
        const initialName = getInitialName();
        return (
            <div ref={panelRef} style={panelStyle}>
                <h4 style={{ marginTop: 0 }}>Reset Name?</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                    This will revert your display name to your original anonymous identity:
                </p>
                <div style={{
                    padding: '0.5rem',
                    background: 'var(--color-bg-base)',
                    border: '1px solid var(--color-border-card)',
                    borderRadius: 'var(--radius-xs)',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    marginBottom: '1rem',
                    fontSize: '0.9rem'
                }}>
                    {initialName || 'Original Name'}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setShowResetConfirm(false)} style={{ ...btnSecondary, flex: 1 }}>Cancel</button>
                    <button onClick={confirmReset} style={{ ...btnDanger, flex: 1 }}>Reset</button>
                </div>
            </div>
        );
    }

    // Help panel
    if (showHelp) {
        return (
            <div ref={panelRef} style={panelStyle}>
                <h4 style={{ marginTop: 0 }}>Anonymous Identity</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                    You are participating anonymously. Your identity is stored securely on this device.
                </p>
                <ul style={{ fontSize: '0.875rem', paddingLeft: '1.2rem', color: 'var(--color-text-muted)' }}>
                    <li><strong style={{ color: 'var(--color-text-on-surface)' }}>Cipher</strong>: Your display name is encrypted end-to-end.</li>
                    <li><strong style={{ color: 'var(--color-text-on-surface)' }}>No Login</strong>: You don&apos;t need an account. We remembered you via a secure ID.</li>
                    <li><strong style={{ color: 'var(--color-text-on-surface)' }}>Transfer</strong>: Use the transfer button to move your identity to another device.</li>
                </ul>
                <button onClick={() => setShowHelp(false)} style={{ ...btnSecondary, marginTop: '0.5rem', width: '100%' }}>
                    Close
                </button>
            </div>
        );
    }

    // Default panel (anonymous user controls)
    if (!isEditing) {
        return (
            <div ref={panelRef} style={{
                ...panelStyle,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                minWidth: '220px'
            }}>
                {/* Identity Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: '500', display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>You are</span>
                        <span title={user.displayName}>{user.displayName || 'Guest'}</span>
                    </div>
                    <button
                        onClick={() => setIsEditing(true)}
                        style={{
                            padding: '4px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1.1rem',
                            color: 'var(--color-accent-secondary)'
                        }}
                        title="Edit Name"
                    >
                        ✏️
                    </button>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setShowResetConfirm(true)} style={{ ...btnSecondary, flex: 1 }} title="Reset to your initial anonymous name">
                        Reset
                    </button>
                    <button onClick={() => setShowTransfer(true)} style={{ ...btnSecondary, flex: 1 }} title="Transfer Identity">
                        Transfer
                    </button>
                </div>

                <div style={{ height: '1px', background: 'var(--color-border-card)', margin: '0.25rem 0' }} />

                {/* Footer Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                        onClick={handleLogin}
                        style={{
                            ...btnSecondary,
                            border: '1px solid var(--color-accent-primary)',
                            color: 'var(--color-accent-primary)',
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
                            border: '1px solid var(--color-border-outline)',
                            background: 'transparent',
                            color: 'var(--color-text-muted)',
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

    // Edit name panel
    return (
        <div ref={panelRef} style={panelStyle}>
            <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 'bold' }}>
                Edit Your Name
            </div>
            <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder="Enter your name"
                autoFocus
                className="input"
                style={{ marginBottom: '0.5rem' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button onClick={handleCancel} style={btnSecondary}>Cancel</button>
                <button
                    onClick={handleSave}
                    disabled={!editedName.trim()}
                    style={{
                        ...btnSecondary,
                        border: 'none',
                        backgroundColor: editedName.trim() ? 'var(--color-accent-secondary)' : 'var(--color-border-outline)',
                        color: editedName.trim() ? 'var(--color-text-on-secondary)' : 'var(--color-text-muted)',
                        cursor: editedName.trim() ? 'pointer' : 'not-allowed',
                        fontWeight: 'bold'
                    }}
                >
                    Save
                </button>
            </div>
        </div>
    );
}

export default UserSettings;
