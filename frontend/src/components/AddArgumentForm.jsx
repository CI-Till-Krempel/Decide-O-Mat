import React, { useState } from 'react';
import { addArgument } from '../services/firebase';
import { useUser } from '../contexts/UserContext';
import EncryptionService from '../services/EncryptionService';
import NamePrompt from './NamePrompt';

function AddArgumentForm({ decisionId, type, readOnly, encryptionKey }) {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [showNamePrompt, setShowNamePrompt] = useState(false);
    const { user, setDisplayName } = useUser();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim() || loading || readOnly) return;

        // Check if user has a display name
        if (!user.displayName) {
            setShowNamePrompt(true);
            return;
        }

        await submitArgument();
    };

    const submitArgument = async () => {
        setLoading(true);
        try {
            let textToSubmit = text;
            let nameToSubmit = user.displayName;

            if (encryptionKey) {
                textToSubmit = await EncryptionService.encrypt(text, encryptionKey);
                nameToSubmit = await EncryptionService.encrypt(nameToSubmit, encryptionKey);
            }

            await addArgument(decisionId, type, textToSubmit, nameToSubmit, user.userId);
            setText('');
        } catch (error) {
            console.error("Error adding argument:", error);
            alert("Failed to add argument. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleNameSave = async (name) => {
        setDisplayName(name);
        setShowNamePrompt(false);
        // Submit the argument after saving the name
        await submitArgument();
    };

    return (
        <>
            {showNamePrompt && (
                <NamePrompt
                    onSave={handleNameSave}
                    onCancel={() => setShowNamePrompt(false)}
                />
            )}
            <form onSubmit={handleSubmit} style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={`Add a ${type === 'pro' ? 'Pro' : 'Con'}...`}
                    disabled={loading || readOnly}
                    style={{
                        flex: 1,
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        backgroundColor: readOnly ? '#f5f5f5' : 'white',
                        cursor: readOnly ? 'not-allowed' : 'text'
                    }}
                />
                <button
                    type="submit"
                    disabled={loading || !text.trim() || readOnly}
                    className="btn"
                    style={{
                        background: (loading || !text.trim() || readOnly) ? '#ccc' : 'var(--color-primary)',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        cursor: (loading || !text.trim() || readOnly) ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Adding...' : 'Add'}
                </button>
            </form>
        </>
    );
}

export default AddArgumentForm;
