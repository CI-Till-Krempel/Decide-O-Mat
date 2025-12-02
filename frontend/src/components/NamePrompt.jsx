import React, { useState } from 'react';

function NamePrompt({ onSave, onCancel }) {
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            onSave(name.trim());
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                maxWidth: '400px',
                width: '90%'
            }}>
                <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>What's your name?</h2>
                <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>
                    Your name will be shown with your contributions to help others identify you.
                </p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        autoFocus
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '1rem',
                            marginBottom: '1rem',
                            boxSizing: 'border-box'
                        }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        {onCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    backgroundColor: 'white',
                                    cursor: 'pointer',
                                    fontSize: '1rem'
                                }}
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={!name.trim()}
                            style={{
                                padding: '0.75rem 1.5rem',
                                border: 'none',
                                borderRadius: '4px',
                                backgroundColor: name.trim() ? 'var(--color-primary)' : '#ccc',
                                color: 'white',
                                cursor: name.trim() ? 'pointer' : 'not-allowed',
                                fontSize: '1rem'
                            }}
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default NamePrompt;
