import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import MagicLinkData from './MagicLinkData';
import { generateMagicLink } from '../services/firebase';
import EncryptionService from '../services/EncryptionService';

vi.mock('../services/firebase', () => ({
    generateMagicLink: vi.fn(),
}));

describe('MagicLinkData', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('generates a magic link with token in hash fragment when no keys exist', async () => {
        generateMagicLink.mockResolvedValue('test-custom-token');

        render(<MagicLinkData />);
        const generateBtn = screen.getByRole('button', { name: /generate magic link/i });
        fireEvent.click(generateBtn);

        await waitFor(() => {
            expect(screen.getByText(/#token=test-custom-token/)).toBeInTheDocument();
        });
        expect(screen.queryByText(/keys=/)).not.toBeInTheDocument();
    });

    it('bundles stored decision encryption keys into the magic link URL hash', async () => {
        generateMagicLink.mockResolvedValue('test-custom-token');
        EncryptionService.storeKey('decision-456', 'key-material-xyz');

        render(<MagicLinkData />);
        const generateBtn = screen.getByRole('button', { name: /generate magic link/i });
        fireEvent.click(generateBtn);

        await waitFor(() => {
            const linkElement = screen.getByText(/#token=test-custom-token/);
            expect(linkElement).toBeInTheDocument();
            expect(linkElement.textContent).toContain('keys=');
        });
    });

    it('handles generation errors gracefully', async () => {
        generateMagicLink.mockRejectedValue(new Error('Network error'));

        render(<MagicLinkData />);
        const generateBtn = screen.getByRole('button', { name: /generate magic link/i });
        fireEvent.click(generateBtn);

        await waitFor(() => {
            expect(screen.getByText(/failed to generate link/i)).toBeInTheDocument();
        });
    });

    it('copies magic link to clipboard and reverts feedback after timeout', async () => {
        vi.useFakeTimers();
        const writeTextMock = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, 'clipboard', {
            value: { writeText: writeTextMock },
            configurable: true,
            writable: true,
        });

        generateMagicLink.mockResolvedValue('test-token-copy');

        render(<MagicLinkData />);
        const generateBtn = screen.getByRole('button', { name: /generate magic link/i });
        await act(async () => {
            fireEvent.click(generateBtn);
        });

        const copyBtn = screen.getByRole('button', { name: /copy link/i });
        await act(async () => {
            fireEvent.click(copyBtn);
        });

        expect(writeTextMock).toHaveBeenCalledWith(expect.stringContaining('#token=test-token-copy'));
        expect(screen.getByRole('button', { name: /copied!/i })).toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(screen.getByRole('button', { name: /copy link/i })).toBeInTheDocument();
    });

    it('handles clipboard write failure without crashing', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const writeTextMock = vi.fn().mockRejectedValue(new Error('Clipboard permission denied'));
        Object.defineProperty(navigator, 'clipboard', {
            value: { writeText: writeTextMock },
            configurable: true,
            writable: true,
        });

        generateMagicLink.mockResolvedValue('test-token-failure');

        render(<MagicLinkData />);
        const generateBtn = screen.getByRole('button', { name: /generate magic link/i });
        fireEvent.click(generateBtn);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /copy link/i })).toBeInTheDocument();
        });

        const copyBtn = screen.getByRole('button', { name: /copy link/i });
        await fireEvent.click(copyBtn);

        expect(writeTextMock).toHaveBeenCalled();
        consoleErrorSpy.mockRestore();
    });

    it('cleans up copy timeout on unmount', async () => {
        vi.useFakeTimers();
        const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
        const writeTextMock = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, 'clipboard', {
            value: { writeText: writeTextMock },
            configurable: true,
            writable: true,
        });

        generateMagicLink.mockResolvedValue('test-token-cleanup');

        const { unmount } = render(<MagicLinkData />);
        const generateBtn = screen.getByRole('button', { name: /generate magic link/i });
        await act(async () => {
            fireEvent.click(generateBtn);
        });

        const copyBtn = screen.getByRole('button', { name: /copy link/i });
        await act(async () => {
            fireEvent.click(copyBtn);
        });

        unmount();
        expect(clearTimeoutSpy).toHaveBeenCalled();
        clearTimeoutSpy.mockRestore();
    });
});
