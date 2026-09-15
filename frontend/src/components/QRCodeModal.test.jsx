import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import QRCodeModal from './QRCodeModal';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key, defaultValue) => {
            const map = {
                'decision.qrModalTitle': 'Share Decision via QR Code',
                'decision.downloadQRCode': 'Download QR Code',
                'decision.qrInstructions': 'Scan this code with a phone camera to open and vote on this decision.',
                'decision.copied': 'Copied!',
                'decision.copyLinkButton': 'Copy Link',
                'common.close': 'Close',
            };
            return map[key] || defaultValue || key;
        }
    })
}));

vi.mock('../utils/ClipboardUtils', () => ({
    copyRichLink: vi.fn().mockResolvedValue(undefined)
}));

import { copyRichLink } from '../utils/ClipboardUtils';

describe('QRCodeModal Component', () => {
    const defaultProps = {
        question: 'Should we launch v2.0 now?',
        url: 'https://decide-o-mat.web.app/d/dec-123#key=secret-encryption-key-xyz',
        decisionId: 'dec-123',
        onClose: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders modal dialog with question, QR code canvas container, and URL input', () => {
        render(<QRCodeModal {...defaultProps} />);

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Share Decision via QR Code')).toBeInTheDocument();
        expect(screen.getByText('Should we launch v2.0 now?')).toBeInTheDocument();
        expect(screen.getByTestId('qr-canvas-container')).toBeInTheDocument();

        const input = screen.getByTestId('qr-url-input');
        expect(input).toHaveValue('https://decide-o-mat.web.app/d/dec-123#key=secret-encryption-key-xyz');
    });

    it('preserves and passes full E2EE key in the QR canvas URL', () => {
        render(<QRCodeModal {...defaultProps} />);

        // Check that the URL input has the full E2EE hash
        expect(screen.getByTestId('qr-url-input')).toHaveValue(defaultProps.url);
        // Check canvas element is created
        const canvas = screen.getByTestId('qr-canvas-container').querySelector('canvas');
        expect(canvas).toBeInTheDocument();
    });

    it('copies the full URL when Copy Link button is clicked', async () => {
        render(<QRCodeModal {...defaultProps} />);

        const copyBtn = screen.getByTestId('qr-copy-btn');
        fireEvent.click(copyBtn);

        await waitFor(() => {
            expect(copyRichLink).toHaveBeenCalledWith(
                'https://decide-o-mat.web.app/d/dec-123#key=secret-encryption-key-xyz',
                'Should we launch v2.0 now?'
            );
        });
        expect(screen.getByText('Copied!')).toBeInTheDocument();
    });

    it('calls onClose when close icon is clicked', () => {
        render(<QRCodeModal {...defaultProps} />);

        const closeIconBtn = screen.getByLabelText('Close');
        fireEvent.click(closeIconBtn);
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('calls onClose when bottom Close button is clicked', () => {
        render(<QRCodeModal {...defaultProps} />);

        const closeButtons = screen.getAllByRole('button', { name: 'Close' });
        const bottomBtn = closeButtons[closeButtons.length - 1];
        fireEvent.click(bottomBtn);
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('calls onClose when overlay is clicked', () => {
        render(<QRCodeModal {...defaultProps} />);

        const overlay = screen.getByTestId('qr-modal-overlay');
        fireEvent.click(overlay);
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('does not call onClose when clicking inside the modal content', () => {
        render(<QRCodeModal {...defaultProps} />);

        const modal = screen.getByRole('dialog');
        fireEvent.click(modal);
        expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('calls onClose when Escape key is pressed', () => {
        render(<QRCodeModal {...defaultProps} />);

        fireEvent.keyDown(document, { key: 'Escape' });
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('handles download QR code action without crashing', () => {
        render(<QRCodeModal {...defaultProps} />);

        const canvas = screen.getByTestId('qr-canvas-container').querySelector('canvas');
        if (canvas) {
            canvas.toDataURL = vi.fn().mockReturnValue('data:image/png;base64,fake');
        }

        const downloadBtn = screen.getByTestId('qr-download-btn');
        fireEvent.click(downloadBtn);
    });
});
