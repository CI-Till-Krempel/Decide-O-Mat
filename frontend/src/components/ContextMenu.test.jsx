import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ContextMenu from './ContextMenu';

describe('ContextMenu Component', () => {
    let onClose;
    let onClickFirst;
    let onClickSecond;
    const defaultPosition = { top: 120, left: 240 };

    beforeEach(() => {
        onClose = vi.fn();
        onClickFirst = vi.fn();
        onClickSecond = vi.fn();
    });

    it('renders menu container with role="menu" and style positions', () => {
        const items = [
            { label: 'Item 1', onClick: onClickFirst }
        ];

        render(
            <ContextMenu
                items={items}
                position={defaultPosition}
                onClose={onClose}
            />
        );

        const menu = screen.getByRole('menu');
        expect(menu).toBeInTheDocument();
        expect(menu.style.top).toBe('120px');
        expect(menu.style.left).toBe('240px');
    });

    it('renders all menu items with correct labels and role="menuitem"', () => {
        const items = [
            { label: 'First Action', onClick: onClickFirst },
            { label: 'Second Action', onClick: onClickSecond }
        ];

        render(
            <ContextMenu
                items={items}
                position={defaultPosition}
                onClose={onClose}
            />
        );

        const menuItems = screen.getAllByRole('menuitem');
        expect(menuItems).toHaveLength(2);
        expect(menuItems[0]).toHaveTextContent('First Action');
        expect(menuItems[1]).toHaveTextContent('Second Action');
    });

    it('renders separator for items with divider: true', () => {
        const items = [
            { label: 'Edit', onClick: onClickFirst },
            { divider: true },
            { label: 'Delete', onClick: onClickSecond }
        ];

        render(
            <ContextMenu
                items={items}
                position={defaultPosition}
                onClose={onClose}
            />
        );

        expect(screen.getByRole('separator')).toBeInTheDocument();
        expect(screen.getAllByRole('menuitem')).toHaveLength(2);
    });

    it('applies danger class when item.danger is true', () => {
        const items = [
            { label: 'Normal Item', onClick: onClickFirst },
            { label: 'Delete Decision', onClick: onClickSecond, danger: true }
        ];

        render(
            <ContextMenu
                items={items}
                position={defaultPosition}
                onClose={onClose}
            />
        );

        const deleteButton = screen.getByText('Delete Decision');
        expect(deleteButton.className).toMatch(/itemDanger/);

        const normalButton = screen.getByText('Normal Item');
        expect(normalButton.className).not.toMatch(/itemDanger/);
    });

    it('calls item.onClick and onClose when an item is clicked', () => {
        const items = [
            { label: 'Share', onClick: onClickFirst }
        ];

        render(
            <ContextMenu
                items={items}
                position={defaultPosition}
                onClose={onClose}
            />
        );

        fireEvent.click(screen.getByText('Share'));
        expect(onClickFirst).toHaveBeenCalledTimes(1);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('handles item click gracefully when item.onClick is omitted', () => {
        const items = [
            { label: 'Info Only' }
        ];

        render(
            <ContextMenu
                items={items}
                position={defaultPosition}
                onClose={onClose}
            />
        );

        fireEvent.click(screen.getByText('Info Only'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('auto-focuses the first menu item when mounted', () => {
        const items = [
            { label: 'First', onClick: onClickFirst },
            { label: 'Second', onClick: onClickSecond }
        ];

        render(
            <ContextMenu
                items={items}
                position={defaultPosition}
                onClose={onClose}
            />
        );

        const firstButton = screen.getByText('First');
        expect(document.activeElement).toBe(firstButton);
    });

    it('navigates through items with ArrowDown and wraps to start', () => {
        const items = [
            { label: 'Item A', onClick: onClickFirst },
            { label: 'Item B', onClick: onClickSecond }
        ];

        render(
            <ContextMenu
                items={items}
                position={defaultPosition}
                onClose={onClose}
            />
        );

        const menu = screen.getByRole('menu');
        const itemA = screen.getByText('Item A');
        const itemB = screen.getByText('Item B');

        expect(document.activeElement).toBe(itemA);

        fireEvent.keyDown(menu, { key: 'ArrowDown' });
        expect(document.activeElement).toBe(itemB);

        fireEvent.keyDown(menu, { key: 'ArrowDown' });
        expect(document.activeElement).toBe(itemA);
    });

    it('navigates through items with ArrowUp and wraps to end', () => {
        const items = [
            { label: 'Item A', onClick: onClickFirst },
            { label: 'Item B', onClick: onClickSecond }
        ];

        render(
            <ContextMenu
                items={items}
                position={defaultPosition}
                onClose={onClose}
            />
        );

        const menu = screen.getByRole('menu');
        const itemA = screen.getByText('Item A');
        const itemB = screen.getByText('Item B');

        expect(document.activeElement).toBe(itemA);

        fireEvent.keyDown(menu, { key: 'ArrowUp' });
        expect(document.activeElement).toBe(itemB);

        fireEvent.keyDown(menu, { key: 'ArrowUp' });
        expect(document.activeElement).toBe(itemA);
    });

    it('does not error on arrow navigation if there are no menu items', () => {
        const items = [
            { divider: true }
        ];

        render(
            <ContextMenu
                items={items}
                position={defaultPosition}
                onClose={onClose}
            />
        );

        const menu = screen.getByRole('menu');
        expect(() => {
            fireEvent.keyDown(menu, { key: 'ArrowDown' });
            fireEvent.keyDown(menu, { key: 'ArrowUp' });
        }).not.toThrow();
    });

    it('calls onClose when Escape key is pressed', () => {
        const items = [
            { label: 'Option 1', onClick: onClickFirst }
        ];

        render(
            <ContextMenu
                items={items}
                position={defaultPosition}
                onClose={onClose}
            />
        );

        fireEvent.keyDown(document, { key: 'Escape' });
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when clicking outside the menu', () => {
        const items = [
            { label: 'Option 1', onClick: onClickFirst }
        ];

        render(
            <div>
                <button type="button">Outside Button</button>
                <ContextMenu
                    items={items}
                    position={defaultPosition}
                    onClose={onClose}
                />
            </div>
        );

        fireEvent.mouseDown(screen.getByText('Outside Button'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when clicking inside the menu', () => {
        const items = [
            { divider: true }
        ];

        render(
            <ContextMenu
                items={items}
                position={defaultPosition}
                onClose={onClose}
            />
        );

        fireEvent.mouseDown(screen.getByRole('menu'));
        expect(onClose).not.toHaveBeenCalled();
    });

    it('removes event listeners on unmount', () => {
        const items = [
            { label: 'Option', onClick: onClickFirst }
        ];

        const { unmount } = render(
            <ContextMenu
                items={items}
                position={defaultPosition}
                onClose={onClose}
            />
        );

        unmount();

        fireEvent.keyDown(document, { key: 'Escape' });
        fireEvent.mouseDown(document.body);

        expect(onClose).not.toHaveBeenCalled();
    });

    it('renders gracefully without crashing when called with no props (null-safe defaults)', () => {
        expect(() => {
            render(<ContextMenu />);
        }).not.toThrow();

        expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('falls back to index key when item label is missing', () => {
        const items = [
            { onClick: onClickFirst }
        ];

        render(
            <ContextMenu
                items={items}
                position={defaultPosition}
                onClose={onClose}
            />
        );

        const buttons = screen.getAllByRole('menuitem');
        expect(buttons).toHaveLength(1);
    });
});
