import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../services/firebase';
import EncryptionService from '../services/EncryptionService';

export default function Home() {
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleStart = async () => {
        if (!question.trim()) return;

        setLoading(true);
        setError('');

        try {
            let questionToSubmit = question;
            let keyString = '';

            if (EncryptionService.isEnabled()) {
                const key = await EncryptionService.generateKey();
                keyString = await EncryptionService.exportKey(key);
                questionToSubmit = await EncryptionService.encrypt(question, key);
            }

            const createDecision = httpsCallable(functions, 'createDecision');
            const result = await createDecision({ question: questionToSubmit });

            let targetUrl = `/d/${result.data.id}`;
            if (keyString) {
                targetUrl += `#key=${keyString}`;
            }

            navigate(targetUrl);
        } catch (err) {
            console.error(err);
            setError('Failed to create decision. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>Decide-O-Mat</h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                    The easiest way to make group decisions. No login required.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '500px' }}>
                        <input
                            type="text"
                            className="input"
                            placeholder="What do you need to decide?"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                            disabled={loading}
                        />
                        <button
                            className="btn btn-primary"
                            style={{ whiteSpace: 'nowrap' }}
                            onClick={handleStart}
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Start Deciding'}
                        </button>
                    </div>
                    {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}
                </div>
            </div>
        </div>
    );
}
