import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { copyRichLink } from './ClipboardUtils';

describe('ClipboardUtils', () => {
    let originalClipboard;
    let originalClipboardItem;

    beforeEach(() => {
        // Save originals
        originalClipboard = navigator.clipboard;
        originalClipboardItem = window.ClipboardItem;

        // Mock ClipboardItem and clipboard using a standard constructor function
        window.ClipboardItem = vi.fn().mockImplementation(function (obj) {
            return obj;
        });
        Object.defineProperty(navigator, 'clipboard', {
            value: {
                write: vi.fn().mockResolvedValue(undefined),
                writeText: vi.fn().mockResolvedValue(undefined),
            },
            writable: true,
            configurable: true,
        });
    });

    afterEach(() => {
        // Restore originals
        if (originalClipboard) {
            Object.defineProperty(navigator, 'clipboard', {
                value: originalClipboard,
                writable: true,
                configurable: true,
            });
        }
        if (originalClipboardItem !== undefined) {
            window.ClipboardItem = originalClipboardItem;
        } else {
            delete window.ClipboardItem;
        }
        vi.restoreAllMocks();
    });

    it('successfully copies rich text with both HTML and plain text', async () => {
        const url = 'https://example.com/d/123';
        const title = 'Should we use React?';
        const creator = 'John Doe';

        await copyRichLink(url, title, creator);

        // Verify ClipboardItem was instantiated
        expect(window.ClipboardItem).toHaveBeenCalled();
        const callArg = vi.mocked(window.ClipboardItem).mock.calls[0][0];

        // Retrieve blobs
        const htmlBlob = callArg['text/html'];
        const textBlob = callArg['text/plain'];

        expect(htmlBlob).toBeInstanceOf(Blob);
        expect(textBlob).toBeInstanceOf(Blob);

        // Read blob content
        const htmlText = await htmlBlob.text();
        const plainText = await textBlob.text();

        expect(htmlText).toBe('<a href="https://example.com/d/123">Should we use React? (by John Doe)</a>');
        expect(plainText).toBe('Should we use React? (by John Doe)\nhttps://example.com/d/123');

        // Verify navigator.clipboard.write was called
        expect(navigator.clipboard.write).toHaveBeenCalled();
        expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
    });

    it('works without a creator', async () => {
        const url = 'https://example.com/d/123';
        const title = 'What is the answer?';

        await copyRichLink(url, title, null);

        const callArg = vi.mocked(window.ClipboardItem).mock.calls[0][0];
        const htmlBlob = callArg['text/html'];
        const textBlob = callArg['text/plain'];

        const htmlText = await htmlBlob.text();
        const plainText = await textBlob.text();

        expect(htmlText).toBe('<a href="https://example.com/d/123">What is the answer?</a>');
        expect(plainText).toBe('What is the answer?\nhttps://example.com/d/123');
    });

    it('escapes HTML characters to prevent XSS injection', async () => {
        const url = 'https://example.com/d/123';
        const title = 'React <19> & "Vite" \'App\'';
        const creator = 'Hacker <script>alert(1)</script>';

        await copyRichLink(url, title, creator);

        const callArg = vi.mocked(window.ClipboardItem).mock.calls[0][0];
        const htmlBlob = callArg['text/html'];
        const textBlob = callArg['text/plain'];

        const htmlText = await htmlBlob.text();
        const plainText = await textBlob.text();

        // The HTML version MUST be escaped
        expect(htmlText).toContain('React &lt;19&gt; &amp; &quot;Vite&quot; &#039;App&#039;');
        expect(htmlText).toContain('Hacker &lt;script&gt;alert(1)&lt;/script&gt;');
        expect(htmlText).not.toContain('<script>');

        // The plain text version should remain as-is for user readability
        expect(plainText).toContain('React <19> & "Vite" \'App\'');
        expect(plainText).toContain('Hacker <script>alert(1)</script>');
    });

    it('falls back to basic text copy if ClipboardItem is not supported', async () => {
        // Remove ClipboardItem
        delete window.ClipboardItem;

        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const url = 'https://example.com/d/123';
        await copyRichLink(url, 'Title', 'Creator');

        // Should call fallback writeText
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(url);
        expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('falls back to basic text copy if navigator.clipboard.write throws an error', async () => {
        navigator.clipboard.write = vi.fn().mockRejectedValue(new Error('Write failed'));
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const url = 'https://example.com/d/123';
        await copyRichLink(url, 'Title', 'Creator');

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(url);
        expect(consoleWarnSpy).toHaveBeenCalled();
    });
});
