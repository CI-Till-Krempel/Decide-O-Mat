import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';

function UserSettings() {
    const { user, setDisplayName } = useUser();
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(user.displayName || '');

    const handleSave = () => {
        if (newName.trim()) {
            setDisplayName(newName.trim());
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setNewName(user.displayName || '');
        setIsEditing(false);
    };

    if (!isEditing) {
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
                    {user.displayName ? `Signed in as ${user.displayName}` : 'No name set'}
                </span>
                <button
                    onClick={() => setIsEditing(true)}
                    style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        border: '1px solid var(--color-primary)',
                        borderRadius: '4px',
                        backgroundColor: 'white',
                        color: 'var(--color-primary)',
                        cursor: 'pointer'
                    }}
                >
                    Edit
                </button>
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
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
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
                    disabled={!newName.trim()}
                    style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.75rem',
                        border: 'none',
                        borderRadius: '4px',
                        backgroundColor: newName.trim() ? 'var(--color-primary)' : '#ccc',
                        color: 'white',
                        cursor: newName.trim() ? 'pointer' : 'not-allowed'
                    }}
                >
                    Save
                </button>
            </div>
        </div>
    );
}

export default UserSettings;
