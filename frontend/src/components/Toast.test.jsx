import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import Toast from './Toast';

describe('Toast Component', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders the message and info icon by default', () => {
        const handleClose = vi.fn();
        render(<Toast message="Hello Info" onClose={handleClose} />);

        expect(screen.getByText('Hello Info')).toBeInTheDocument();
        expect(screen.getByText('ℹ️')).toBeInTheDocument();
    });

    it('renders the success icon and message for success type', () => {
        const handleClose = vi.fn();
        render(<Toast message="Success Message" type="success" onClose={handleClose} />);

        expect(screen.getByText('Success Message')).toBeInTheDocument();
        expect(screen.getByText('✅')).toBeInTheDocument();
    });

    it('renders the error icon and message for error type', () => {
        const handleClose = vi.fn();
        render(<Toast message="Error Message" type="error" onClose={handleClose} />);

        expect(screen.getByText('Error Message')).toBeInTheDocument();
        expect(screen.getByText('❌')).toBeInTheDocument();
    });

    it('falls back to info icon for unknown types', () => {
        render(<Toast message="Unknown Type Message" type="warning" />);

        expect(screen.getByText('Unknown Type Message')).toBeInTheDocument();
        expect(screen.getByText('ℹ️')).toBeInTheDocument();
    });

    it('sets role="status" and aria-live="polite" for default/info toasts', () => {
        render(<Toast message="Info Status" />);
        const toast = screen.getByRole('status');

        expect(toast).toBeInTheDocument();
        expect(toast).toHaveAttribute('aria-live', 'polite');
    });

    it('sets role="status" and aria-live="polite" for success toasts', () => {
        render(<Toast message="Action Completed" type="success" />);
        const toast = screen.getByRole('status');

        expect(toast).toBeInTheDocument();
        expect(toast).toHaveAttribute('aria-live', 'polite');
    });

    it('sets role="alert" and aria-live="assertive" for error toasts', () => {
        render(<Toast message="Operation Failed" type="error" />);
        const toast = screen.getByRole('alert');

        expect(toast).toBeInTheDocument();
        expect(toast).toHaveAttribute('aria-live', 'assertive');
    });

    it('hides decorative icon from screen readers via aria-hidden', () => {
        const { container } = render(<Toast message="Hidden icon check" />);
        const iconWrapper = container.querySelector('[aria-hidden="true"]');

        expect(iconWrapper).toBeInTheDocument();
        expect(iconWrapper).toHaveTextContent('ℹ️');
    });

    it('calls onClose after the specified duration', () => {
        const handleClose = vi.fn();
        render(<Toast message="Timed Toast" onClose={handleClose} duration={1500} />);

        expect(handleClose).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(1499);
        });
        expect(handleClose).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(1);
        });
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('clears timer on unmount and does not call onClose', () => {
        const handleClose = vi.fn();
        const { unmount } = render(
            <Toast message="Unmount Toast" onClose={handleClose} duration={2000} />
        );

        unmount();

        act(() => {
            vi.advanceTimersByTime(3000);
        });
        expect(handleClose).not.toHaveBeenCalled();
    });

    it('does not set a timer when duration is 0 or negative', () => {
        const handleClose = vi.fn();
        render(<Toast message="Persistent Toast" onClose={handleClose} duration={0} />);

        act(() => {
            vi.advanceTimersByTime(10000);
        });
        expect(handleClose).not.toHaveBeenCalled();
    });

    it('renders and operates safely without any props provided', () => {
        expect(() => {
            render(<Toast />);
        }).not.toThrow();

        expect(screen.getByRole('status')).toBeInTheDocument();

        // Advance timers to verify default onClose does not throw
        act(() => {
            vi.advanceTimersByTime(3000);
        });
    });

    it('applies success style colors', () => {
        const { container } = render(<Toast message="Success" type="success" />);
        const element = container.querySelector('.toast-container');

        expect(element).toHaveStyle({
            backgroundColor: 'var(--color-success)',
            color: 'var(--color-bg-base)',
        });
    });

    it('applies error style colors', () => {
        const { container } = render(<Toast message="Error" type="error" />);
        const element = container.querySelector('.toast-container');

        expect(element).toHaveStyle({
            backgroundColor: 'var(--color-danger)',
            color: 'var(--color-text-on-bg)',
        });
    });

    it('applies info style colors', () => {
        const { container } = render(<Toast message="Info" type="info" />);
        const element = container.querySelector('.toast-container');

        expect(element).toHaveStyle({
            backgroundColor: 'var(--color-bg-card)',
            color: 'var(--color-text-on-bg)',
        });
    });
});
