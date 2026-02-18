import React, { useEffect, useRef } from 'react';
import styles from './ContextMenu.module.css';

export default function ContextMenu({ items, position, onClose }) {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

    return (
        <div
            ref={menuRef}
            className={styles.menu}
            style={{ top: position.top, left: position.left }}
            role="menu"
        >
            {items.map((item, i) => {
                if (item.divider) {
                    return <div key={`divider-${i}`} className={styles.divider} role="separator" />;
                }
                return (
                    <button
                        key={item.label}
                        className={`${styles.item} ${item.danger ? styles.itemDanger : ''}`}
                        onClick={() => { item.onClick(); onClose(); }}
                        role="menuitem"
                        type="button"
                    >
                        {item.label}
                    </button>
                );
            })}
        </div>
    );
}
