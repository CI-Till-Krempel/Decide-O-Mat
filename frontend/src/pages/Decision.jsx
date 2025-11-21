import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getDecision, subscribeToArguments, toggleDecisionStatus } from '../services/firebase';
import ArgumentList from '../components/ArgumentList';
import AddArgumentForm from '../components/AddArgumentForm';
import { toPng } from 'html-to-image';

function Decision() {
    const { id } = useParams();
    const [decision, setDecision] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pros, setPros] = useState([]);
    const [cons, setCons] = useState([]);
    const [copied, setCopied] = useState(false);
    const [exporting, setExporting] = useState(false);
    const decisionRef = useRef(null);

    useEffect(() => {
        const fetchDecision = async () => {
            try {
                const data = await getDecision(id);
                setDecision(data);
            } catch (error) {
                console.error("Error fetching decision:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDecision();

        const unsubscribe = subscribeToArguments(id, (args) => {
            setPros(args.filter(arg => arg.type === 'pro'));
            setCons(args.filter(arg => arg.type === 'con'));
        });

        return () => unsubscribe();
    }, [id]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleToggleStatus = async () => {
        if (!decision) return;
        const newStatus = decision.status === 'closed' ? 'open' : 'closed';
        try {
            await toggleDecisionStatus(id, newStatus);
            setDecision({ ...decision, status: newStatus });
        } catch (error) {
            console.error("Error toggling status:", error);
            alert("Failed to update decision status.");
        }
    };

    const handleExport = useCallback(async () => {
        if (decisionRef.current === null) {
            return;
        }
        setExporting(true);
        try {
            const dataUrl = await toPng(decisionRef.current, { cacheBust: true, backgroundColor: 'white', style: { padding: '20px' } });
            const link = document.createElement('a');
            link.download = `decision-${id}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Error exporting image:', err);
            alert('Failed to export image.');
        } finally {
            setExporting(false);
        }
    }, [id]);

    if (loading) return <div className="container">Loading...</div>;
    if (!decision) return <div className="container">Decision not found</div>;

    const isClosed = decision.status === 'closed';
    const netScore = pros.reduce((sum, arg) => sum + (arg.votes || 0), 0) - cons.reduce((sum, arg) => sum + (arg.votes || 0), 0);

    return (
        <div className="container">
            <div ref={decisionRef} style={{ backgroundColor: 'white' }}>
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{decision.question || decision.text}</h1>

                    {isClosed && (
                        <div style={{
                            background: 'var(--color-danger)',
                            color: 'white',
                            padding: '0.5rem',
                            borderRadius: '4px',
                            marginBottom: '1rem',
                            fontWeight: 'bold'
                        }}>
                            Decision Closed
                        </div>
                    )}

                    {/* Net Score Display */}
                    <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        margin: '1rem 0',
                        color: netScore > 0
                            ? 'var(--color-success)'
                            : netScore < 0
                                ? 'var(--color-danger)'
                                : 'var(--color-text-muted)'
                    }}>
                        Net Score: {netScore > 0 ? '+' : ''}{netScore}
                    </div>
                </div>

                <div className="arguments-container" style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
                    <div className="pros-column" style={{ flex: 1 }}>
                        <ArgumentList arguments={pros} type="pro" title={decision.question || decision.text} decisionId={id} readOnly={isClosed || exporting} />
                        {!exporting && <AddArgumentForm decisionId={id} type="pro" readOnly={isClosed} />}
                    </div>
                    <div className="cons-column" style={{ flex: 1 }}>
                        <ArgumentList arguments={cons} type="con" title={decision.question || decision.text} decisionId={id} readOnly={isClosed || exporting} />
                        {!exporting && <AddArgumentForm decisionId={id} type="con" readOnly={isClosed} />}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', paddingBottom: '2rem' }}>
                <button
                    onClick={handleCopyLink}
                    className="btn"
                    style={{
                        background: copied ? 'var(--color-success)' : 'var(--color-secondary)',
                        color: 'white',
                        fontSize: '0.875rem',
                        padding: '0.25rem 0.75rem'
                    }}
                >
                    {copied ? 'Link Copied!' : 'Copy Link'}
                </button>
                <button
                    onClick={handleToggleStatus}
                    className="btn"
                    style={{
                        background: isClosed ? 'var(--color-primary)' : 'var(--color-danger)',
                        color: 'white',
                        fontSize: '0.875rem',
                        padding: '0.25rem 0.75rem'
                    }}
                >
                    {isClosed ? 'Re-open Decision' : 'Close Decision'}
                </button>
                <button
                    onClick={handleExport}
                    className="btn"
                    disabled={exporting}
                    style={{
                        background: 'var(--color-primary)',
                        color: 'white',
                        fontSize: '0.875rem',
                        padding: '0.25rem 0.75rem',
                        cursor: exporting ? 'wait' : 'pointer'
                    }}
                >
                    {exporting ? 'Exporting...' : 'Export as Image'}
                </button>
            </div>
        </div>
    );
}

export default Decision;
