import React, { useEffect } from 'react';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const bgColor = type === 'error' ? 'var(--color-danger)' :
        type === 'success' ? 'var(--color-success)' :
            'var(--color-bg-card)';

    const textColor = type === 'success' ? 'var(--color-icon-on-primary)' :
        type === 'error' ? 'var(--color-bg-base)' :
            'var(--color-text-on-bg)';

    return (
        <div 
            className="toast-container" 
            style={{ 
                backgroundColor: bgColor,
                color: textColor
            }}
        >
            {type === 'success' && '✅'}
            {type === 'error' && '❌'}
            {type === 'info' && 'ℹ️'}
            <span>{message}</span>
        </div>
    );
};

export default Toast;
