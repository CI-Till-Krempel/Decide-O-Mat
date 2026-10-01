import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FloatingArgumentInput from './FloatingArgumentInput';

// Mock i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => {
            const translations = {
                'decision.argumentLabel': 'Argument',
                'addArgumentForm.placeholderPro': 'Add a Pro...',
                'addArgumentForm.placeholderCon': 'Add a Con...',
                'addArgumentForm.clearLabel': 'Clear',
                'addArgumentForm.buttonAdd': 'Add',
            };
            return translations[key] || key;
        },
    }),
}));

describe('FloatingArgumentInput Component', () => {
    let onSubmit;
    let onClose;

    beforeEach(() => {
        onSubmit = vi.fn();
        onClose = vi.fn();
    });

    it('renders dialog and pro placeholder by default or when type is pro', () => {
        render(<FloatingArgumentInput onSubmit={onSubmit} onClose={onClose} />);

        expect(screen.getByRole('dialog', { name: 'Add a Pro...' })).toBeInTheDocument();
        expect(screen.getByText('Argument')).toBeInTheDocument();
        const input = screen.getByRole('textbox', { name: 'Argument' });
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('placeholder', 'Add a Pro...');
        expect(input).toHaveValue('');
        expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
    });

    it('renders with con placeholder when type is con', () => {
        render(<FloatingArgumentInput type="con" onSubmit={onSubmit} onClose={onClose} />);

        expect(screen.getByRole('dialog', { name: 'Add a Con...' })).toBeInTheDocument();
        const input = screen.getByRole('textbox', { name: 'Argument' });
        expect(input).toHaveAttribute('placeholder', 'Add a Con...');
    });

    it('auto-focuses the input field upon mount', () => {
        render(<FloatingArgumentInput onSubmit={onSubmit} onClose={onClose} />);

        const input = screen.getByRole('textbox', { name: 'Argument' });
        expect(input).toHaveFocus();
    });

    it('enables the add button when user types non-empty text', () => {
        render(<FloatingArgumentInput onSubmit={onSubmit} onClose={onClose} />);

        const input = screen.getByRole('textbox', { name: 'Argument' });
        const addButton = screen.getByRole('button', { name: 'Add' });

        expect(addButton).toBeDisabled();

        fireEvent.change(input, { target: { value: 'Great performance' } });
        expect(input).toHaveValue('Great performance');
        expect(addButton).not.toBeDisabled();
    });

    it('keeps add button disabled if user enters only whitespace', () => {
        render(<FloatingArgumentInput onSubmit={onSubmit} onClose={onClose} />);

        const input = screen.getByRole('textbox', { name: 'Argument' });
        const addButton = screen.getByRole('button', { name: 'Add' });

        fireEvent.change(input, { target: { value: '   ' } });
        expect(addButton).toBeDisabled();
    });

    it('shows clear button when text is present, and resets text on clear click', () => {
        render(<FloatingArgumentInput onSubmit={onSubmit} onClose={onClose} />);

        const input = screen.getByRole('textbox', { name: 'Argument' });
        expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();

        fireEvent.change(input, { target: { value: 'Temporary argument' } });
        const clearButton = screen.getByRole('button', { name: 'Clear' });
        expect(clearButton).toBeInTheDocument();

        fireEvent.click(clearButton);
        expect(input).toHaveValue('');
        expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
    });

    it('calls onSubmit with trimmed text and argument type on add button click and resets input', () => {
        render(<FloatingArgumentInput type="pro" onSubmit={onSubmit} onClose={onClose} />);

        const input = screen.getByRole('textbox', { name: 'Argument' });
        fireEvent.change(input, { target: { value: '  Lower maintenance cost   ' } });

        const addButton = screen.getByRole('button', { name: 'Add' });
        fireEvent.click(addButton);

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith('Lower maintenance cost', 'pro');
        expect(input).toHaveValue('');
    });

    it('submits with Enter key press in input field', () => {
        render(<FloatingArgumentInput type="con" onSubmit={onSubmit} onClose={onClose} />);

        const input = screen.getByRole('textbox', { name: 'Argument' });
        fireEvent.change(input, { target: { value: 'High initial investment' } });

        fireEvent.keyDown(input, { key: 'Enter' });

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith('High initial investment', 'con');
        expect(input).toHaveValue('');
    });

    it('does not submit on Enter key press if input is empty or whitespace only', () => {
        render(<FloatingArgumentInput onSubmit={onSubmit} onClose={onClose} />);

        const input = screen.getByRole('textbox', { name: 'Argument' });
        fireEvent.keyDown(input, { key: 'Enter' });
        fireEvent.change(input, { target: { value: '   ' } });
        fireEvent.keyDown(input, { key: 'Enter' });

        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('clears text on Escape key press when text is entered and does not call onClose', () => {
        render(<FloatingArgumentInput onSubmit={onSubmit} onClose={onClose} />);

        const input = screen.getByRole('textbox', { name: 'Argument' });
        fireEvent.change(input, { target: { value: 'Draft argument' } });

        fireEvent.keyDown(input, { key: 'Escape' });

        expect(input).toHaveValue('');
        expect(onClose).not.toHaveBeenCalled();
    });

    it('calls onClose on Escape key press when text is empty', () => {
        render(<FloatingArgumentInput onSubmit={onSubmit} onClose={onClose} />);

        const input = screen.getByRole('textbox', { name: 'Argument' });
        fireEvent.keyDown(input, { key: 'Escape' });

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when clicking outside on the backdrop', () => {
        const { container } = render(<FloatingArgumentInput onSubmit={onSubmit} onClose={onClose} />);

        const backdrop = container.firstChild;
        fireEvent.click(backdrop);

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when clicking inside the modal dialog', () => {
        render(<FloatingArgumentInput onSubmit={onSubmit} onClose={onClose} />);

        const dialog = screen.getByRole('dialog');
        fireEvent.click(dialog);

        expect(onClose).not.toHaveBeenCalled();
    });

    it('disables input, add button, and clear button when isLoading is true', () => {
        render(<FloatingArgumentInput isLoading={true} onSubmit={onSubmit} onClose={onClose} />);

        const input = screen.getByRole('textbox', { name: 'Argument' });
        const addButton = screen.getByRole('button', { name: 'Add' });

        expect(input).toBeDisabled();
        expect(addButton).toBeDisabled();
    });

    it('does not submit on Enter when isLoading is true even if text was entered', () => {
        const { rerender } = render(<FloatingArgumentInput isLoading={false} onSubmit={onSubmit} onClose={onClose} />);

        const input = screen.getByRole('textbox', { name: 'Argument' });
        fireEvent.change(input, { target: { value: 'Pending argument' } });

        rerender(<FloatingArgumentInput isLoading={true} onSubmit={onSubmit} onClose={onClose} />);

        fireEvent.keyDown(input, { key: 'Enter' });
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('handles render and interactions safely when called without any props', () => {
        const { container } = render(<FloatingArgumentInput />);

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        const input = screen.getByRole('textbox');
        expect(input).toBeInTheDocument();

        // Typing text
        fireEvent.change(input, { target: { value: 'Safe argument' } });
        expect(input).toHaveValue('Safe argument');

        // Submitting with Enter without onSubmit prop should not throw
        fireEvent.keyDown(input, { key: 'Enter' });

        // Escape when empty without onClose prop should not throw
        fireEvent.keyDown(input, { key: 'Escape' });

        // Backdrop click without onClose prop should not throw
        fireEvent.click(container.firstChild);
    });
});
