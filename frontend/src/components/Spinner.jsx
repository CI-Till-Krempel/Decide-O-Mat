import React from 'react';

const Spinner = ({
    size = 'md',
    color = 'currentColor',
    label = 'Loading...',
    ariaLabel = 'Loading',
    className = '',
}) => {
    const sizeMap = {
        sm: '1rem',
        md: '2rem',
        lg: '4rem',
    };

    const effectiveSize = size && sizeMap[size] ? size : 'md';
    const dimension = sizeMap[effectiveSize];
    const borderThickness = effectiveSize === 'sm' ? '2px' : effectiveSize === 'lg' ? '6px' : '4px';
    const effectiveColor = color || 'currentColor';
    const effectiveAriaLabel = ariaLabel || 'Loading';
    const effectiveLabel = label || 'Loading...';

    return (
        <div
            className={className || undefined}
            style={{
                display: 'inline-block',
                width: dimension,
                height: dimension,
                border: `${borderThickness} solid rgba(0,0,0,0.1)`,
                borderLeftColor: effectiveColor,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                verticalAlign: 'middle',
            }}
            role="status"
            aria-label={effectiveAriaLabel}
            data-testid="spinner"
        >
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
            <span
                style={{
                    position: 'absolute',
                    width: '1px',
                    height: '1px',
                    padding: '0',
                    margin: '-1px',
                    overflow: 'hidden',
                    clip: 'rect(0, 0, 0, 0)',
                    whiteSpace: 'nowrap',
                    border: '0',
                }}
            >
                {effectiveLabel}
            </span>
        </div>
    );
};

export default Spinner;
