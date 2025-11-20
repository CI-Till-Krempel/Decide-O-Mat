import React, { useState } from 'react';
import { addArgument } from '../services/firebase';

function AddArgumentForm({ decisionId, type }) {
    const [text, setText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        setIsSubmitting(true);
        try {
            await addArgument(decisionId, type, text);
            setText('');
        } catch (error) {
            console.error("Error adding argument:", error);
            alert("Failed to add argument. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="add-argument-form">
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={`Add a ${type}...`}
                disabled={isSubmitting}
            />
            <button type="submit" disabled={isSubmitting || !text.trim()}>
                Add
            </button>
        </form>
    );
}

export default AddArgumentForm;
