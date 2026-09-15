import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import QRCodeIcon from './icons/QRCodeIcon';
import styles from './FAB.module.css';

function ShareIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z" />
        </svg>
    );
}

function LinkIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
    );
}

export default function FAB({ onClick, onCopyLink, onShowQRCode, label, disabled }) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const handleCopy = () => {
        setIsOpen(false);
        if (onCopyLink) {
            onCopyLink();
        } else if (onClick) {
            onClick();
        }
    };

    const handleShowQR = () => {
        setIsOpen(false);
        if (onShowQRCode) {
            onShowQRCode();
        }
    };

    const toggleOpen = () => {
        if (disabled) return;
        if (!onShowQRCode && (onClick || onCopyLink)) {
            if (onCopyLink) onCopyLink();
            else onClick();
            return;
        }
        setIsOpen(prev => !prev);
    };

    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const copyLabel = label || t('decision.copyLinkButton', 'Copy Link');
    const qrLabel = t('decision.showQRCode', 'Show QR Code');
    const shareLabel = t('decision.share', 'Share');

    return (
        <div className={styles.container} ref={containerRef}>
            {isOpen && (
                <div className={styles.speedDial} role="menu" aria-label={shareLabel}>
                    <button
                        type="button"
                        className={styles.speedDialItem}
                        onClick={handleCopy}
                        aria-label={copyLabel}
                        role="menuitem"
                        data-testid="fab-copy-link"
                    >
                        <span className={styles.itemLabel}>{copyLabel}</span>
                        <div className={styles.itemIcon}>
                            <LinkIcon />
                        </div>
                    </button>
                    {onShowQRCode && (
                        <button
                            type="button"
                            className={styles.speedDialItem}
                            onClick={handleShowQR}
                            aria-label={qrLabel}
                            role="menuitem"
                            data-testid="fab-qr-code"
                        >
                            <span className={styles.itemLabel}>{qrLabel}</span>
                            <div className={styles.itemIcon}>
                                <QRCodeIcon size={20} />
                            </div>
                        </button>
                    )}
                </div>
            )}

            <button
                className={`${styles.fab} ${isOpen ? styles.fabOpen : ''}`}
                onClick={toggleOpen}
                aria-label={isOpen ? t('common.close', 'Close') : shareLabel}
                aria-expanded={isOpen}
                aria-haspopup="menu"
                type="button"
                disabled={disabled}
                data-testid="main-fab"
            >
                {isOpen ? <CloseIcon /> : <ShareIcon />}
            </button>
        </div>
    );
}
