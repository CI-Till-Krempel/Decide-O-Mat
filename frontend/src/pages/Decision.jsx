import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { subscribeToDecision, subscribeToArguments, voteDecision, voteArgument, addArgument, subscribeToFinalVotes, toggleDecisionStatus } from '../services/firebase';

import ElectionHero from '../components/ElectionHero';
import { HERO_MODES } from '../components/ElectionHero.modes';
import ColumnHeader from '../components/ColumnHeader';
import StatementCard from '../components/StatementCard';
import FloatingArgumentInput from '../components/FloatingArgumentInput';
import FAB from '../components/FAB';
import NamePrompt from '../components/NamePrompt';
import Spinner from '../components/Spinner';
import ParticipantList from '../components/ParticipantList';
import Toast from '../components/Toast';

import { useUser } from '../contexts/UserContext';
import EncryptionService from '../services/EncryptionService';
import ParticipantService from '../services/ParticipantService';
import NotificationService from '../services/NotificationService';

import styles from './Decision.module.css';

function Decision() {
    const { t } = useTranslation();
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
    const [finalVotesList, setFinalVotesList] = useState([]);
    const [participantMap, setParticipantMap] = useState(new Map());
    const [showNamePrompt, setShowNamePrompt] = useState(false);
    const [pendingAction, setPendingAction] = useState(null); // { type: 'vote', voteType } or { type: 'argument', argType, text }
    const [encryptionKey, setEncryptionKey] = useState(null);
    const [showParticipants, setShowParticipants] = useState(false);
    const [toast, setToast] = useState(null);
    const [activeColumn, setActiveColumn] = useState(null); // null | 'pro' | 'con'
    const [submittingArgument, setSubmittingArgument] = useState(false);
    const [votedArgIds, setVotedArgIds] = useState(new Set());
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [notificationsRequesting, setNotificationsRequesting] = useState(false);

    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'granted') {
            setNotificationsEnabled(true);
        }
    }, []);

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

        const setupSubscriptions = async () => {
            const currentKey = encryptionKey;

            unsubscribeDecision = subscribeToDecision(id, async (data) => {
                if (data && currentKey && data.question) {
                    try {
                        data.question = await EncryptionService.decrypt(data.question, currentKey);
                    } catch (e) {
                        console.error("Failed to decrypt question", e);
                        data.question = t('decision.decryptionFailed');
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
                            arg.text = t('decision.decryptionFailed');
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

            unsubscribeParticipants = ParticipantService.subscribeToParticipants(id, currentKey, (map) => {
                setParticipantMap(map);
            });
        };

        setupSubscriptions();

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
    }, [id, encryptionKey, t]);

    useEffect(() => {
        if (copied) {
            const timer = setTimeout(() => setCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [copied]);

    const handleToggleStatus = async () => {
        const newStatus = decision?.status === 'closed' ? 'open' : 'closed';
        try {
            await toggleDecisionStatus(id, newStatus);
        } catch (error) {
            console.error('Error toggling status:', error);
            setToast({ message: t('decision.errors.statusUpdateFailed'), type: 'error' });
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setToast({ message: t('decision.copyLinkSuccess'), type: 'success' });
    };

    const handleToggleNotifications = async () => {
        if (notificationsEnabled || notificationsRequesting) return;
        setNotificationsRequesting(true);
        try {
            const success = await NotificationService.requestPermission(id, user.userId);
            if (success) {
                setNotificationsEnabled(true);
                setToast({ message: t('decision.notifications.enabled'), type: 'success' });
            } else {
                setToast({ message: t('decision.notifications.failed'), type: 'error' });
            }
        } catch (error) {
            console.error('Error enabling notifications:', error);
            setToast({ message: t('decision.notifications.failed'), type: 'error' });
        } finally {
            setNotificationsRequesting(false);
        }
    };

    const performFinalVote = async (voteType) => {
        setVotingTarget(voteType);

        try {
            if (user.displayName && encryptionKey && !participantMap.has(user.userId)) {
                try {
                    await ParticipantService.registerParticipant(id, user.displayName, encryptionKey);
                } catch (e) {
                    console.warn("Auto-registration failed", e);
                }
            }

            const nameToSend = encryptionKey ? null : user.displayName;
            await voteDecision(id, voteType, nameToSend);

            setFinalVote(voteType);
            localStorage.setItem(`decision_vote_${id}`, voteType);
        } catch (error) {
            console.error("Error voting:", error);
            setToast({ message: t('decision.errors.voteFailed'), type: 'error' });
        } finally {
            setVotingTarget(null);
        }
    };

    const handleFinalVote = async (voteType) => {
        if (votingTarget || decision.status === 'closed') return;

        if (!user.displayName) {
            setPendingAction({ type: 'vote', voteType });
            setShowNamePrompt(true);
            return;
        }

        await performFinalVote(voteType);
    };

    const handleSubmitArgument = async (text, type) => {
        if (!user.displayName) {
            setPendingAction({ type: 'argument', argType: type, text });
            setShowNamePrompt(true);
            return;
        }

        await performSubmitArgument(text, type);
    };

    const performSubmitArgument = async (text, type) => {
        setSubmittingArgument(true);
        try {
            let textToSubmit = text;
            let nameToSubmit = user.displayName;

            if (encryptionKey) {
                textToSubmit = await EncryptionService.encrypt(text, encryptionKey);
                nameToSubmit = await EncryptionService.encrypt(nameToSubmit, encryptionKey);
            }

            await addArgument(id, type, textToSubmit, nameToSubmit, user.userId);
            setActiveColumn(null);
        } catch (error) {
            console.error("Error adding argument:", error);
            setToast({ message: t('addArgumentForm.errorFailed'), type: 'error' });
        } finally {
            setSubmittingArgument(false);
        }
    };

    const handleNameSave = async (name) => {
        setDisplayName(name);
        if (encryptionKey) {
            try {
                await ParticipantService.registerParticipant(id, name, encryptionKey);
            } catch (error) {
                console.error("Failed to register participant name", error);
            }
        }
        setShowNamePrompt(false);

        if (pendingAction) {
            if (pendingAction.type === 'vote') {
                await performFinalVote(pendingAction.voteType);
            } else if (pendingAction.type === 'argument') {
                await performSubmitArgument(pendingAction.text, pendingAction.argType);
            } else if (pendingAction.type === 'argVote') {
                try {
                    const nameToSend = encryptionKey ? null : name;
                    await voteArgument(id, pendingAction.argumentId, nameToSend);
                } catch (error) {
                    console.error("Error voting on argument:", error);
                    setToast({ message: t('argumentItem.errorVoteFailed'), type: 'error' });
                }
            }
            setPendingAction(null);
        }
    };

    const handleVoteChange = useCallback((argId, isVoted) => {
        setVotedArgIds(prev => {
            const newSet = new Set(prev);
            if (isVoted) newSet.add(argId);
            else newSet.delete(argId);
            return newSet;
        });
    }, []);

    if (loading) return (
        <div className={styles.loading}>
            <Spinner size="lg" color="var(--color-primary)" />
        </div>
    );
    if (!decision) return <div className={styles.notFound}>{t('decision.notFound')}</div>;

    const isClosed = decision.status === 'closed';
    const yesVotes = decision.yesVotes || 0;
    const noVotes = decision.noVotes || 0;
    const totalVotes = yesVotes + noVotes;

    let finalResult = null;
    if (isClosed) {
        if (yesVotes > noVotes) finalResult = "Approved";
        else if (noVotes >= yesVotes && totalVotes > 0) finalResult = "Rejected";
        else finalResult = "NoVotes";
    }

    // Dot-voting: each participant may vote on at most half (rounded up) of all arguments.
    // This forces prioritisation rather than blanket approval.
    const allArgs = [...pros, ...cons];
    const voteLimit = allArgs.length > 0 ? Math.ceil(allArgs.length / 2) : 0;
    const canVote = votedArgIds.size < voteLimit;

    const sortedPros = [...pros].sort((a, b) => (b.votes || 0) - (a.votes || 0));
    const sortedCons = [...cons].sort((a, b) => (b.votes || 0) - (a.votes || 0));

    return (
        <div className={styles.page}>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <ParticipantList
                participantMap={participantMap}
                isOpen={showParticipants}
                onClose={() => setShowParticipants(false)}
                ownerId={decision?.ownerId}
            />

            {showNamePrompt && (
                <NamePrompt
                    onSave={handleNameSave}
                    onCancel={() => {
                        setShowNamePrompt(false);
                        setPendingAction(null);
                    }}
                />
            )}

            <ElectionHero
                question={decision.question || decision.text}
                onVoteYes={() => handleFinalVote('yes')}
                onVoteNo={() => handleFinalVote('no')}
                isClosed={isClosed}
                userVote={finalVote}
                votingTarget={votingTarget}
                finalResult={finalResult}
                finalVotesList={finalVotesList}
                participantMap={participantMap}
                mode={isClosed ? HERO_MODES.RESULTS : HERO_MODES.VOTING}
            />

            <div className={styles.toolbar}>
                <button
                    className={styles.toolbarBtn}
                    onClick={() => setShowParticipants(true)}
                    type="button"
                    aria-expanded={showParticipants}
                    aria-haspopup="dialog"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                    </svg>
                    {t('decision.participantsButton')}
                </button>
                <button
                    className={`${styles.toolbarBtn} ${notificationsEnabled ? styles.toolbarBtnActive : ''}`}
                    onClick={handleToggleNotifications}
                    disabled={notificationsEnabled || notificationsRequesting}
                    type="button"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                    </svg>
                    {notificationsEnabled ? t('decision.notifications.enabled') : t('decision.notifications.enableButton')}
                </button>
                <button
                    className={styles.toolbarBtn}
                    onClick={handleToggleStatus}
                    type="button"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d={isClosed
                            ? "M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"
                            : "M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"
                        } />
                    </svg>
                    {isClosed ? t('decision.reopenDecisionButton') : t('decision.closeDecisionButton')}
                </button>
            </div>

            <div className={styles.columns}>
                <div className={styles.column}>
                    <ColumnHeader
                        label={t('argumentList.addPro')}
                        onAdd={() => setActiveColumn('pro')}
                        disabled={isClosed}
                    />
                    {sortedPros.length === 0 ? (
                        <div className={styles.emptyCard}>
                            <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                            </svg>
                        </div>
                    ) : (
                        sortedPros.map(arg => (
                            <StatementCard
                                key={arg.id}
                                argument={arg}
                                decisionId={id}
                                readOnly={isClosed}
                                canVote={canVote}
                                participantMap={participantMap}
                                encryptionKey={encryptionKey}
                                onVoteChange={handleVoteChange}
                                onNameRequired={(argId) => { setPendingAction({ type: 'argVote', argumentId: argId }); setShowNamePrompt(true); }}
                                onError={(msg) => setToast({ message: msg, type: 'error' })}
                            />
                        ))
                    )}
                </div>

                <div className={styles.column}>
                    <ColumnHeader
                        label={t('argumentList.addCon')}
                        onAdd={() => setActiveColumn('con')}
                        disabled={isClosed}
                    />
                    {sortedCons.length === 0 ? (
                        <div className={styles.emptyCard}>
                            <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
                            </svg>
                        </div>
                    ) : (
                        sortedCons.map(arg => (
                            <StatementCard
                                key={arg.id}
                                argument={arg}
                                decisionId={id}
                                readOnly={isClosed}
                                canVote={canVote}
                                participantMap={participantMap}
                                encryptionKey={encryptionKey}
                                onVoteChange={handleVoteChange}
                                onNameRequired={(argId) => { setPendingAction({ type: 'argVote', argumentId: argId }); setShowNamePrompt(true); }}
                                onError={(msg) => setToast({ message: msg, type: 'error' })}
                            />
                        ))
                    )}
                </div>
            </div>

            {activeColumn && (
                <FloatingArgumentInput
                    type={activeColumn}
                    onSubmit={handleSubmitArgument}
                    onClose={() => setActiveColumn(null)}
                    isLoading={submittingArgument}
                />
            )}

            <FAB
                onClick={handleCopyLink}
                label={t('decision.copyLinkButton')}
            />
        </div>
    );
}

export default Decision;
