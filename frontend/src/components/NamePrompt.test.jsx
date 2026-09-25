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

        expect(screen.getByRole('heading', { name: "What's your name?" })).toBeInTheDocument();
        expect(screen.getByText('Your name will be shown with your contributions to help others identify you.')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
        expect(screen.getByLabelText('Enter your name')).toBeInTheDocument();
        expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });

    it('disables Save button when input is empty', () => {
        render(<NamePrompt onSave={vi.fn()} onCancel={vi.fn()} />);

        const saveButton = screen.getByRole('button', { name: 'Save' });
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

    it('calls onCancel when cancel button is clicked', () => {
        const onCancel = vi.fn();
        render(<NamePrompt onSave={vi.fn()} onCancel={onCancel} />);

        const cancelButton = screen.getByRole('button', { name: 'Cancel' });
        fireEvent.click(cancelButton);

        expect(onCancel).toHaveBeenCalled();
    });
});
