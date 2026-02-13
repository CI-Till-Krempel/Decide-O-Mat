import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Home from './Home';

// Mock i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => {
            const translations = {
                'home.subtitle': 'Simply decide',
                'home.description': 'A person makes an estimated 20,000 to 35,000 decisions per day.',
                'home.inputPlaceholder': 'Enter your question here',
                'home.inputLabel': 'Question to be decided',
                'home.buttonStart': 'Start Deciding',
                'home.buttonStarting': 'Creating...',
                'home.errorCreateFailed': 'Failed to create decision. Please try again.',
                'home.clearAlt': 'Clear',
            };
            return translations[key] || key;
        },
    }),
}));

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

    it('renders the home page with heading and input', () => {
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        expect(screen.getByText('Simply decide')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter your question here')).toBeInTheDocument();
        expect(screen.getByLabelText('Start Deciding')).toBeInTheDocument();
    });

    it('renders the description text', () => {
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        expect(screen.getByText(/A person makes an estimated/)).toBeInTheDocument();
    });

    it('renders the floating label', () => {
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        expect(screen.getByText('Question to be decided')).toBeInTheDocument();
    });

    it('handles question input', async () => {
        const user = userEvent.setup();
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        const input = screen.getByPlaceholderText('Enter your question here');
        await user.type(input, 'Should we have pizza for lunch?');

        expect(input).toHaveValue('Should we have pizza for lunch?');
    });

    it('shows clear button when text is entered', async () => {
        const user = userEvent.setup();
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        expect(screen.queryByLabelText('Clear')).not.toBeInTheDocument();

        const input = screen.getByPlaceholderText('Enter your question here');
        await user.type(input, 'Test');

        expect(screen.getByLabelText('Clear')).toBeInTheDocument();
    });

    it('clears input when clear button is clicked', async () => {
        const user = userEvent.setup();
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        const input = screen.getByPlaceholderText('Enter your question here');
        await user.type(input, 'Test question');
        expect(input).toHaveValue('Test question');

        await user.click(screen.getByLabelText('Clear'));
        expect(input).toHaveValue('');
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

        const input = screen.getByPlaceholderText('Enter your question here');
        const button = screen.getByLabelText('Start Deciding');

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

        const input = screen.getByPlaceholderText('Enter your question here');
        const button = screen.getByLabelText('Start Deciding');

        await user.type(input, 'Secret Decision');
        await user.click(button);

        await waitFor(() => {
            expect(EncryptionService.generateKey).toHaveBeenCalled();
            expect(EncryptionService.exportKey).toHaveBeenCalledWith(mockKey);
            expect(EncryptionService.encrypt).toHaveBeenCalledWith('Secret Decision', mockKey);
            expect(mockCreateDecision).toHaveBeenCalledWith({ question: mockEncryptedQuestion });
            expect(mockNavigate).toHaveBeenCalledWith(`/d/${mockDecisionId}#key=${mockExportedKey}`);
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

        const input = screen.getByPlaceholderText('Enter your question here');
        const button = screen.getByLabelText('Start Deciding');

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

        const button = screen.getByLabelText('Start Deciding');
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

        const input = screen.getByPlaceholderText('Enter your question here');
        await user.type(input, 'Test question{Enter}');

        await waitFor(() => {
            expect(mockCreateDecision).toHaveBeenCalled();
        });
    });
});
