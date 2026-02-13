import React from 'react';
import styles from './FAB.module.css';

function ShareIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 5v2h6.59L4 18.59 5.41 20 17 8.41V15h2V5z" />
        </svg>
    );
}

export default function FAB({ onClick, label }) {
    return (
        <button
            className={styles.fab}
            onClick={onClick}
            aria-label={label}
            type="button"
        >
            <ShareIcon />
        </button>
    );
}
