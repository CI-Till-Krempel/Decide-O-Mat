import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import Toast from './Toast';

describe('Toast Component', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders the message text correctly', () => {
        render(<Toast message="Operation succeeded!" />);
        expect(screen.getByText('Operation succeeded!')).toBeInTheDocument();
    });

    it('defaults to info type with role="status" and aria-live="polite"', () => {
        render(<Toast message="Information note" />);
        const toast = screen.getByRole('status');
        expect(toast).toHaveAttribute('aria-live', 'polite');
        expect(toast).toHaveAttribute('aria-atomic', 'true');
        expect(toast).toHaveStyle({ backgroundColor: 'var(--color-text-main)' });
    });

    it('renders with role="status" and aria-live="polite" for success type', () => {
        render(<Toast message="Saved successfully" type="success" />);
        const toast = screen.getByRole('status');
        expect(toast).toHaveAttribute('aria-live', 'polite');
        expect(toast).toHaveAttribute('aria-atomic', 'true');
        expect(toast).toHaveStyle({ backgroundColor: 'var(--color-success)' });
    });

    it('renders with role="alert" and aria-live="assertive" for error type', () => {
        render(<Toast message="Something went wrong" type="error" />);
        const toast = screen.getByRole('alert');
        expect(toast).toHaveAttribute('aria-live', 'assertive');
        expect(toast).toHaveAttribute('aria-atomic', 'true');
        expect(toast).toHaveStyle({ backgroundColor: 'var(--color-danger)' });
    });

    it('hides decorative emoji icons with aria-hidden="true"', () => {
        const { rerender } = render(<Toast message="Success" type="success" />);
        let icon = screen.getByText('✅');
        expect(icon).toHaveAttribute('aria-hidden', 'true');

        rerender(<Toast message="Error" type="error" />);
        icon = screen.getByText('❌');
        expect(icon).toHaveAttribute('aria-hidden', 'true');

        rerender(<Toast message="Info" type="info" />);
        icon = screen.getByText('ℹ️');
        expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('calls onClose after the default duration of 3000ms', () => {
        const onClose = vi.fn();
        render(<Toast message="Auto dismiss" onClose={onClose} />);

        expect(onClose).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(2999);
        });
        expect(onClose).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(1);
        });
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose after a custom duration', () => {
        const onClose = vi.fn();
        render(<Toast message="Quick dismiss" onClose={onClose} duration={1500} />);

        act(() => {
            vi.advanceTimersByTime(1499);
        });
        expect(onClose).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(1);
        });
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not trigger auto-dismiss when duration is 0 or negative', () => {
        const onClose = vi.fn();
        render(<Toast message="Persistent" onClose={onClose} duration={0} />);

        act(() => {
            vi.advanceTimersByTime(10000);
        });
        expect(onClose).not.toHaveBeenCalled();
    });

    it('cleans up the timeout on unmount without invoking onClose', () => {
        const onClose = vi.fn();
        const { unmount } = render(<Toast message="Cancel before close" onClose={onClose} duration={2000} />);

        act(() => {
            vi.advanceTimersByTime(1000);
        });
        expect(onClose).not.toHaveBeenCalled();

        unmount();

        act(() => {
            vi.advanceTimersByTime(2000);
        });
        expect(onClose).not.toHaveBeenCalled();
    });

    it('handles omitted onClose gracefully when timeout elapses', () => {
        expect(() => {
            render(<Toast message="No callback" duration={1000} />);
            act(() => {
                vi.advanceTimersByTime(1000);
            });
        }).not.toThrow();
    });
});
