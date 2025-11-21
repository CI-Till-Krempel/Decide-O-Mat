import React, { useState } from 'react';
import { addArgument } from '../services/firebase';

function AddArgumentForm({ decisionId, type, readOnly }) {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim() || loading || readOnly) return;

        setLoading(true);
        try {
            await addArgument(decisionId, type, text);
            setText('');
        } catch (error) {
            console.error("Error adding argument:", error);
            alert("Failed to add argument. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
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
    );
}

export default AddArgumentForm;
