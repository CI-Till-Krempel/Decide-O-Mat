import React from 'react';

const LockIcon = ({ isOpen, color = 'currentColor', size = 16 }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ display: 'inline-block', verticalAlign: 'middle', transition: 'all 0.3s ease' }}
            data-testid={isOpen ? "lock-open" : "lock-closed"}
        >
            <path d={isOpen ? "M7 11V7a5 5 0 0 1 10 0" : "M7 11V7a5 5 0 0 1 10 0v4"} transform={isOpen ? "rotate(90 7 11)" : ""} />
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        </svg>
    );
};

export default LockIcon;
