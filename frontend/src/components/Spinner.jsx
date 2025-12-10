import React from 'react';

const Spinner = ({ size = 'md', color = 'currentColor' }) => {
    const sizeMap = {
        sm: '1rem',
        md: '2rem',
        lg: '4rem'
    };

    const dimension = sizeMap[size] || sizeMap.md;
    const borderThickness = size === 'sm' ? '2px' : size === 'lg' ? '6px' : '4px';

    return (
        <div
            style={{
                display: 'inline-block',
                width: dimension,
                height: dimension,
                border: `${borderThickness} solid rgba(0,0,0,0.1)`,
                borderLeftColor: color,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                verticalAlign: 'middle'
            }}
            role="status"
            aria-label="Loading"
        >
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
            <span style={{
                position: 'absolute',
                width: '1px',
                height: '1px',
                padding: '0',
                margin: '-1px',
                overflow: 'hidden',
                clip: 'rect(0, 0, 0, 0)',
                whiteSpace: 'nowrap',
                border: '0',
            }}>Loading...</span>
        </div>
    );
};

export default Spinner;
