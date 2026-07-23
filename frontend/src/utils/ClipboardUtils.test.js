import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { copyRichLink } from './ClipboardUtils';

describe('ClipboardUtils', () => {
    let originalClipboard;
    let originalClipboardItem;

    beforeEach(() => {
        originalClipboard = navigator.clipboard;
        originalClipboardItem = window.ClipboardItem;
        window.ClipboardItem = vi.fn().mockImplementation(class { constructor(obj) { Object.assign(this, obj); } });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        if (originalClipboard === undefined) {
            delete navigator.clipboard;
        } else {
            Object.defineProperty(navigator, 'clipboard', {
                value: originalClipboard,
                writable: true,
                configurable: true,
            });
        }
        if (originalClipboardItem === undefined) {
            delete window.ClipboardItem;
        } else {
            window.ClipboardItem = originalClipboardItem;
        }
    });

    it('successfully copies rich and plain text when ClipboardItem is supported', async () => {
        const mockWrite = vi.fn().mockResolvedValue(undefined);
        const mockWriteText = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, 'clipboard', {
            value: {
                write: mockWrite,
                writeText: mockWriteText,
            },
            writable: true,
            configurable: true,
        });
        await copyRichLink('https://decide-o-mat.com/d/123', 'My Question', 'Bob');
        expect(window.ClipboardItem).toHaveBeenCalled();
        expect(mockWrite).toHaveBeenCalled();
        expect(mockWriteText).not.toHaveBeenCalled();
    });

    it('falls back to plain text URL copy when ClipboardItem is not supported', async () => {
        delete window.ClipboardItem;
        const mockWriteText = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, 'clipboard', {
            value: {
                writeText: mockWriteText,
            },
            writable: true,
            configurable: true,
        });
        await copyRichLink('https://decide-o-mat.com/d/123', 'My Question', 'Bob');
        expect(mockWriteText).toHaveBeenCalledWith('https://decide-o-mat.com/d/123');
    });

    it('falls back to plain text URL copy when write throws an error', async () => {
        const mockWrite = vi.fn().mockRejectedValue(new Error('Write blocked'));
        const mockWriteText = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, 'clipboard', {
            value: {
                write: mockWrite,
                writeText: mockWriteText,
            },
            writable: true,
            configurable: true,
        });
        await copyRichLink('https://decide-o-mat.com/d/123', 'My Question', null);
        expect(mockWrite).toHaveBeenCalled();
        expect(mockWriteText).toHaveBeenCalledWith('https://decide-o-mat.com/d/123');
    });

    it('throws error if even fallback writeText fails', async () => {
        delete window.ClipboardItem;
        const mockWriteText = vi.fn().mockRejectedValue(new Error('Clipboard blocked'));
        Object.defineProperty(navigator, 'clipboard', {
            value: {
                writeText: mockWriteText,
            },
            writable: true,
            configurable: true,
        });
        await expect(copyRichLink('https://decide-o-mat.com/d/123', 'My Question', null))
            .rejects.toThrow('Clipboard blocked');
    });
});