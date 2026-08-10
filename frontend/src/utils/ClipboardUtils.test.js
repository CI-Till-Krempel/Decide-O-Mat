import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { copyRichLink } from './ClipboardUtils';

describe('ClipboardUtils', () => {
    let originalClipboard;
    let originalClipboardItem;
    let mockWrite;
    let mockWriteText;
    let consoleWarnSpy;

    beforeEach(() => {
        // Save originals
        originalClipboard = navigator.clipboard;
        originalClipboardItem = window.ClipboardItem;

        // Create mocks
        mockWrite = vi.fn().mockResolvedValue(undefined);
        mockWriteText = vi.fn().mockResolvedValue(undefined);
        
        // Mock navigator.clipboard
        Object.defineProperty(navigator, 'clipboard', {
            value: {
                write: mockWrite,
                writeText: mockWriteText
            },
            writable: true,
            configurable: true
        });

        // Mock window.ClipboardItem
        window.ClipboardItem = class ClipboardItem {
            constructor(data) {
                this.data = data;
            }
        };

        // Spy on console.warn to keep test output clean
        consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        // Restore originals
        if (originalClipboard === undefined) {
            delete navigator.clipboard;
        } else {
            Object.defineProperty(navigator, 'clipboard', {
                value: originalClipboard,
                writable: true,
                configurable: true
            });
        }
        window.ClipboardItem = originalClipboardItem;
        consoleWarnSpy.mockRestore();
        vi.restoreAllMocks();
    });

    it('copies rich link with creator', async () => {
        const url = 'https://decide.example.com/123';
        const title = 'What to eat?';
        const creator = 'Chef G';

        await copyRichLink(url, title, creator);

        // Verify write was called with the ClipboardItem
        expect(mockWrite).toHaveBeenCalledTimes(1);
        const writtenData = mockWrite.mock.calls[0][0];
        expect(writtenData).toBeInstanceOf(Array);
        expect(writtenData[0]).toBeInstanceOf(window.ClipboardItem);
        expect(writtenData[0].data['text/html']).toBeInstanceOf(Blob);
        expect(writtenData[0].data['text/plain']).toBeInstanceOf(Blob);

        // Verify console.warn was not called
        expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('copies rich link without creator', async () => {
        const url = 'https://decide.example.com/123';
        const title = 'What to eat?';

        await copyRichLink(url, title, null);

        expect(mockWrite).toHaveBeenCalledTimes(1);
        const writtenData = mockWrite.mock.calls[0][0];
        expect(writtenData[0]).toBeInstanceOf(window.ClipboardItem);
    });

    it('escapes special characters to prevent HTML injection (XSS)', async () => {
        const url = 'https://decide.example.com/123';
        const title = '<script>alert("xss")</script> & "cool"';
        const creator = 'User <Danger>';

        await copyRichLink(url, title, creator);

        expect(mockWrite).toHaveBeenCalledTimes(1);
        const writtenData = mockWrite.mock.calls[0][0];
        const htmlBlob = writtenData[0].data['text/html'];
        
        // Convert Blob to text to check content
        const text = await htmlBlob.text();
        expect(text).not.toContain('<script>');
        expect(text).toContain('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; &amp; &quot;cool&quot;');
        expect(text).toContain('User &lt;Danger&gt;');
    });

    it('falls back to plain text writeText when rich clipboard copy fails', async () => {
        const url = 'https://decide.example.com/123';
        const title = 'What to eat?';
        
        // Make write throw an error
        mockWrite.mockRejectedValue(new Error('Clipboard write not supported'));

        await copyRichLink(url, title, null);

        // Verify fallback was attempted
        expect(mockWrite).toHaveBeenCalledTimes(1);
        expect(mockWriteText).toHaveBeenCalledWith(url);
        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        expect(consoleWarnSpy.mock.calls[0][0]).toMatch(/Rich text copy failed/);
    });

    it('falls back to plain text writeText when window.ClipboardItem is missing', async () => {
        const url = 'https://decide.example.com/123';
        const title = 'What to eat?';
        
        // Remove ClipboardItem
        window.ClipboardItem = undefined;

        await copyRichLink(url, title, null);

        expect(mockWriteText).toHaveBeenCalledWith(url);
        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    });
});
