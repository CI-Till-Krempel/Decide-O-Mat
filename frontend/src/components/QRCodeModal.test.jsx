import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

    afterEach(() => {
        vi.useRealTimers();
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

    it('has dialog role, aria-modal, aria-labelledby, and aria-describedby for accessibility', () => {
        render(<QRCodeModal {...defaultProps} />);

        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-modal', 'true');
        expect(dialog).toHaveAttribute('aria-labelledby', 'qr-modal-title');
        expect(dialog).toHaveAttribute('aria-describedby', 'qr-modal-instructions');
    });

    it('preserves and passes full E2EE key in the QR canvas URL', () => {
        render(<QRCodeModal {...defaultProps} />);

        expect(screen.getByTestId('qr-url-input')).toHaveValue(defaultProps.url);
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

    it('reverts copied state back to Copy Link after 2-second timeout', async () => {
        vi.useFakeTimers();
        render(<QRCodeModal {...defaultProps} />);

        const copyBtn = screen.getByTestId('qr-copy-btn');
        await act(async () => {
            fireEvent.click(copyBtn);
        });

        expect(screen.getByText('Copied!')).toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(screen.getByText('Copy Link')).toBeInTheDocument();
    });

    it('cleans up copy timeout on unmount', async () => {
        vi.useFakeTimers();
        const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
        const { unmount } = render(<QRCodeModal {...defaultProps} />);

        const copyBtn = screen.getByTestId('qr-copy-btn');
        await act(async () => {
            fireEvent.click(copyBtn);
        });

        unmount();
        expect(clearTimeoutSpy).toHaveBeenCalled();
        clearTimeoutSpy.mockRestore();
    });

    it('falls back to navigator.clipboard.writeText when copyRichLink fails', async () => {
        copyRichLink.mockRejectedValueOnce(new Error('Rich copy failed'));
        const writeTextMock = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, 'clipboard', {
            value: { writeText: writeTextMock },
            configurable: true,
            writable: true,
        });

        render(<QRCodeModal {...defaultProps} />);

        const copyBtn = screen.getByTestId('qr-copy-btn');
        fireEvent.click(copyBtn);

        await waitFor(() => {
            expect(writeTextMock).toHaveBeenCalledWith(defaultProps.url);
        });
        expect(screen.getByText('Copied!')).toBeInTheDocument();
    });

    it('falls back to document.execCommand when navigator.clipboard is unavailable', async () => {
        copyRichLink.mockRejectedValueOnce(new Error('Rich copy failed'));
        Object.defineProperty(navigator, 'clipboard', {
            value: undefined,
            configurable: true,
            writable: true,
        });

        const execCommandMock = vi.fn().mockReturnValue(true); document.execCommand = execCommandMock;

        render(<QRCodeModal {...defaultProps} />);

        const copyBtn = screen.getByTestId('qr-copy-btn');
        fireEvent.click(copyBtn);

        await waitFor(() => {
            expect(execCommandMock).toHaveBeenCalledWith('copy');
        });
        expect(screen.getByText('Copied!')).toBeInTheDocument();
        delete document.execCommand;
    });

    it('does nothing when copy is triggered with an empty URL', async () => {
        render(<QRCodeModal {...defaultProps} url="" />);

        const copyBtn = screen.getByTestId('qr-copy-btn');
        fireEvent.click(copyBtn);

        expect(copyRichLink).not.toHaveBeenCalled();
        expect(screen.queryByText('Copied!')).not.toBeInTheDocument();
    });

    it('selects URL text when the input is clicked', () => {
        render(<QRCodeModal {...defaultProps} />);

        const input = screen.getByTestId('qr-url-input');
        const selectSpy = vi.spyOn(input, 'select').mockImplementation(() => {});

        fireEvent.click(input);
        expect(selectSpy).toHaveBeenCalled();
        selectSpy.mockRestore();
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

    it('safely handles missing onClose callback without throwing errors', () => {
        expect(() => {
            render(<QRCodeModal question="Test?" url="https://example.com" />);

            const closeIconBtn = screen.getByLabelText('Close');
            fireEvent.click(closeIconBtn);

            const overlay = screen.getByTestId('qr-modal-overlay');
            fireEvent.click(overlay);

            fireEvent.keyDown(document, { key: 'Escape' });
        }).not.toThrow();
    });

    it('handles download QR code action without crashing and triggers anchor click', () => {
        const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

        render(<QRCodeModal {...defaultProps} />);

        const canvas = screen.getByTestId('qr-canvas-container').querySelector('canvas');
        if (canvas) {
            canvas.toDataURL = vi.fn().mockReturnValue('data:image/png;base64,fake');
        }

        const downloadBtn = screen.getByTestId('qr-download-btn');
        fireEvent.click(downloadBtn);

        expect(clickSpy).toHaveBeenCalled();
        clickSpy.mockRestore();
    });
});
