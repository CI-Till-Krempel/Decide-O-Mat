import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../services/firebase';

export default function Decision() {
    const { id } = useParams();
    const [decision, setDecision] = useState(null);
    const [argumentsList, setArgumentsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newArg, setNewArg] = useState({ type: 'pro', text: '' });
    const [submitting, setSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const decisionRef = doc(db, 'decisions', id);
        const unsubscribeDecision = onSnapshot(decisionRef, (doc) => {
            if (doc.exists()) {
                setDecision({ id: doc.id, ...doc.data() });
            } else {
                setDecision(null);
            }
            setLoading(false);
        });

        const argsRef = collection(db, 'decisions', id, 'arguments');
        const q = query(argsRef, orderBy('createdAt', 'desc'));
        const unsubscribeArgs = onSnapshot(q, (snapshot) => {
            const args = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setArgumentsList(args);
        });

        return () => {
            unsubscribeDecision();
            unsubscribeArgs();
        };
    }, [id]);

    const handleAddArgument = async (e) => {
        e.preventDefault();
        if (!newArg.text.trim()) return;

        setSubmitting(true);
        try {
            const addArgument = httpsCallable(functions, 'addArgument');
            await addArgument({ decisionId: id, type: newArg.type, text: newArg.text });
            setNewArg({ ...newArg, text: '' });
        } catch (err) {
            console.error(err);
            alert('Failed to add argument');
        } finally {
            setSubmitting(false);
        }
    };

    const handleVote = async (argId) => {
        try {
            const voteArgument = httpsCallable(functions, 'voteArgument');
            await voteArgument({ decisionId: id, argumentId: argId });
        } catch (err) {
            console.error(err);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return <div className="container">Loading...</div>;
    if (!decision) return <div className="container">Decision not found</div>;

    const pros = argumentsList.filter(arg => arg.type === 'pro');
    const cons = argumentsList.filter(arg => arg.type === 'con');

    const score = pros.reduce((acc, curr) => acc + (curr.votes || 0), 0) -
        cons.reduce((acc, curr) => acc + (curr.votes || 0), 0);

    return (
        <div className="container">
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{decision.question}</h1>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: score > 0 ? 'var(--color-success)' : score < 0 ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>
                    Net Score: {score > 0 ? '+' : ''}{score}
                </div>
                <button
                    onClick={handleCopyLink}
                    className="btn"
                    style={{
                        marginTop: '1rem',
                        background: copied ? 'var(--color-success)' : 'var(--color-secondary)',
                        color: 'white',
                        fontSize: '0.875rem',
                        padding: '0.25rem 0.75rem'
                    }}
                >
                    {copied ? 'Link Copied!' : 'Copy Link'}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Pros Column */}
                <div>
                    <h2 style={{ color: 'var(--color-success)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Pros
                        <span style={{ fontSize: '1rem', background: '#dcfce7', color: '#166534', padding: '0.25rem 0.75rem', borderRadius: '999px' }}>
                            {pros.length}
                        </span>
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {pros.map(arg => (
                            <ArgumentCard key={arg.id} arg={arg} onVote={() => handleVote(arg.id)} color="success" />
                        ))}
                        <AddArgumentForm type="pro" onSubmit={handleAddArgument} newArg={newArg} setNewArg={setNewArg} submitting={submitting} />
                    </div>
                </div>

                {/* Cons Column */}
                <div>
                    <h2 style={{ color: 'var(--color-danger)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Cons
                        <span style={{ fontSize: '1rem', background: '#fee2e2', color: '#991b1b', padding: '0.25rem 0.75rem', borderRadius: '999px' }}>
                            {cons.length}
                        </span>
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {cons.map(arg => (
                            <ArgumentCard key={arg.id} arg={arg} onVote={() => handleVote(arg.id)} color="danger" />
                        ))}
                        <AddArgumentForm type="con" onSubmit={handleAddArgument} newArg={newArg} setNewArg={setNewArg} submitting={submitting} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function ArgumentCard({ arg, onVote, color }) {
    return (
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
            <span>{arg.text}</span>
            <button
                onClick={onVote}
                className="btn"
                style={{
                    background: `var(--color-${color})`,
                    color: 'white',
                    minWidth: '3rem',
                    padding: '0.25rem 0.5rem'
                }}
            >
                +{arg.votes || 0}
            </button>
        </div>
    );
}

function AddArgumentForm({ type, onSubmit, newArg, setNewArg, submitting }) {
    const isActive = newArg.type === type;

    if (!isActive) {
        return (
            <button
                className="btn"
                style={{ width: '100%', border: '2px dashed var(--color-border)', color: 'var(--color-text-muted)' }}
                onClick={() => setNewArg({ type, text: '' })}
            >
                + Add {type === 'pro' ? 'Pro' : 'Con'}
            </button>
        );
    }

    return (
        <form onSubmit={onSubmit} className="card" style={{ padding: '1rem' }}>
            <input
                autoFocus
                type="text"
                className="input"
                placeholder={`Add a ${type}...`}
                value={newArg.text}
                onChange={(e) => setNewArg({ ...newArg, text: e.target.value })}
                style={{ marginBottom: '0.5rem' }}
                disabled={submitting}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ flex: 1 }}>
                    Add
                </button>
                <button
                    type="button"
                    className="btn"
                    style={{ background: 'var(--color-border)' }}
                    onClick={() => setNewArg({ type: type === 'pro' ? 'con' : 'pro', text: '' })}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
