import React, { useEffect } from 'react';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
    useEffect(() => {
        if (duration <= 0 || typeof onClose !== 'function') {
            return;
        }

        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const isError = type === 'error';
    const bgColor = isError
        ? 'var(--color-danger)'
        : type === 'success'
            ? 'var(--color-success)'
            : 'var(--color-text-main)';

    return (
        <div
            className="toast-container"
            style={{ backgroundColor: bgColor }}
            role={isError ? 'alert' : 'status'}
            aria-live={isError ? 'assertive' : 'polite'}
            aria-atomic="true"
        >
            {type === 'success' && <span aria-hidden="true">✅</span>}
            {type === 'error' && <span aria-hidden="true">❌</span>}
            {type === 'info' && <span aria-hidden="true">ℹ️</span>}
            <span>{message}</span>
        </div>
    );
};

export default Toast;
