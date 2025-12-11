import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddArgumentForm from './AddArgumentForm';
import { UserProvider } from '../contexts/UserContext';

// Mock the firebase module
vi.mock('../services/firebase', () => ({
    addArgument: vi.fn(),
}));

// Mock UserContext to provide a default user with displayName
vi.mock('../contexts/UserContext', async () => {
    const actual = await vi.importActual('../contexts/UserContext');
    return {
        ...actual,
        useUser: vi.fn(() => ({
            user: { userId: 'test-user-id', displayName: 'Test User' },
            setDisplayName: vi.fn()
        }))
    };
});

import { addArgument as mockAddArgument } from '../services/firebase';

describe('AddArgumentForm Component', () => {
    const mockDecisionId = 'test-decision-123';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders form for pro arguments', () => {
        render(<AddArgumentForm decisionId={mockDecisionId} type="pro" readOnly={false} />);

        expect(screen.getByPlaceholderText('Add a Pro...')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
    });

    it('renders form for con arguments', () => {
        render(<AddArgumentForm decisionId={mockDecisionId} type="con" readOnly={false} />);

        expect(screen.getByPlaceholderText('Add a Con...')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
    });

    it('handles text input', async () => {
        const user = userEvent.setup();
        render(<AddArgumentForm decisionId={mockDecisionId} type="pro" readOnly={false} />);

        const input = screen.getByPlaceholderText('Add a Pro...');
        await user.type(input, 'This is a great idea');

        expect(input).toHaveValue('This is a great idea');
    });

    it('submits argument successfully', async () => {
        const user = userEvent.setup();
        mockAddArgument.mockResolvedValue('new-argument-id');

        render(<AddArgumentForm decisionId={mockDecisionId} type="pro" readOnly={false} />);

        const input = screen.getByPlaceholderText('Add a Pro...');
        const button = screen.getByRole('button', { name: /add/i });

        await user.type(input, 'Great benefit');
        await user.click(button);

        await waitFor(() => {
            expect(mockAddArgument).toHaveBeenCalledWith(mockDecisionId, 'pro', 'Great benefit', 'Test User', 'test-user-id');
            expect(input).toHaveValue(''); // Input should be cleared
        });
    });

    it('shows loading state during submission', async () => {
        const user = userEvent.setup();
        mockAddArgument.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('id'), 100)));

        render(<AddArgumentForm decisionId={mockDecisionId} type="pro" readOnly={false} />);

        const input = screen.getByPlaceholderText('Add a Pro...');
        const button = screen.getByRole('button', { name: /add/i });

        await user.type(input, 'Test argument');
        await user.click(button);

        expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();
        expect(button).toBeDisabled();

        await waitFor(() => {
            expect(screen.getByText(/add/i)).toBeInTheDocument();
        });
    });

    it('handles submission error', async () => {
        const user = userEvent.setup();
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });
        mockAddArgument.mockRejectedValue(new Error('Network error'));

        render(<AddArgumentForm decisionId={mockDecisionId} type="pro" readOnly={false} />);

        const input = screen.getByPlaceholderText('Add a Pro...');
        const button = screen.getByRole('button', { name: /add/i });

        await user.type(input, 'Test argument');
        await user.click(button);

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith('Failed to add argument. Please try again.');
        });

        alertSpy.mockRestore();
    });

    it('does not submit with empty text', async () => {
        const user = userEvent.setup();

        render(<AddArgumentForm decisionId={mockDecisionId} type="pro" readOnly={false} />);

        const button = screen.getByRole('button', { name: /add/i });
        await user.click(button);

        expect(mockAddArgument).not.toHaveBeenCalled();
    });

    it('does not submit with whitespace-only text', async () => {
        const user = userEvent.setup();

        render(<AddArgumentForm decisionId={mockDecisionId} type="pro" readOnly={false} />);

        const input = screen.getByPlaceholderText('Add a Pro...');
        const button = screen.getByRole('button', { name: /add/i });

        await user.type(input, '   ');
        await user.click(button);

        expect(mockAddArgument).not.toHaveBeenCalled();
    });

    it('disables form in read-only mode', () => {
        render(<AddArgumentForm decisionId={mockDecisionId} type="pro" readOnly={true} />);

        const input = screen.getByPlaceholderText('Add a Pro...');
        const button = screen.getByRole('button', { name: /add/i });

        expect(input).toBeDisabled();
        expect(button).toBeDisabled();
    });

    it('does not submit when read-only', () => {
        render(<AddArgumentForm decisionId={mockDecisionId} type="pro" readOnly={true} />);

        // Input is disabled, so typing won't work, but we can verify the button doesn't work
        const button = screen.getByRole('button', { name: /add/i });
        expect(button).toBeDisabled();

        expect(mockAddArgument).not.toHaveBeenCalled();
    });

    it('button is disabled when input is empty', () => {
        render(<AddArgumentForm decisionId={mockDecisionId} type="pro" readOnly={false} />);

        const button = screen.getByRole('button', { name: /add/i });
        expect(button).toBeDisabled();
    });

    it('button is enabled when input has text', async () => {
        const user = userEvent.setup();
        render(<AddArgumentForm decisionId={mockDecisionId} type="pro" readOnly={false} />);

        const input = screen.getByPlaceholderText('Add a Pro...');
        const button = screen.getByRole('button', { name: /add/i });

        await user.type(input, 'Some text');
        expect(button).not.toBeDisabled();
    });
});
