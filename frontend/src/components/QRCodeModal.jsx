import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeCanvas } from 'qrcode.react';
import { copyRichLink } from '../utils/ClipboardUtils';
import styles from './QRCodeModal.module.css';

export default function QRCodeModal({
    question,
    url,
    decisionId,
    onClose
}) {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);
    const canvasRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleCopy = async () => {
        if (!url) return;
        try {
            await copyRichLink(url, question || t('decision.unknownTitle', 'Decision'));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            try {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch {
                // fallback
                const textarea = document.createElement('textarea');
                textarea.value = url;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        }
    };

    const handleDownload = () => {
        const canvas = canvasRef.current?.querySelector('canvas');
        if (!canvas) return;

        try {
            const pngUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `decision-qr-${decisionId || 'code'}.png`;
            link.href = pngUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Failed to download QR code image:', error);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose} data-testid="qr-modal-overlay">
            <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="qr-modal-title"
            >
                <div className={styles.header}>
                    <h2 id="qr-modal-title" className={styles.title}>
                        {t('decision.qrModalTitle', 'Share Decision via QR Code')}
                    </h2>
                    <button
                        type="button"
                        className={styles.closeIconBtn}
                        onClick={onClose}
                        aria-label={t('common.close', 'Close')}
                    >
                        ✕
                    </button>
                </div>

                {question && (
                    <p className={styles.questionText}>
                        {question}
                    </p>
                )}

                <div className={styles.qrContainer} ref={canvasRef} data-testid="qr-canvas-container">
                    <QRCodeCanvas
                        value={url || ''}
                        size={220}
                        level="M"
                        marginSize={2}
                    />
                </div>

                <p className={styles.instructions}>
                    {t('decision.qrInstructions', 'Scan this code with a phone camera to open and vote on this decision.')}
                </p>

                <div className={styles.linkRow}>
                    <input
                        type="text"
                        readOnly
                        value={url || ''}
                        className={styles.urlInput}
                        onClick={(e) => e.target.select()}
                        data-testid="qr-url-input"
                    />
                    <button
                        type="button"
                        className={styles.btnCopy}
                        onClick={handleCopy}
                        data-testid="qr-copy-btn"
                    >
                        {copied ? t('decision.copied', 'Copied!') : t('decision.copyLinkButton', 'Copy Link')}
                    </button>
                </div>

                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.btnDownload}
                        onClick={handleDownload}
                        data-testid="qr-download-btn"
                    >
                        {t('decision.downloadQRCode', 'Download QR Code')}
                    </button>
                    <button
                        type="button"
                        className={styles.btnClose}
                        onClick={onClose}
                    >
                        {t('common.close', 'Close')}
                    </button>
                </div>
            </div>
        </div>
    );
}
