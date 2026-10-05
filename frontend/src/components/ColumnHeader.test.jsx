import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ColumnHeader from './ColumnHeader';

describe('ColumnHeader Component', () => {
    it('renders the column label text', () => {
        render(<ColumnHeader label="Pros" onAdd={() => {}} disabled={false} />);
        expect(screen.getByText('Pros')).toBeInTheDocument();
    });

    it('sets aria-label on the add button matching the label', () => {
        render(<ColumnHeader label="Cons" onAdd={() => {}} disabled={false} />);
        expect(screen.getByRole('button', { name: 'Cons' })).toBeInTheDocument();
    });

    it('falls back to default aria-label "Add" when label is empty or omitted', () => {
        render(<ColumnHeader />);
        expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    });

    it('falls back to default aria-label "Add" when label is empty string', () => {
        render(<ColumnHeader label="" />);
        expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    });

    it('renders the decorative plus sign with aria-hidden="true"', () => {
        const { container } = render(<ColumnHeader label="Pros" />);
        const plusSpan = container.querySelector('button > span');
        expect(plusSpan).toBeInTheDocument();
        expect(plusSpan).toHaveAttribute('aria-hidden', 'true');
        expect(plusSpan).toHaveTextContent('+');
    });

    it('calls onAdd callback when the add button is clicked', () => {
        const onAdd = vi.fn();
        render(<ColumnHeader label="Pros" onAdd={onAdd} disabled={false} />);

        const button = screen.getByRole('button', { name: 'Pros' });
        fireEvent.click(button);

        expect(onAdd).toHaveBeenCalledTimes(1);
    });

    it('does not call onAdd when disabled={true} and clicked', () => {
        const onAdd = vi.fn();
        render(<ColumnHeader label="Pros" onAdd={onAdd} disabled={true} />);

        const button = screen.getByRole('button', { name: 'Pros' });
        expect(button).toBeDisabled();

        fireEvent.click(button);
        expect(onAdd).not.toHaveBeenCalled();
    });

    it('renders safely and does not throw when clicked without onAdd callback', () => {
        render(<ColumnHeader label="Pros" />);
        const button = screen.getByRole('button', { name: 'Pros' });

        expect(() => fireEvent.click(button)).not.toThrow();
    });

    it('renders safely when no props are provided', () => {
        render(<ColumnHeader />);
        const button = screen.getByRole('button', { name: 'Add' });

        expect(button).toBeInTheDocument();
        expect(button).not.toBeDisabled();
        expect(() => fireEvent.click(button)).not.toThrow();
    });

    it('has type="button" to prevent accidental form submission', () => {
        render(<ColumnHeader label="Pros" />);
        const button = screen.getByRole('button', { name: 'Pros' });
        expect(button).toHaveAttribute('type', 'button');
    });

    it('supports custom labels and special characters', () => {
        render(<ColumnHeader label="Arguments (Pro & Con) #1" />);
        expect(screen.getByText('Arguments (Pro & Con) #1')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Arguments (Pro & Con) #1' })).toBeInTheDocument();
    });
});
