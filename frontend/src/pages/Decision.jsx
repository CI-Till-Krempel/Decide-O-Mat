import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { subscribeToDecision, subscribeToArguments, toggleDecisionStatus, voteDecision, subscribeToFinalVotes } from '../services/firebase';
import ArgumentList from '../components/ArgumentList';
import AddArgumentForm from '../components/AddArgumentForm';
import UserSettings from '../components/UserSettings';
import NamePrompt from '../components/NamePrompt';
import { useUser } from '../contexts/UserContext';
import { toPng } from 'html-to-image';

function Decision() {
    const { id } = useParams();
    const { user, setDisplayName } = useUser();
    const [decision, setDecision] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pros, setPros] = useState([]);
    const [cons, setCons] = useState([]);
    const [copied, setCopied] = useState(false);
    const [finalVote, setFinalVote] = useState(null);
    const [isVoting, setIsVoting] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [finalVotesList, setFinalVotesList] = useState([]);
    const [showNamePrompt, setShowNamePrompt] = useState(false);
    const [pendingVoteType, setPendingVoteType] = useState(null);
    const decisionRef = useRef(null);

    useEffect(() => {
        const unsubscribeDecision = subscribeToDecision(id, (data) => {
            setDecision(data);
            setLoading(false);
        });

        const unsubscribeArguments = subscribeToArguments(id, (args) => {
            setPros(args.filter(arg => arg.type === 'pro'));
            setCons(args.filter(arg => arg.type === 'con'));
        });

        const unsubscribeFinalVotes = subscribeToFinalVotes(id, (votes) => {
            setFinalVotesList(votes);
        });

        // Load local vote state
        const storedVote = localStorage.getItem(`decision_vote_${id}`);
        if (storedVote) {
            setFinalVote(storedVote);
        }

        return () => {
            unsubscribeDecision();
            unsubscribeArguments();
            unsubscribeFinalVotes();
        };
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
            // Optimistic update not needed as we are subscribed
        } catch (error) {
            console.error("Error toggling status:", error);
            alert("Failed to update decision status.");
        }
    };

    const handleFinalVote = async (voteType) => {
        if (isVoting || decision.status === 'closed') return;

        // Check if user has a display name
        if (!user.displayName) {
            setPendingVoteType(voteType);
            setShowNamePrompt(true);
            return;
        }

        await performFinalVote(voteType);
    };

    const performFinalVote = async (voteType) => {
        setIsVoting(true);

        try {
            await voteDecision(id, voteType, user.userId, user.displayName);

            // Update local state
            setFinalVote(voteType);
            localStorage.setItem(`decision_vote_${id}`, voteType);
        } catch (error) {
            console.error("Error voting:", error);
            alert("Failed to cast vote.");
        } finally {
            setIsVoting(false);
        }
    };

    const handleNameSave = async (name) => {
        setDisplayName(name);
        setShowNamePrompt(false);
        // Perform the vote after saving the name
        if (pendingVoteType) {
            await performFinalVote(pendingVoteType);
            setPendingVoteType(null);
        }
    };

    const handleExport = useCallback(async () => {
        if (decisionRef.current === null) {
            return;
        }
        setExporting(true);
        try {
            // Ensure the element is fully visible/sized before capture
            const dataUrl = await toPng(decisionRef.current, {
                cacheBust: true,
                backgroundColor: 'white',
                style: {
                    padding: '20px',
                    width: 'auto', // Allow it to expand
                    height: 'auto'
                },
                // Explicitly set dimensions to include scrollable content if any
                width: decisionRef.current.scrollWidth + 40, // + padding
                height: decisionRef.current.scrollHeight + 40
            });
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

    const yesVotes = decision.yesVotes || 0;
    const noVotes = decision.noVotes || 0;
    const totalVotes = yesVotes + noVotes;

    let finalResult = null;
    if (isClosed) {
        if (yesVotes > noVotes) finalResult = "Approved";
        else if (noVotes >= yesVotes && totalVotes > 0) finalResult = "Rejected";
        else finalResult = "No Votes";
    }

    return (
        <div className="container">
            {showNamePrompt && (
                <NamePrompt
                    onSave={handleNameSave}
                    onCancel={() => {
                        setShowNamePrompt(false);
                        setPendingVoteType(null);
                    }}
                />
            )}
            <UserSettings />
            <div ref={decisionRef} style={{ backgroundColor: 'white', minWidth: '600px', overflow: 'visible' }}>
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{decision.question || decision.text}</h1>

                    {isClosed && (
                        <div style={{
                            background: finalResult === 'Approved' ? 'var(--color-success)' : 'var(--color-danger)',
                            color: 'white',
                            padding: '1rem',
                            borderRadius: '8px',
                            marginBottom: '1rem',
                            fontWeight: 'bold',
                            fontSize: '1.5rem'
                        }}>
                            Decision Closed: {finalResult}
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

                    {/* Final Voting Section */}
                    <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: 'var(--color-bg-secondary)' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Final Vote</h3>
                        <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '2rem', alignItems: 'flex-start' }}>
                            <div style={{ textAlign: 'center', flex: 1 }}>
                                <button
                                    onClick={() => handleFinalVote('yes')}
                                    disabled={isClosed || isVoting}
                                    style={{
                                        background: finalVote === 'yes' ? 'var(--color-success)' : 'white',
                                        color: finalVote === 'yes' ? 'white' : 'var(--color-success)',
                                        border: '2px solid var(--color-success)',
                                        padding: '0.5rem 1.5rem',
                                        borderRadius: '20px',
                                        fontSize: '1.2rem',
                                        cursor: (isClosed || isVoting) ? 'not-allowed' : 'pointer',
                                        opacity: (isClosed && finalVote !== 'yes') ? 0.5 : 1
                                    }}
                                >
                                    Yes
                                </button>
                                <div style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>{yesVotes}</div>
                                {finalVotesList.filter(v => v.vote === 'yes').length > 0 && (
                                    <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                                        {finalVotesList.filter(v => v.vote === 'yes').map(vote => (
                                            <span key={vote.userId} style={{
                                                fontSize: '0.75rem',
                                                background: 'white',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '12px',
                                                color: 'var(--color-text)',
                                                border: '1px solid var(--color-border)'
                                            }}>
                                                {vote.displayName || 'Anonymous'}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div style={{ textAlign: 'center', flex: 1 }}>
                                <button
                                    onClick={() => handleFinalVote('no')}
                                    disabled={isClosed || isVoting}
                                    style={{
                                        background: finalVote === 'no' ? 'var(--color-danger)' : 'white',
                                        color: finalVote === 'no' ? 'white' : 'var(--color-danger)',
                                        border: '2px solid var(--color-danger)',
                                        padding: '0.5rem 1.5rem',
                                        borderRadius: '20px',
                                        fontSize: '1.2rem',
                                        cursor: (isClosed || isVoting) ? 'not-allowed' : 'pointer',
                                        opacity: (isClosed && finalVote !== 'no') ? 0.5 : 1
                                    }}
                                >
                                    No
                                </button>
                                <div style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>{noVotes}</div>
                                {finalVotesList.filter(v => v.vote === 'no').length > 0 && (
                                    <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                                        {finalVotesList.filter(v => v.vote === 'no').map(vote => (
                                            <span key={vote.userId} style={{
                                                fontSize: '0.75rem',
                                                background: 'white',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '12px',
                                                color: 'var(--color-text)',
                                                border: '1px solid var(--color-border)'
                                            }}>
                                                {vote.displayName || 'Anonymous'}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="arguments-container" style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
                    <div className="pros-column" style={{ flex: 1 }}>
                        <ArgumentList arguments={pros} type="pro" decisionId={id} readOnly={isClosed || exporting} />
                        {!exporting && <AddArgumentForm decisionId={id} type="pro" readOnly={isClosed} />}
                    </div>
                    <div className="cons-column" style={{ flex: 1 }}>
                        <ArgumentList arguments={cons} type="con" decisionId={id} readOnly={isClosed || exporting} />
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
