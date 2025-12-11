import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Home from './Home';

// Mock the firebase module
vi.mock('../services/firebase', () => ({
    functions: {},
}));

// Mock firebase/functions
const mockCreateDecision = vi.fn();
vi.mock('firebase/functions', () => ({
    httpsCallable: vi.fn(() => mockCreateDecision),
}));

// Mock EncryptionService
vi.mock('../services/EncryptionService', () => ({
    default: {
        isEnabled: vi.fn(),
        generateKey: vi.fn(),
        exportKey: vi.fn(),
        encrypt: vi.fn(),
    }
}));
import EncryptionService from '../services/EncryptionService';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('Home Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Default: encryption disabled
        EncryptionService.isEnabled.mockReturnValue(false);
    });

    it('renders the home page with title and input', () => {
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        expect(screen.getByText('Decide-O-Mat')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('What do you need to decide?')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /start deciding/i })).toBeInTheDocument();
    });

    it('handles question input', async () => {
        const user = userEvent.setup();
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        const input = screen.getByPlaceholderText('What do you need to decide?');
        await user.type(input, 'Should we have pizza for lunch?');

        expect(input).toHaveValue('Should we have pizza for lunch?');
    });

    it('creates decision and navigates on form submission (unencrypted)', async () => {
        const user = userEvent.setup();
        const mockDecisionId = 'test-decision-123';
        mockCreateDecision.mockResolvedValue({ data: { id: mockDecisionId } });

        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        const input = screen.getByPlaceholderText('What do you need to decide?');
        const button = screen.getByRole('button', { name: /start deciding/i });

        await user.type(input, 'Should we have pizza?');
        await user.click(button);

        await waitFor(() => {
            expect(mockCreateDecision).toHaveBeenCalledWith({ question: 'Should we have pizza?' });
            expect(mockNavigate).toHaveBeenCalledWith(`/d/${mockDecisionId}`);
        });
    });

    it('encrypts question and includes key in URL when enabled', async () => {
        const user = userEvent.setup();
        const mockDecisionId = 'test-decision-123';
        const mockKey = 'mock-key-object';
        const mockExportedKey = 'mock-exported-key';
        const mockEncryptedQuestion = 'encrypted-question-string';

        // Setup encryption mocks
        EncryptionService.isEnabled.mockReturnValue(true);
        EncryptionService.generateKey.mockResolvedValue(mockKey);
        EncryptionService.exportKey.mockResolvedValue(mockExportedKey);
        EncryptionService.encrypt.mockResolvedValue(mockEncryptedQuestion);

        mockCreateDecision.mockResolvedValue({ data: { id: mockDecisionId } });

        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        const input = screen.getByPlaceholderText('What do you need to decide?');
        const button = screen.getByRole('button', { name: /start deciding/i });

        await user.type(input, 'Secret Decision');
        await user.click(button);

        await waitFor(() => {
            // Verify encryption flow
            expect(EncryptionService.generateKey).toHaveBeenCalled();
            expect(EncryptionService.exportKey).toHaveBeenCalledWith(mockKey);
            expect(EncryptionService.encrypt).toHaveBeenCalledWith('Secret Decision', mockKey);

            // Verify backend call with encrypted data
            expect(mockCreateDecision).toHaveBeenCalledWith({ question: mockEncryptedQuestion });

            // Verify navigation with key in hash
            expect(mockNavigate).toHaveBeenCalledWith(`/d/${mockDecisionId}#key=${mockExportedKey}`);
        });
    });

    it('shows loading state during submission', async () => {
        const user = userEvent.setup();
        mockCreateDecision.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: { id: 'test' } }), 100)));

        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        const input = screen.getByPlaceholderText('What do you need to decide?');
        const button = screen.getByRole('button', { name: /start deciding/i });

        await user.type(input, 'Test question');
        await user.click(button);

        expect(screen.getByText('Creating...')).toBeInTheDocument();
        expect(button).toBeDisabled();

        await waitFor(() => {
            expect(screen.getByText(/start deciding/i)).toBeInTheDocument();
        });
    });

    it('handles submission error', async () => {
        const user = userEvent.setup();
        mockCreateDecision.mockRejectedValue(new Error('Network error'));

        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        const input = screen.getByPlaceholderText('What do you need to decide?');
        const button = screen.getByRole('button', { name: /start deciding/i });

        await user.type(input, 'Test question');
        await user.click(button);

        await waitFor(() => {
            expect(screen.getByText(/failed to create decision/i)).toBeInTheDocument();
        });
    });

    it('does not submit with empty question', async () => {
        const user = userEvent.setup();

        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        const button = screen.getByRole('button', { name: /start deciding/i });
        await user.click(button);

        expect(mockCreateDecision).not.toHaveBeenCalled();
    });

    it('submits on Enter key press', async () => {
        const user = userEvent.setup();
        mockCreateDecision.mockResolvedValue({ data: { id: 'test-id' } });

        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        const input = screen.getByPlaceholderText('What do you need to decide?');
        await user.type(input, 'Test question{Enter}');

        await waitFor(() => {
            expect(mockCreateDecision).toHaveBeenCalled();
        });
    });
});
