import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Spinner from './Spinner';

describe('Spinner Component', () => {
    it('renders with default props', () => {
        render(<Spinner />);
        const spinner = screen.getByTestId('spinner');
        expect(spinner).toBeInTheDocument();
        expect(spinner).toHaveAttribute('role', 'status');
        expect(spinner).toHaveAttribute('aria-label', 'Loading');
        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(spinner).toHaveStyle({
            width: '2rem',
            height: '2rem',
        });
        expect(spinner.style.borderLeftColor).toMatch(/currentcolor/i);
    });

    it('renders small size (sm)', () => {
        render(<Spinner size="sm" />);
        const spinner = screen.getByTestId('spinner');
        expect(spinner).toHaveStyle({
            width: '1rem',
            height: '1rem',
        });
    });

    it('renders large size (lg)', () => {
        render(<Spinner size="lg" />);
        const spinner = screen.getByTestId('spinner');
        expect(spinner).toHaveStyle({
            width: '4rem',
            height: '4rem',
        });
    });

    it('falls back to default size (md) when an invalid or null size is provided', () => {
        const { unmount } = render(<Spinner size="invalid" />);
        const invalidSpinner = screen.getByTestId('spinner');
        expect(invalidSpinner).toHaveStyle({
            width: '2rem',
            height: '2rem',
        });
        unmount();

        render(<Spinner size={null} />);
        const nullSpinner = screen.getByTestId('spinner');
        expect(nullSpinner).toHaveStyle({
            width: '2rem',
            height: '2rem',
        });
    });

    it('renders with a custom color', () => {
        render(<Spinner color="rgb(255, 0, 0)" />);
        const spinner = screen.getByTestId('spinner');
        expect(spinner).toHaveStyle({
            borderLeftColor: 'rgb(255, 0, 0)',
        });
    });

    it('falls back to currentColor when color is null or empty', () => {
        render(<Spinner color={null} />);
        const spinner = screen.getByTestId('spinner');
        expect(spinner.style.borderLeftColor).toMatch(/currentcolor/i);
    });

    it('supports custom accessible aria-label and visually hidden label text', () => {
        render(<Spinner ariaLabel="Saving data" label="Saving data..." />);
        const spinner = screen.getByTestId('spinner');
        expect(spinner).toHaveAttribute('aria-label', 'Saving data');
        expect(screen.getByText('Saving data...')).toBeInTheDocument();
    });

    it('applies custom className when provided', () => {
        render(<Spinner className="custom-spinner-class" />);
        const spinner = screen.getByTestId('spinner');
        expect(spinner).toHaveClass('custom-spinner-class');
    });

    it('renders safely when no props are provided', () => {
        render(<Spinner />);
        expect(screen.getByRole('status')).toBeInTheDocument();
    });
});
