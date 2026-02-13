import React from 'react';
import styles from './ColumnHeader.module.css';

export default function ColumnHeader({ label, onAdd, disabled }) {
    return (
        <div className={styles.header}>
            <span className={styles.label}>{label}</span>
            <button
                className={styles.addButton}
                onClick={onAdd}
                disabled={disabled}
                aria-label={label}
                type="button"
            >
                +
            </button>
        </div>
    );
}
