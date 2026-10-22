import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NamePrompt from './NamePrompt';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => {
            const translations = {
                'namePrompt.title': "What's your name?",
                'namePrompt.description': 'Your name will be shown with your contributions to help others identify you.',
                'namePrompt.placeholder': 'Enter your name',
                'namePrompt.buttonCancel': 'Cancel',
                'namePrompt.buttonSave': 'Save'
            };
            return translations[key] || key;
        }
    })
}));

describe('NamePrompt Component', () => {
    it('renders with translated strings and accessible labels', () => {
        render(<NamePrompt onSave={vi.fn()} onCancel={vi.fn()} />);

        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
        expect(dialog).toHaveAttribute('aria-modal', 'true');
        expect(dialog).toHaveAttribute('aria-labelledby', 'name-prompt-title');
        expect(dialog).toHaveAttribute('aria-describedby', 'name-prompt-description');

        expect(screen.getByRole('heading', { name: "What's your name?" })).toHaveAttribute('id', 'name-prompt-title');
        expect(screen.getByText('Your name will be shown with your contributions to help others identify you.')).toHaveAttribute('id', 'name-prompt-description');

        const input = screen.getByPlaceholderText('Enter your name');
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('aria-label', 'Enter your name');

        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });

    it('disables Save button when input is empty or contains only whitespace', () => {
        render(<NamePrompt onSave={vi.fn()} onCancel={vi.fn()} />);

        const saveButton = screen.getByRole('button', { name: 'Save' });
        expect(saveButton).toBeDisabled();

        const input = screen.getByPlaceholderText('Enter your name');
        fireEvent.change(input, { target: { value: '   ' } });
        expect(saveButton).toBeDisabled();
    });

    it('calls onSave with trimmed name when submitted', () => {
        const onSave = vi.fn();
        render(<NamePrompt onSave={onSave} onCancel={vi.fn()} />);

        const input = screen.getByPlaceholderText('Enter your name');
        fireEvent.change(input, { target: { value: '  Jane Doe  ' } });

        const saveButton = screen.getByRole('button', { name: 'Save' });
        expect(saveButton).not.toBeDisabled();
        fireEvent.click(saveButton);

        expect(onSave).toHaveBeenCalledWith('Jane Doe');
    });

    it('handles form submission when onSave is not provided without throwing', () => {
        render(<NamePrompt onCancel={vi.fn()} />);

        const input = screen.getByPlaceholderText('Enter your name');
        fireEvent.change(input, { target: { value: 'Jane Doe' } });

        const saveButton = screen.getByRole('button', { name: 'Save' });
        expect(() => fireEvent.click(saveButton)).not.toThrow();
    });

    it('calls onCancel when cancel button is clicked', () => {
        const onCancel = vi.fn();
        render(<NamePrompt onSave={vi.fn()} onCancel={onCancel} />);

        const cancelButton = screen.getByRole('button', { name: 'Cancel' });
        fireEvent.click(cancelButton);

        expect(onCancel).toHaveBeenCalled();
    });

    it('calls onCancel when overlay is clicked', () => {
        const onCancel = vi.fn();
        const { container } = render(<NamePrompt onSave={vi.fn()} onCancel={onCancel} />);

        const overlay = container.firstChild;
        fireEvent.click(overlay);

        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('does not call onCancel when modal dialog itself is clicked', () => {
        const onCancel = vi.fn();
        render(<NamePrompt onSave={vi.fn()} onCancel={onCancel} />);

        const dialog = screen.getByRole('dialog');
        fireEvent.click(dialog);

        expect(onCancel).not.toHaveBeenCalled();
    });

    it('does not throw when overlay is clicked without onCancel prop', () => {
        const { container } = render(<NamePrompt onSave={vi.fn()} />);

        const overlay = container.firstChild;
        expect(() => fireEvent.click(overlay)).not.toThrow();
    });

    it('calls onCancel when Escape key is pressed', () => {
        const onCancel = vi.fn();
        render(<NamePrompt onSave={vi.fn()} onCancel={onCancel} />);

        fireEvent.keyDown(document, { key: 'Escape' });
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('does not call onCancel when other keys are pressed', () => {
        const onCancel = vi.fn();
        render(<NamePrompt onSave={vi.fn()} onCancel={onCancel} />);

        fireEvent.keyDown(document, { key: 'Enter' });
        expect(onCancel).not.toHaveBeenCalled();
    });

    it('does not throw when Escape key is pressed without onCancel prop', () => {
        render(<NamePrompt onSave={vi.fn()} />);

        expect(() => fireEvent.keyDown(document, { key: 'Escape' })).not.toThrow();
    });

    it('removes Escape key listener on unmount', () => {
        const onCancel = vi.fn();
        const { unmount } = render(<NamePrompt onSave={vi.fn()} onCancel={onCancel} />);

        unmount();
        fireEvent.keyDown(document, { key: 'Escape' });
        expect(onCancel).not.toHaveBeenCalled();
    });
});
