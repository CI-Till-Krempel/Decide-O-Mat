import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FAB from './FAB';

vi.mock('react-i18next', () => {
    const translations = {
        'decision.copyLinkButton': 'Copy Link',
        'decision.showQRCode': 'Show QR Code',
        'decision.share': 'Share',
        'common.close': 'Close',
    };
    return {
        useTranslation: () => ({ t: (key, fallback) => translations[key] || fallback || key }),
    };
});

describe('FAB Component', () => {
    it('renders main FAB button', () => {
        render(<FAB onCopyLink={vi.fn()} onShowQRCode={vi.fn()} />);
        const fab = screen.getByTestId('main-fab');
        expect(fab).toBeInTheDocument();
        expect(fab).toHaveAttribute('aria-expanded', 'false');
    });

    it('opens speed dial menu when clicked with multiple actions', async () => {
        const user = userEvent.setup();
        render(<FAB onCopyLink={vi.fn()} onShowQRCode={vi.fn()} />);
        
        expect(screen.queryByTestId('fab-copy-link')).not.toBeInTheDocument();
        expect(screen.queryByTestId('fab-qr-code')).not.toBeInTheDocument();

        await user.click(screen.getByTestId('main-fab'));

        expect(screen.getByTestId('fab-copy-link')).toBeInTheDocument();
        expect(screen.getByTestId('fab-qr-code')).toBeInTheDocument();
        expect(screen.getByTestId('main-fab')).toHaveAttribute('aria-expanded', 'true');
    });

    it('calls onCopyLink and closes menu when Copy Link item is clicked', async () => {
        const onCopyLink = vi.fn();
        const user = userEvent.setup();
        render(<FAB onCopyLink={onCopyLink} onShowQRCode={vi.fn()} />);

        await user.click(screen.getByTestId('main-fab'));
        await user.click(screen.getByTestId('fab-copy-link'));

        expect(onCopyLink).toHaveBeenCalledTimes(1);
        expect(screen.queryByTestId('fab-copy-link')).not.toBeInTheDocument();
    });

    it('calls onShowQRCode and closes menu when QR Code item is clicked', async () => {
        const onShowQRCode = vi.fn();
        const user = userEvent.setup();
        render(<FAB onCopyLink={vi.fn()} onShowQRCode={onShowQRCode} />);

        await user.click(screen.getByTestId('main-fab'));
        await user.click(screen.getByTestId('fab-qr-code'));

        expect(onShowQRCode).toHaveBeenCalledTimes(1);
        expect(screen.queryByTestId('fab-qr-code')).not.toBeInTheDocument();
    });

    it('closes menu on Escape key press', async () => {
        const user = userEvent.setup();
        render(<FAB onCopyLink={vi.fn()} onShowQRCode={vi.fn()} />);

        await user.click(screen.getByTestId('main-fab'));
        expect(screen.getByTestId('fab-copy-link')).toBeInTheDocument();

        fireEvent.keyDown(document, { key: 'Escape' });
        expect(screen.queryByTestId('fab-copy-link')).not.toBeInTheDocument();
    });

    it('calls onClick directly when only single action provided (backward compatibility)', async () => {
        const onClick = vi.fn();
        const user = userEvent.setup();
        render(<FAB onClick={onClick} />);

        await user.click(screen.getByTestId('main-fab'));
        expect(onClick).toHaveBeenCalledTimes(1);
        expect(screen.queryByTestId('fab-copy-link')).not.toBeInTheDocument();
    });

    it('disables FAB button when disabled prop is true', () => {
        render(<FAB onCopyLink={vi.fn()} onShowQRCode={vi.fn()} disabled={true} />);
        expect(screen.getByTestId('main-fab')).toBeDisabled();
    });
});
