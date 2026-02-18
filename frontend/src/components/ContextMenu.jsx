import React, { useEffect, useRef, useCallback } from 'react';
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

    // Auto-focus the first menu item on open
    useEffect(() => {
        const firstItem = menuRef.current?.querySelector('[role="menuitem"]');
        firstItem?.focus();
    }, []);

    const handleKeyDown = useCallback((e) => {
        const menuItems = Array.from(menuRef.current?.querySelectorAll('[role="menuitem"]') || []);
        const currentIndex = menuItems.indexOf(document.activeElement);

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const next = (currentIndex + 1) % menuItems.length;
            menuItems[next]?.focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prev = (currentIndex - 1 + menuItems.length) % menuItems.length;
            menuItems[prev]?.focus();
        }
    }, []);

    return (
        <div
            ref={menuRef}
            className={styles.menu}
            style={{ top: position.top, left: position.left }}
            role="menu"
            onKeyDown={handleKeyDown}
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
                        tabIndex={-1}
                    >
                        {item.label}
                    </button>
                );
            })}
        </div>
    );
}
