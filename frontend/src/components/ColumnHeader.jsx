import React from 'react';
import styles from './ColumnHeader.module.css';

export default function ColumnHeader({
    label = '',
    onAdd = () => {},
    disabled = false,
}) {
    const handleAdd = () => {
        if (!disabled) {
            onAdd?.();
        }
    };

    return (
        <div className={styles.header}>
            <span className={styles.label}>{label}</span>
            <button
                className={styles.addButton}
                onClick={handleAdd}
                disabled={disabled}
                aria-label={label || 'Add'}
                type="button"
                data-testid="column-header-add-button"
            >
                <span aria-hidden="true">+</span>
            </button>
        </div>
    );
}
