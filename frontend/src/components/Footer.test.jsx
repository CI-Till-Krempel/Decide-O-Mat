import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import Footer from './Footer';
import EncryptionService from '../services/EncryptionService';

// Mock EncryptionService
vi.mock('../services/EncryptionService', () => ({
    default: {
        isEnabled: vi.fn(),
    }
}));

// Mock useLocation
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useLocation: vi.fn(),
    };
});

describe('Footer Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Default: Encryption enabled, no key
        EncryptionService.isEnabled.mockReturnValue(true);
        useLocation.mockReturnValue({ hash: '' });
    });

    it('renders closed lock when encrypted and no key present', () => {
        render(<Footer />);
        expect(screen.getByText(/End-to-End Encrypted/i)).toBeInTheDocument();
        expect(screen.getByTestId('lock-closed')).toBeInTheDocument();
    });

    it('renders open lock when encrypted and key IS present', () => {
        useLocation.mockReturnValue({ hash: '#key=some-key' });
        render(<Footer />);
        expect(screen.getByText(/End-to-End Encrypted/i)).toBeInTheDocument();
        expect(screen.getByTestId('lock-open')).toBeInTheDocument();
        expect(screen.queryByTestId('lock-closed')).not.toBeInTheDocument();
    });

    it('renders unencrypted status when encryption is disabled', () => {
        EncryptionService.isEnabled.mockReturnValue(false);
        render(<Footer />);
        // Assuming default in test environment might need setup, but checking for "Unencrypted" is safe
        expect(screen.getByText(/Unencrypted/i)).toBeInTheDocument();
        expect(screen.getByTestId('lock-open')).toBeInTheDocument();
    });
});
