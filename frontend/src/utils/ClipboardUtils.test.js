import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { escapeHtml, copyRichLink } from './ClipboardUtils';

describe('ClipboardUtils', () => {
    let originalClipboard;
    let originalClipboardItem;
    let originalConsoleWarn;

    beforeEach(() => {
        originalClipboard = navigator.clipboard;
        originalClipboardItem = window.ClipboardItem;
        originalConsoleWarn = console.warn;
        console.warn = vi.fn();
    });

    afterEach(() => {
        Object.defineProperty(navigator, 'clipboard', {
            value: originalClipboard,
            configurable: true,
            writable: true
        });
        window.ClipboardItem = originalClipboardItem;
        console.warn = originalConsoleWarn;
    });

    describe('escapeHtml', () => {
        it('returns empty string for falsy values', () => {
            expect(escapeHtml(null)).toBe('');
            expect(escapeHtml(undefined)).toBe('');
            expect(escapeHtml('')).toBe('');
        });

        it('escapes HTML special characters', () => {
            expect(escapeHtml('Hello & <World> " \'')).toBe('Hello &amp; &lt;World&gt; &quot; &#039;');
        });

        it('coerces non-string types to string and escapes them', () => {
            expect(escapeHtml(123)).toBe('123');
            expect(escapeHtml(true)).toBe('true');
        });
    });

    describe('copyRichLink', () => {
        it('successfully copies rich link when ClipboardItem and write exist', async () => {
            const mockWrite = vi.fn().mockResolvedValue(undefined);
            const mockClipboardItem = vi.fn().mockImplementation(function(obj) {
                this.data = obj;
            });

            Object.defineProperty(navigator, 'clipboard', {
                value: { write: mockWrite, writeText: vi.fn() },
                configurable: true,
                writable: true
            });
            window.ClipboardItem = mockClipboardItem;

            await copyRichLink('https://example.com', 'My Title', 'Creator Name');

            expect(mockClipboardItem).toHaveBeenCalled();
            expect(mockWrite).toHaveBeenCalled();
            expect(console.warn).not.toHaveBeenCalled();
        });

        it('falls back to writeText when ClipboardItem is not supported', async () => {
            const mockWriteText = vi.fn().mockResolvedValue(undefined);

            Object.defineProperty(navigator, 'clipboard', {
                value: { writeText: mockWriteText },
                configurable: true,
                writable: true
            });
            window.ClipboardItem = undefined;

            await copyRichLink('https://example.com', 'My Title', 'Creator Name');

            expect(mockWriteText).toHaveBeenCalledWith('https://example.com');
            expect(console.warn).toHaveBeenCalled();
        });

        it('falls back to writeText when write throws an error', async () => {
            const mockWrite = vi.fn().mockRejectedValue(new Error('Clipboard write failed'));
            const mockWriteText = vi.fn().mockResolvedValue(undefined);
            const mockClipboardItem = vi.fn().mockImplementation(function(obj) {
                this.data = obj;
            });

            Object.defineProperty(navigator, 'clipboard', {
                value: { write: mockWrite, writeText: mockWriteText },
                configurable: true,
                writable: true
            });
            window.ClipboardItem = mockClipboardItem;

            await copyRichLink('https://example.com', 'My Title', 'Creator Name');

            expect(mockWriteText).toHaveBeenCalledWith('https://example.com');
            expect(console.warn).toHaveBeenCalled();
        });

        it('handles null/undefined title and creator correctly in rich copy', async () => {
            const mockWrite = vi.fn().mockResolvedValue(undefined);
            let createdItem = null;
            const mockClipboardItem = vi.fn().mockImplementation(function(obj) {
                createdItem = obj;
                this.data = obj;
            });

            Object.defineProperty(navigator, 'clipboard', {
                value: { write: mockWrite, writeText: vi.fn() },
                configurable: true,
                writable: true
            });
            window.ClipboardItem = mockClipboardItem;

            await copyRichLink('https://example.com', null, null);

            expect(mockClipboardItem).toHaveBeenCalled();
            expect(mockWrite).toHaveBeenCalled();
            expect(createdItem).not.toBeNull();
        });
    });
});
