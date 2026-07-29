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

    it('calls onClose after the specified duration', () => {
        const handleClose = vi.fn();
        render(<Toast message="Timed Toast" onClose={handleClose} duration={1000} />);
        
        expect(handleClose).not.toHaveBeenCalled();
        
        act(() => {
            vi.advanceTimersByTime(1000);
        });
        
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('applies success style colors', () => {
        const { container } = render(<Toast message="Success" type="success" onClose={vi.fn()} />);
        const element = container.querySelector('.toast-container');
        expect(element).toHaveStyle({
            backgroundColor: 'var(--color-success)',
            color: 'var(--color-icon-on-primary)'
        });
    });

    it('applies error style colors', () => {
        const { container } = render(<Toast message="Error" type="error" onClose={vi.fn()} />);
        const element = container.querySelector('.toast-container');
        expect(element).toHaveStyle({
            backgroundColor: 'var(--color-danger)',
            color: 'var(--color-bg-base)'
        });
    });

    it('applies info style colors', () => {
        const { container } = render(<Toast message="Info" type="info" onClose={vi.fn()} />);
        const element = container.querySelector('.toast-container');
        expect(element).toHaveStyle({
            backgroundColor: 'var(--color-bg-card)',
            color: 'var(--color-text-on-bg)'
        });
    });
});
