import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '../contexts/UserContext';
import { updateUserDisplayName } from '../services/firebase';
import ParticipantService from '../services/ParticipantService';
import MagicLinkData from './MagicLinkData';
import styles from './UserSettings.module.css';

function UserSettings({ decisionId, encryptionKey, onClose }) {
    const { t } = useTranslation();
    const { user, logout, deleteAccount, setDisplayName, resetToInitialName, getInitialName } = useUser();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [showTransfer, setShowTransfer] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [editedName, setEditedName] = useState(user?.displayName || '');
    const panelRef = useRef(null);

    const handleClose = () => {
        setIsEditing(false);
        setShowTransfer(false);
        setShowHelp(false);
        setShowResetConfirm(false);
        setShowDeleteConfirm(false);
        setDeletePassword('');
        setDeleteError('');
        if (onClose) onClose();
    };

    useEffect(() => {
        if (user?.displayName && user.displayName !== editedName) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setEditedName(user.displayName);
        }
    }, [user?.displayName]); // eslint-disable-line react-hooks/exhaustive-deps

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                handleClose();
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    });

    const handleSave = async () => {
        if (editedName.trim()) {
            const trimmedName = editedName.trim();
            setDisplayName(trimmedName);
            setIsEditing(false);

            if (decisionId && user.userId) {
                try {
                    await ParticipantService.registerParticipant(decisionId, trimmedName, encryptionKey || null);
                    await updateUserDisplayName(decisionId, trimmedName);
                } catch (error) {
                    console.error("Failed to update display name:", error);
                }
            }
        }
    };

    const handleCancel = () => {
        setEditedName(user.displayName || '');
        setIsEditing(false);
        setShowTransfer(false);
        setShowHelp(false);
        setShowResetConfirm(false);
        setShowDeleteConfirm(false);
        setDeletePassword('');
        setDeleteError('');
    };

    const confirmReset = async () => {
        const restoredName = resetToInitialName();
        setShowResetConfirm(false);
        if (decisionId && user.userId && restoredName) {
            try {
                await ParticipantService.registerParticipant(decisionId, restoredName, encryptionKey || null);
                await updateUserDisplayName(decisionId, restoredName);
            } catch (error) {
                console.error("Failed to reset display name on backend:", error);
            }
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            handleClose();
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const handleDeleteAccount = async () => {
        setDeleteError('');
        try {
            await deleteAccount(deletePassword);
            setShowDeleteConfirm(false);
            handleClose();
        } catch (error) {
            setDeleteError(t('userSettings.deleteError'));
            console.error(error);
        }
    };

    const handleLogin = () => {
        handleClose();
        navigate('/login');
    };

    if (!user) return null;

    // Delete confirmation
    if (showDeleteConfirm) {
        const needsPassword = user.providers && user.providers.includes('password');
        return (
            <div ref={panelRef} className={styles.panel}>
                <h4 className={`${styles.sectionTitle} ${styles.dangerColor}`}>{t('userSettings.deleteTitle')}</h4>
                <p className={styles.infoText}>
                    <strong>{t('userSettings.deleteWarning')}</strong>
                </p>
                <p className={`${styles.infoText} ${styles.mutedText}`}>
                    {t('userSettings.deleteVotesWarning')}
                </p>
                {needsPassword && (
                    <div className={styles.passwordGroup}>
                        <label className={styles.inputLabel}>{t('userSettings.deletePasswordLabel')}</label>
                        <input
                            type="password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            className="input"
                        />
                    </div>
                )}
                {deleteError && <div className={styles.errorText}>{deleteError}</div>}
                <div className={styles.actionRow}>
                    <button onClick={handleCancel} className={`${styles.btnSecondary} ${styles.flexOne}`}>{t('userSettings.buttonCancel')}</button>
                    <button onClick={handleDeleteAccount} className={`${styles.btnDanger} ${styles.flexOne}`}>{t('userSettings.buttonDelete')}</button>
                </div>
            </div>
        );
    }

    // Authenticated (non-anonymous) user
    if (!user.isAnonymous) {
        return (
            <div ref={panelRef} className={`${styles.panel} ${styles.panelRow}`}>
                {user.photoURL && (
                    <img
                        src={user.photoURL}
                        alt={t('userSettings.avatarAlt')}
                        className={styles.avatar}
                    />
                )}
                <span className={styles.displayName}>
                    {user.displayName}
                </span>
                <button onClick={handleLogout} className={styles.btnSecondary}>
                    {t('userSettings.buttonLogout')}
                </button>
                <button onClick={() => setShowDeleteConfirm(true)} className={styles.btnDanger}>
                    {t('userSettings.buttonDelete')}
                </button>
            </div>
        );
    }

    // Transfer panel
    if (showTransfer) {
        return (
            <div ref={panelRef} className={styles.panel}>
                <MagicLinkData />
                <button onClick={() => setShowTransfer(false)} className={`${styles.btnSecondary} ${styles.fullWidthBtn}`}>
                    {t('userSettings.buttonClose')}
                </button>
            </div>
        );
    }

    // Reset confirmation
    if (showResetConfirm) {
        const initialName = getInitialName();
        return (
            <div ref={panelRef} className={styles.panel}>
                <h4 className={styles.sectionTitle}>{t('userSettings.resetTitle')}</h4>
                <p className={`${styles.smallText} ${styles.mutedText}`}>
                    {t('userSettings.resetDescription')}
                </p>
                <div className={styles.previewBox}>
                    {initialName || t('userSettings.resetOriginal')}
                </div>
                <div className={styles.actionRow}>
                    <button onClick={() => setShowResetConfirm(false)} className={`${styles.btnSecondary} ${styles.flexOne}`}>{t('userSettings.buttonCancel')}</button>
                    <button onClick={confirmReset} className={`${styles.btnDanger} ${styles.flexOne}`}>{t('userSettings.buttonReset')}</button>
                </div>
            </div>
        );
    }

    // Help panel
    if (showHelp) {
        return (
            <div ref={panelRef} className={styles.panel}>
                <h4 className={styles.sectionTitle}>{t('userSettings.helpTitle')}</h4>
                <p className={`${styles.smallText} ${styles.mutedText}`}>
                    {t('userSettings.helpDescription')}
                </p>
                <ul className={styles.helpList}>
                    <li><strong className={styles.boldLabel}>{t('userSettings.helpCipherLabel')}</strong>: {t('userSettings.helpCipher')}</li>
                    <li><strong className={styles.boldLabel}>{t('userSettings.helpNoLoginLabel')}</strong>: {t('userSettings.helpNoLogin')}</li>
                    <li><strong className={styles.boldLabel}>{t('userSettings.helpTransferLabel')}</strong>: {t('userSettings.helpTransfer')}</li>
                </ul>
                <button onClick={() => setShowHelp(false)} className={`${styles.btnSecondary} ${styles.fullWidthBtn}`}>
                    {t('userSettings.buttonClose')}
                </button>
            </div>
        );
    }

    // Default panel (anonymous user controls)
    if (!isEditing) {
        return (
            <div ref={panelRef} className={`${styles.panel} ${styles.panelColumn}`}>
                {/* Identity Header */}
                <div className={styles.identityHeader}>
                    <div className={styles.identityInfo}>
                        <span className={styles.youAreLabel}>{t('userSettings.youAre')}</span>
                        <span title={user.displayName}>{user.displayName || t('userSettings.guestLabel')}</span>
                    </div>
                    <button
                        onClick={() => setIsEditing(true)}
                        className={styles.editButton}
                        title={t('userSettings.editNameButton')}
                    >
                        ✏️
                    </button>
                </div>

                {/* Actions */}
                <div className={styles.actionRow}>
                    <button onClick={() => setShowResetConfirm(true)} className={`${styles.btnSecondary} ${styles.flexOne}`} title={t('userSettings.resetDescription')}>
                        {t('userSettings.buttonReset')}
                    </button>
                    <button onClick={() => setShowTransfer(true)} className={`${styles.btnSecondary} ${styles.flexOne}`} title={t('userSettings.titleTransfer')}>
                        {t('userSettings.buttonTransfer')}
                    </button>
                </div>

                <div className={styles.divider} />

                {/* Footer Actions */}
                <div className={styles.footerRow}>
                    <button onClick={handleLogin} className={styles.loginButton}>
                        {t('userSettings.buttonLogin')}
                    </button>
                    <button
                        onClick={() => setShowHelp(true)}
                        className={styles.helpButton}
                        title={t('userSettings.buttonHelp')}
                    >
                        ?
                    </button>
                </div>
            </div>
        );
    }

    // Edit name panel
    return (
        <div ref={panelRef} className={styles.panel}>
            <div className={styles.editTitle}>
                {t('userSettings.editTitle')}
            </div>
            <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder={t('userSettings.editPlaceholder')}
                autoFocus
                className="input"
                style={{ marginBottom: '0.5rem' }}
            />
            <div className={styles.editActions}>
                <button onClick={handleCancel} className={styles.btnSecondary}>{t('userSettings.buttonCancel')}</button>
                <button
                    onClick={handleSave}
                    disabled={!editedName.trim()}
                    className={`${styles.saveButton} ${editedName.trim() ? styles.saveButtonEnabled : styles.saveButtonDisabled}`}
                >
                    {t('userSettings.buttonSave')}
                </button>
            </div>
        </div>
    );
}

export default UserSettings;
