import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
});
