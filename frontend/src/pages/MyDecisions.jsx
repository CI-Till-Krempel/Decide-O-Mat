import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '../contexts/UserContext';
import { getUserDecisions, toggleDecisionStatus, updateDecisionQuestion, deleteDecision } from '../services/firebase';
import EncryptionService from '../services/EncryptionService';
import DecisionCard from '../components/DecisionCard';
import ContextMenu from '../components/ContextMenu';
import EditQuestionModal from '../components/EditQuestionModal';
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog';
import Toast from '../components/Toast';
import Spinner from '../components/Spinner';
import styles from './MyDecisions.module.css';

const MyDecisions = () => {
    const { t } = useTranslation();
    const { user } = useUser();
    const navigate = useNavigate();
    const [decisions, setDecisions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [contextMenu, setContextMenu] = useState(null); // { decisionId, position }
    const [toast, setToast] = useState(null);
    const [editTarget, setEditTarget] = useState(null); // decision object to edit
    const [deleteTarget, setDeleteTarget] = useState(null); // decision object to delete
    const [editLoading, setEditLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        const fetchDecisions = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const data = await getUserDecisions(user.userId);

                const decryptedData = await Promise.all(data.map(async (d) => {
                    try {
                        const key = await EncryptionService.getStoredKey(d.id);
                        if (key && d.question) {
                            try {
                                const plain = await EncryptionService.decrypt(d.question, key);
                                return { ...d, question: plain };
                            } catch {
                                return d;
                            }
                        }
                    } catch {
                        // Key retrieval failed
                    }
                    return d;
                }));

                setDecisions(decryptedData);
            } catch (err) {
                console.error("Failed to fetch decisions:", err);
                setError(t('myDecisions.error'));
            } finally {
                setLoading(false);
            }
        };

        fetchDecisions();
    }, [user, t]);

    const navigateToDecision = useCallback((decision) => {
        const key = EncryptionService.getStoredKeyString(decision.id);
        const hash = key ? `#key=${key}` : '';
        navigate(`/d/${decision.id}${hash}`);
    }, [navigate]);

    const handleContextMenu = useCallback((decision, event) => {
        const isRightClick = event.type === 'contextmenu';
        const rect = event.currentTarget.getBoundingClientRect();
        setContextMenu({
            decisionId: decision.id,
            position: {
                top: (isRightClick ? event.clientY : rect.bottom) + window.scrollY,
                left: (isRightClick ? event.clientX : rect.left) + window.scrollX,
            },
        });
    }, []);

    const closeContextMenu = useCallback(() => {
        setContextMenu(null);
    }, []);

    const handleCopyLink = useCallback((decision) => {
        const key = EncryptionService.getStoredKeyString(decision.id);
        const hash = key ? `#key=${key}` : '';
        const url = `${window.location.origin}/d/${decision.id}${hash}`;
        navigator.clipboard.writeText(url);
        setToast({ message: t('decision.copyLinkSuccess'), type: 'success' });
    }, [t]);

    const handleToggleStatus = useCallback(async (decision) => {
        const newStatus = decision.status === 'closed' ? 'open' : 'closed';
        try {
            await toggleDecisionStatus(decision.id, newStatus);
            setDecisions(prev => prev.map(d =>
                d.id === decision.id ? { ...d, status: newStatus } : d
            ));
        } catch (err) {
            console.error("Failed to toggle status:", err);
            setToast({ message: t('decision.errors.statusUpdateFailed'), type: 'error' });
        }
    }, [t]);

    const handleEdit = useCallback((decision) => {
        setEditTarget(decision);
    }, []);

    const handleEditSave = useCallback(async (newQuestion) => {
        if (!editTarget) return;
        setEditLoading(true);
        try {
            let questionToSend = newQuestion;
            const key = await EncryptionService.getStoredKey(editTarget.id);
            if (key) {
                questionToSend = await EncryptionService.encrypt(newQuestion, key);
            }
            await updateDecisionQuestion(editTarget.id, questionToSend);
            setDecisions(prev => prev.map(d =>
                d.id === editTarget.id ? { ...d, question: newQuestion } : d
            ));
            setEditTarget(null);
        } catch (err) {
            console.error("Failed to edit question:", err);
            setToast({ message: t('decision.errors.editFailed'), type: 'error' });
        } finally {
            setEditLoading(false);
        }
    }, [editTarget, t]);

    const handleDelete = useCallback((decision) => {
        setDeleteTarget(decision);
    }, []);

    const handleDeleteConfirm = useCallback(async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        try {
            await deleteDecision(deleteTarget.id);
            setDecisions(prev => prev.filter(d => d.id !== deleteTarget.id));
            setDeleteTarget(null);
            setToast({ message: t('decision.deleteSuccess'), type: 'success' });
        } catch (err) {
            console.error("Failed to delete decision:", err);
            setToast({ message: t('decision.errors.deleteFailed'), type: 'error' });
        } finally {
            setDeleteLoading(false);
        }
    }, [deleteTarget, t]);

    const getContextMenuItems = useCallback((decision) => {
        const items = [
            { label: t('myDecisions.contextMenu.view'), onClick: () => navigateToDecision(decision) },
            { label: t('myDecisions.contextMenu.copyLink'), onClick: () => handleCopyLink(decision) },
        ];

        if (decision.role === 'owner') {
            items.push({ divider: true });
            items.push({
                label: decision.status === 'closed'
                    ? t('myDecisions.contextMenu.reopen')
                    : t('myDecisions.contextMenu.close'),
                onClick: () => handleToggleStatus(decision),
            });
            items.push({
                label: t('myDecisions.contextMenu.edit'),
                onClick: () => handleEdit(decision),
            });
            items.push({
                label: t('myDecisions.contextMenu.delete'),
                onClick: () => handleDelete(decision),
                danger: true,
            });
        }

        return items;
    }, [t, navigateToDecision, handleCopyLink, handleToggleStatus, handleEdit, handleDelete]);

    const activeDecision = contextMenu
        ? decisions.find(d => d.id === contextMenu.decisionId)
        : null;

    if (!user) {
        return (
            <div className={styles.page}>
                <p className={styles.centered}>{t('myDecisions.loginPrompt')}</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.centered}>
                    <Spinner size="lg" color="var(--color-primary)" />
                </div>
            </div>
        );
    }

    const running = decisions.filter(d => d.status !== 'closed');
    const archived = decisions.filter(d => d.status === 'closed');

    return (
        <div className={styles.page}>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <h1 className={styles.title}>{t('myDecisions.title')}</h1>

            {error && <p className={styles.error}>{error}</p>}

            {decisions.length === 0 ? (
                <p className={styles.empty}>{t('myDecisions.empty')}</p>
            ) : (
                <>
                    {running.length > 0 && (
                        <>
                            <h2 className={styles.sectionTitle}>{t('myDecisions.runningTitle')}</h2>
                            <div className={styles.runningSection}>
                                {running.map(decision => (
                                    <div key={decision.id} className={styles.cardWrapper}>
                                        <DecisionCard
                                            decision={decision}
                                            variant="running"
                                            onClick={() => navigateToDecision(decision)}
                                            onContextMenu={(e) => handleContextMenu(decision, e)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {archived.length > 0 && (
                        <>
                            <h2 className={styles.sectionTitle}>{t('myDecisions.archiveTitle')}</h2>
                            <div className={styles.archiveGrid}>
                                {archived.map(decision => (
                                    <div key={decision.id} className={styles.cardWrapper}>
                                        <DecisionCard
                                            decision={decision}
                                            variant="archived"
                                            onClick={() => navigateToDecision(decision)}
                                            onContextMenu={(e) => handleContextMenu(decision, e)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}

            {contextMenu && activeDecision && (
                <ContextMenu
                    items={getContextMenuItems(activeDecision)}
                    position={contextMenu.position}
                    onClose={closeContextMenu}
                />
            )}

            {editTarget && (
                <EditQuestionModal
                    question={editTarget.question}
                    onSave={handleEditSave}
                    onCancel={() => setEditTarget(null)}
                    isLoading={editLoading}
                />
            )}

            {deleteTarget && (
                <ConfirmDeleteDialog
                    question={deleteTarget.question}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setDeleteTarget(null)}
                    isLoading={deleteLoading}
                />
            )}
        </div>
    );
};

export default MyDecisions;
