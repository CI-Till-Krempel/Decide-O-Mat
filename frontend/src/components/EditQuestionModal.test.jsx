import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EditQuestionModal from './EditQuestionModal';

// Mock i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => {
            const translations = {
                'decision.editQuestion': 'Edit Question',
                'common.cancel': 'Cancel',
                'common.save': 'Save',
            };
            return translations[key] || key;
        },
    }),
}));

describe('EditQuestionModal Component', () => {
    let onSave;
    let onCancel;

    beforeEach(() => {
        onSave = vi.fn();
        onCancel = vi.fn();
    });

    it('renders the modal with default title, input, and action buttons', () => {
        render(
            <EditQuestionModal
                question="Where should we go for lunch?"
                onSave={onSave}
                onCancel={onCancel}
            />
        );

        expect(screen.getByRole('dialog', { name: 'Edit Question' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 2, name: 'Edit Question' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Edit Question' })).toHaveValue('Where should we go for lunch?');
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });

    it('renders with a custom title when provided', () => {
        render(
            <EditQuestionModal
                title="Edit Argument"
                question="We should choose option A"
                onSave={onSave}
                onCancel={onCancel}
            />
        );

        expect(screen.getByRole('dialog', { name: 'Edit Argument' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 2, name: 'Edit Argument' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Edit Argument' })).toBeInTheDocument();
    });

    it('auto-focuses the input field upon mount', () => {
        render(
            <EditQuestionModal
                question="Test question"
                onSave={onSave}
                onCancel={onCancel}
            />
        );

        const input = screen.getByRole('textbox', { name: 'Edit Question' });
        expect(input).toHaveFocus();
    });

    it('disables the save button initially when input matches the initial question', () => {
        render(
            <EditQuestionModal
                question="Unchanged question"
                onSave={onSave}
                onCancel={onCancel}
            />
        );

        const saveButton = screen.getByRole('button', { name: 'Save' });
        expect(saveButton).toBeDisabled();
    });

    it('enables the save button when user modifies the question', () => {
        render(
            <EditQuestionModal
                question="Initial text"
                onSave={onSave}
                onCancel={onCancel}
            />
        );

        const input = screen.getByRole('textbox', { name: 'Edit Question' });
        const saveButton = screen.getByRole('button', { name: 'Save' });

        fireEvent.change(input, { target: { value: 'Modified text' } });

        expect(input).toHaveValue('Modified text');
        expect(saveButton).not.toBeDisabled();
    });

    it('disables the save button when user clears the input or enters only whitespace', () => {
        render(
            <EditQuestionModal
                question="Initial text"
                onSave={onSave}
                onCancel={onCancel}
            />
        );

        const input = screen.getByRole('textbox', { name: 'Edit Question' });
        const saveButton = screen.getByRole('button', { name: 'Save' });

        fireEvent.change(input, { target: { value: '   ' } });

        expect(saveButton).toBeDisabled();
    });

    it('calls onSave with trimmed value on form submission', () => {
        render(
            <EditQuestionModal
                question="Initial question"
                onSave={onSave}
                onCancel={onCancel}
            />
        );

        const input = screen.getByRole('textbox', { name: 'Edit Question' });
        fireEvent.change(input, { target: { value: '  Updated question with padding  ' } });

        const saveButton = screen.getByRole('button', { name: 'Save' });
        fireEvent.click(saveButton);

        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onSave).toHaveBeenCalledWith('Updated question with padding');
    });

    it('does not call onSave if form is submitted without changes', () => {
        render(
            <EditQuestionModal
                question="Exact question"
                onSave={onSave}
                onCancel={onCancel}
            />
        );

        const form = screen.getByRole('dialog', { name: 'Edit Question' }).querySelector('form');
        fireEvent.submit(form);

        expect(onSave).not.toHaveBeenCalled();
    });

    it('calls onCancel when the cancel button is clicked', () => {
        render(
            <EditQuestionModal
                question="Some question"
                onSave={onSave}
                onCancel={onCancel}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(onCancel).toHaveBeenCalledTimes(1);
        expect(onSave).not.toHaveBeenCalled();
    });

    it('calls onCancel when clicking outside on the overlay', () => {
        const { container } = render(
            <EditQuestionModal
                question="Some question"
                onSave={onSave}
                onCancel={onCancel}
            />
        );

        const overlay = container.firstChild;
        fireEvent.click(overlay);

        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('does not call onCancel when clicking inside the modal content', () => {
        render(
            <EditQuestionModal
                question="Some question"
                onSave={onSave}
                onCancel={onCancel}
            />
        );

        const modal = screen.getByRole('dialog', { name: 'Edit Question' });
        fireEvent.click(modal);

        expect(onCancel).not.toHaveBeenCalled();
    });

    it('calls onCancel when Escape key is pressed', () => {
        render(
            <EditQuestionModal
                question="Some question"
                onSave={onSave}
                onCancel={onCancel}
            />
        );

        fireEvent.keyDown(document, { key: 'Escape' });

        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('does not call onCancel on other key presses', () => {
        render(
            <EditQuestionModal
                question="Some question"
                onSave={onSave}
                onCancel={onCancel}
            />
        );

        fireEvent.keyDown(document, { key: 'Enter' });

        expect(onCancel).not.toHaveBeenCalled();
    });

    it('removes Escape key listener on unmount', () => {
        const { unmount } = render(
            <EditQuestionModal
                question="Some question"
                onSave={onSave}
                onCancel={onCancel}
            />
        );

        unmount();
        fireEvent.keyDown(document, { key: 'Escape' });

        expect(onCancel).not.toHaveBeenCalled();
    });

    it('disables input, cancel button, and save button when isLoading is true', () => {
        render(
            <EditQuestionModal
                question="Some question"
                onSave={onSave}
                onCancel={onCancel}
                isLoading={true}
            />
        );

        expect(screen.getByRole('textbox', { name: 'Edit Question' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    });

    it('applies custom maxLength to the text input', () => {
        render(
            <EditQuestionModal
                question="Some question"
                onSave={onSave}
                onCancel={onCancel}
                maxLength={250}
            />
        );

        const input = screen.getByRole('textbox', { name: 'Edit Question' });
        expect(input).toHaveAttribute('maxLength', '250');
    });

    it('renders cleanly and handles actions without errors when called without props', () => {
        const { container } = render(<EditQuestionModal />);

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        const input = screen.getByRole('textbox');
        expect(input).toHaveValue('');

        // Cancel button click does not throw
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

        // Overlay click does not throw
        fireEvent.click(container.firstChild);

        // Escape press does not throw
        fireEvent.keyDown(document, { key: 'Escape' });

        // Changing input and submitting does not throw
        fireEvent.change(input, { target: { value: 'New text' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    });

    it('handles null question gracefully', () => {
        render(<EditQuestionModal question={null} onSave={onSave} onCancel={onCancel} />);

        const input = screen.getByRole('textbox');
        expect(input).toHaveValue('');

        fireEvent.change(input, { target: { value: 'A brand new question' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        expect(onSave).toHaveBeenCalledWith('A brand new question');
    });
});
