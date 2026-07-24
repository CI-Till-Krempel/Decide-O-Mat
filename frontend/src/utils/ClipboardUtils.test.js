import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { copyRichLink } from './ClipboardUtils';

describe('ClipboardUtils', () => {
    let clipboardWriteMock;
    let clipboardWriteTextMock;
    let originalClipboard;
    let originalClipboardItem;

    beforeEach(() => {
        // Save originals
        originalClipboard = navigator.clipboard;
        originalClipboardItem = window.ClipboardItem;

        // Mock ClipboardItem constructor using a constructible function
        window.ClipboardItem = vi.fn().mockImplementation(function (obj) {
            this._data = obj;
        });

        clipboardWriteMock = vi.fn().mockResolvedValue(undefined);
        clipboardWriteTextMock = vi.fn().mockResolvedValue(undefined);

        // Define clipboard mock
        Object.defineProperty(navigator, 'clipboard', {
            value: {
                write: clipboardWriteMock,
                writeText: clipboardWriteTextMock,
            },
            writable: true,
            configurable: true,
        });
    });

    afterEach(() => {
        // Restore originals
        window.ClipboardItem = originalClipboardItem;
        Object.defineProperty(navigator, 'clipboard', {
            value: originalClipboard,
            writable: true,
            configurable: true,
        });
        vi.restoreAllMocks();
    });

    it('copies rich link with creator', async () => {
        const url = 'https://decide-o-mat.web.app/d/123';
        const title = 'What to eat for lunch?';
        const creator = 'Alice';

        await copyRichLink(url, title, creator);

        // Verify ClipboardItem instantiation
        expect(window.ClipboardItem).toHaveBeenCalledOnce();
        const constructorArg = window.ClipboardItem.mock.calls[0][0];
        expect(constructorArg).toHaveProperty('text/html');
        expect(constructorArg).toHaveProperty('text/plain');

        // Extract Blobs
        const htmlBlob = constructorArg['text/html'];
        const textBlob = constructorArg['text/plain'];

        expect(htmlBlob).toBeInstanceOf(Blob);
        expect(textBlob).toBeInstanceOf(Blob);

        // Read Blob contents
        const htmlText = await htmlBlob.text();
        const plainText = await textBlob.text();

        expect(htmlText).toBe('<a href="https://decide-o-mat.web.app/d/123">What to eat for lunch? (by Alice)</a>');
        expect(plainText).toBe('What to eat for lunch? (by Alice)\nhttps://decide-o-mat.web.app/d/123');

        // Verify navigator.clipboard.write was called
        expect(clipboardWriteMock).toHaveBeenCalledOnce();
        expect(clipboardWriteMock).toHaveBeenCalledWith([expect.any(Object)]);
        expect(clipboardWriteTextMock).not.toHaveBeenCalled();
    });

    it('copies rich link without creator', async () => {
        const url = 'https://decide-o-mat.web.app/d/123';
        const title = 'What to eat for lunch?';

        await copyRichLink(url, title, null);

        // Extract Blobs
        const constructorArg = window.ClipboardItem.mock.calls[0][0];
        const htmlBlob = constructorArg['text/html'];
        const textBlob = constructorArg['text/plain'];

        // Read Blob contents
        const htmlText = await htmlBlob.text();
        const plainText = await textBlob.text();

        expect(htmlText).toBe('<a href="https://decide-o-mat.web.app/d/123">What to eat for lunch?</a>');
        expect(plainText).toBe('What to eat for lunch?\nhttps://decide-o-mat.web.app/d/123');

        expect(clipboardWriteMock).toHaveBeenCalledOnce();
        expect(clipboardWriteTextMock).not.toHaveBeenCalled();
    });

    it('escapes html characters in title and creator to prevent XSS', async () => {
        const url = 'https://decide-o-mat.web.app/d/123';
        const title = 'Lunch & Dinner <script>alert("XSS")</script>';
        const creator = 'O\'Connor "Chef"';

        await copyRichLink(url, title, creator);

        const constructorArg = window.ClipboardItem.mock.calls[0][0];
        const htmlBlob = constructorArg['text/html'];
        const htmlText = await htmlBlob.text();

        // Check that HTML characters are escaped in HTML part
        expect(htmlText).not.toContain('<script>');
        expect(htmlText).toContain('Lunch &amp; Dinner &lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
        expect(htmlText).toContain('O&#039;Connor &quot;Chef&quot;');

        // Plain text should keep them unescaped
        const textBlob = constructorArg['text/plain'];
        const plainText = await textBlob.text();
        expect(plainText).toContain('Lunch & Dinner <script>alert("XSS")</script>');
        expect(plainText).toContain('O\'Connor "Chef"');
    });

    it('falls back to plain text writeText if write fails', async () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        clipboardWriteMock.mockRejectedValue(new Error('Clipboard write not supported'));

        const url = 'https://decide-o-mat.web.app/d/123';
        const title = 'What to eat for lunch?';

        await copyRichLink(url, title, 'Alice');

        // It should try to write first
        expect(clipboardWriteMock).toHaveBeenCalledOnce();

        // Then fall back to writeText
        expect(clipboardWriteTextMock).toHaveBeenCalledOnce();
        expect(clipboardWriteTextMock).toHaveBeenCalledWith(url);

        expect(consoleWarnSpy).toHaveBeenCalledOnce();
    });
});
