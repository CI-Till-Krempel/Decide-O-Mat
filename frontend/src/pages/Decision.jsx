import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { subscribeToDecision, subscribeToArguments, toggleDecisionStatus, voteDecision, subscribeToFinalVotes } from '../services/firebase';
import ArgumentList from '../components/ArgumentList';
import AddArgumentForm from '../components/AddArgumentForm';

import NamePrompt from '../components/NamePrompt';
import Spinner from '../components/Spinner';
import { useUser } from '../contexts/UserContext';
import { toPng } from 'html-to-image';
import EncryptionService from '../services/EncryptionService';
import ParticipantService from '../services/ParticipantService';

function Decision() {
    const { id } = useParams();
    const location = useLocation();
    const { user, setDisplayName } = useUser();
    const [decision, setDecision] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pros, setPros] = useState([]);
    const [cons, setCons] = useState([]);
    const [copied, setCopied] = useState(false);
    const [finalVote, setFinalVote] = useState(null);
    const [votingTarget, setVotingTarget] = useState(null);
    const [exporting, setExporting] = useState(false);
    const [finalVotesList, setFinalVotesList] = useState([]);
    const [participantMap, setParticipantMap] = useState(new Map());
    const [showNamePrompt, setShowNamePrompt] = useState(false);
    const [pendingVoteType, setPendingVoteType] = useState(null);
    const [encryptionKey, setEncryptionKey] = useState(null);
    const decisionRef = useRef(null);

    // Parse key from URL hash
    useEffect(() => {
        const hash = location.hash;
        if (hash && hash.includes('key=')) {
            const keyString = hash.split('key=')[1];
            if (keyString) {
                EncryptionService.storeKey(id, keyString);
                EncryptionService.importKey(keyString)
                    .then(key => setEncryptionKey(key))
                    .catch(err => console.error("Failed to import key", err));
            }
        }
    }, [location, id]);

    useEffect(() => {
        let unsubscribeDecision = () => { };
        let unsubscribeArguments = () => { };
        let unsubscribeFinalVotes = () => { };
        let unsubscribeParticipants = () => { };

        // We need to wait for key parsing (or determination that there is no key)
        const setupSubscriptions = async () => {
            const currentKey = encryptionKey; // Closure capture

            unsubscribeDecision = subscribeToDecision(id, async (data) => {
                if (data && currentKey && data.question) {
                    try {
                        data.question = await EncryptionService.decrypt(data.question, currentKey);
                    } catch (e) {
                        console.error("Failed to decrypt question", e);
                        data.question = "[Decryption Failed]";
                    }
                }
                setDecision(data);
                setLoading(false);
            });

            unsubscribeArguments = subscribeToArguments(id, async (args) => {
                const decryptedArgs = await Promise.all(args.map(async (arg) => {
                    if (currentKey) {
                        try {
                            if (arg.text) arg.text = await EncryptionService.decrypt(arg.text, currentKey);
                            if (arg.authorName) arg.authorName = await EncryptionService.decrypt(arg.authorName, currentKey);
                        } catch (e) {
                            console.error("Failed to decrypt argument", e);
                            arg.text = "[Decryption Failed]";
                        }
                    }
                    return arg;
                }));

                setPros(decryptedArgs.filter(arg => arg.type === 'pro'));
                setCons(decryptedArgs.filter(arg => arg.type === 'con'));
            });

            unsubscribeFinalVotes = subscribeToFinalVotes(id, async (votes) => {
                const decryptedVotes = await Promise.all(votes.map(async (v) => {
                    if (currentKey && v.displayName) {
                        try {
                            v.displayName = await EncryptionService.decrypt(v.displayName, currentKey);
                        } catch (e) {
                            console.error("Failed to decrypt vote name", e);
                            v.displayName = "???";
                        }
                    }
                    return v;
                }));
                setFinalVotesList(decryptedVotes);
            });

            // Always subscribe to participants (for both encrypted and unencrypted names)
            unsubscribeParticipants = ParticipantService.subscribeToParticipants(id, currentKey, (map) => {
                setParticipantMap(map);
            });
        };

        setupSubscriptions();

        // Load local vote state
        const storedVote = localStorage.getItem(`decision_vote_${id}`);
        if (storedVote) {
            setFinalVote(storedVote);
        }

        return () => {
            unsubscribeDecision();
            unsubscribeArguments();
            unsubscribeFinalVotes();
            unsubscribeParticipants();
        };
    }, [id, encryptionKey]);

    useEffect(() => {
        if (copied) {
            const timer = setTimeout(() => setCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [copied]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
    };

    const handleToggleStatus = async () => {
        if (!decision) return;
        const newStatus = decision.status === 'closed' ? 'open' : 'closed';
        try {
            await toggleDecisionStatus(id, newStatus);
        } catch (error) {
            console.error("Error toggling status:", error);
            alert("Failed to update decision status.");
        }
    };

    const handleFinalVote = async (voteType) => {
        if (votingTarget || decision.status === 'closed') return;

        // Check if user has a display name
        if (!user.displayName) {
            setPendingVoteType(voteType);
            setShowNamePrompt(true);
            return;
        }

        await performFinalVote(voteType);
    };

    const performFinalVote = async (voteType) => {
        setVotingTarget(voteType);

        try {
            // Auto-register name if needed
            if (user.displayName && encryptionKey && (!participantMap || !participantMap.get(user.userId))) {
                try {
                    await ParticipantService.registerParticipant(id, user.displayName, encryptionKey);
                } catch (e) {
                    console.warn("Auto-registration failed", e);
                }
            }

            // If we have a key, we rely on participant mapping (registered above).
            // If we don't have a key (unencrypted decision), we send the display name in plaintext.
            // This restores support for non-E2E decisions while preserving privacy for E2E ones.
            const nameToSend = encryptionKey ? null : user.displayName;
            await voteDecision(id, voteType, nameToSend);

            // Update local state
            setFinalVote(voteType);
            localStorage.setItem(`decision_vote_${id}`, voteType);
        } catch (error) {
            console.error("Error voting:", error);
            alert("Failed to cast vote.");
        } finally {
            setVotingTarget(null);
        }
    };

    const handleNameSave = async (name) => {
        setDisplayName(name);
        if (encryptionKey) {
            try {
                // Register participant ID <-> Encrypted Name
                await ParticipantService.registerParticipant(id, name, encryptionKey);
            } catch (error) {
                console.error("Failed to register participant name", error);
                // Non-blocking? User can still vote, just name won't be visible to others.
            }
        }
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

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <Spinner size="lg" color="var(--color-primary)" />
        </div>
    );
    if (!decision) return <div className="container">Decision not found</div>;

    const isClosed = decision.status === 'closed';
    const argumentScore = pros.reduce((sum, arg) => sum + (arg.votes || 0), 0) - cons.reduce((sum, arg) => sum + (arg.votes || 0), 0);

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

                    {/* Metrics Display */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', margin: '1rem 0' }}>
                        {/* Vote Balance */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Vote Balance</div>
                            <div style={{
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: (yesVotes - noVotes) > 0
                                    ? 'var(--color-success)'
                                    : (yesVotes - noVotes) < 0
                                        ? 'var(--color-danger)'
                                        : 'var(--color-text-muted)'
                            }}>
                                {(yesVotes - noVotes) > 0 ? '+' : ''}{yesVotes - noVotes}
                            </div>
                        </div>

                        {/* Argument Score */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Argument Score</div>
                            <div style={{
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: argumentScore > 0
                                    ? 'var(--color-success)'
                                    : argumentScore < 0
                                        ? 'var(--color-danger)'
                                        : 'var(--color-text-muted)'
                            }}>
                                {argumentScore > 0 ? '+' : ''}{argumentScore}
                            </div>
                        </div>
                    </div>

                    {/* Final Voting Section */}
                    <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: 'var(--color-bg-secondary)' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Final Vote</h3>
                        <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '2rem', alignItems: 'flex-start' }}>
                            <div style={{ textAlign: 'center', flex: 1 }}>
                                <button
                                    onClick={() => handleFinalVote('yes')}
                                    disabled={isClosed || !!votingTarget}
                                    style={{
                                        background: finalVote === 'yes' ? 'var(--color-success)' : 'white',
                                        color: finalVote === 'yes' ? 'white' : 'var(--color-success)',
                                        border: '2px solid var(--color-success)',
                                        padding: '0.5rem 1.5rem',
                                        borderRadius: '20px',
                                        fontSize: '1.2rem',
                                        cursor: (isClosed || !!votingTarget) ? 'not-allowed' : 'pointer',
                                        opacity: (isClosed && finalVote !== 'yes') ? 0.5 : 1,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    {votingTarget === 'yes' ? <Spinner size="sm" color={finalVote === 'yes' ? 'white' : 'var(--color-success)'} /> : 'Yes'}
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
                                                {participantMap.get(vote.userId) || vote.displayName || 'Anonymous'}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div style={{ textAlign: 'center', flex: 1 }}>
                                <button
                                    onClick={() => handleFinalVote('no')}
                                    disabled={isClosed || !!votingTarget}
                                    style={{
                                        background: finalVote === 'no' ? 'var(--color-danger)' : 'white',
                                        color: finalVote === 'no' ? 'white' : 'var(--color-danger)',
                                        border: '2px solid var(--color-danger)',
                                        padding: '0.5rem 1.5rem',
                                        borderRadius: '20px',
                                        fontSize: '1.2rem',
                                        cursor: (isClosed || !!votingTarget) ? 'not-allowed' : 'pointer',
                                        opacity: (isClosed && finalVote !== 'no') ? 0.5 : 1,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    {votingTarget === 'no' ? <Spinner size="sm" color={finalVote === 'no' ? 'white' : 'var(--color-danger)'} /> : 'No'}
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
                                                {participantMap.get(vote.userId) || vote.displayName || 'Anonymous'}
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
                        <ArgumentList
                            arguments={pros}
                            type="pro"
                            decisionId={id}
                            readOnly={isClosed || exporting}
                            participantMap={participantMap}
                            encryptionKey={encryptionKey}
                        />
                        {!exporting && <AddArgumentForm decisionId={id} type="pro" readOnly={isClosed} encryptionKey={encryptionKey} />}
                    </div>
                    <div className="cons-column" style={{ flex: 1 }}>
                        <ArgumentList
                            arguments={cons}
                            type="con"
                            decisionId={id}
                            readOnly={isClosed || exporting}
                            participantMap={participantMap}
                            encryptionKey={encryptionKey}
                        />
                        {!exporting && <AddArgumentForm decisionId={id} type="con" readOnly={isClosed} encryptionKey={encryptionKey} />}
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
                    {exporting ? <Spinner size="sm" color="white" /> : 'Export as Image'}
                </button>
            </div>
        </div>
    );
}

export default Decision;
