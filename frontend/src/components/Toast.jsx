import React, { useEffect } from 'react';

const Toast = ({
    message = '',
    type = 'info',
    onClose = () => {},
    duration = 3000,
}) => {
    useEffect(() => {
        if (typeof duration !== 'number' || duration <= 0) {
            return;
        }

        const timer = setTimeout(() => {
            onClose?.();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const isError = type === 'error';
    const isSuccess = type === 'success';

    const bgColor = isError
        ? 'var(--color-danger)'
        : isSuccess
            ? 'var(--color-success)'
            : 'var(--color-bg-card)';

    const textColor = isSuccess
        ? 'var(--color-bg-base)'
        : 'var(--color-text-on-bg)';

    const role = isError ? 'alert' : 'status';
    const ariaLive = isError ? 'assertive' : 'polite';

    return (
        <div
            className="toast-container"
            style={{
                backgroundColor: bgColor,
                color: textColor,
            }}
            role={role}
            aria-live={ariaLive}
        >
            <span aria-hidden="true">
                {isSuccess && '✅'}
                {isError && '❌'}
                {!isSuccess && !isError && 'ℹ️'}
            </span>
            <span>{message}</span>
        </div>
    );
};

export default Toast;
