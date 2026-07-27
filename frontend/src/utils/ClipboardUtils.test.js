import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { copyRichLink } from './ClipboardUtils';

describe('ClipboardUtils - copyRichLink', () => {
    let originalClipboardItem;
    let originalWrite;
    let originalWriteText;

    beforeEach(() => {
        originalClipboardItem = globalThis.ClipboardItem;
        originalWrite = navigator.clipboard.write;
        originalWriteText = navigator.clipboard.writeText;

        // Mock ClipboardItem
        globalThis.ClipboardItem = class ClipboardItem {
            constructor(data) {
                this.data = data;
            }
        };

        // Mock navigator.clipboard methods
        navigator.clipboard.write = vi.fn().mockResolvedValue(undefined);
        navigator.clipboard.writeText = vi.fn().mockResolvedValue(undefined);
    });

    afterEach(() => {
        globalThis.ClipboardItem = originalClipboardItem;
        navigator.clipboard.write = originalWrite;
        navigator.clipboard.writeText = originalWriteText;
        vi.restoreAllMocks();
    });

    it('successfully copies rich link with creator', async () => {
        const url = 'https://decide.example.com/123';
        const title = 'What to eat?';
        const creator = 'Alice';

        await copyRichLink(url, title, creator);

        expect(navigator.clipboard.write).toHaveBeenCalledTimes(1);
        const writeCallArgs = navigator.clipboard.write.mock.calls[0][0];
        expect(writeCallArgs).toBeInstanceOf(Array);
        expect(writeCallArgs.length).toBe(1);
        expect(writeCallArgs[0]).toBeInstanceOf(globalThis.ClipboardItem);

        const clipboardData = writeCallArgs[0].data;
        expect(clipboardData['text/html']).toBeDefined();
        expect(clipboardData['text/plain']).toBeDefined();

        const textContent = await clipboardData['text/plain'].text();
        const htmlContent = await clipboardData['text/html'].text();

        expect(textContent).toBe('What to eat? (by Alice)\nhttps://decide.example.com/123');
        expect(htmlContent).toBe('<a href="https://decide.example.com/123">What to eat? (by Alice)</a>');
    });

    it('successfully copies rich link without creator', async () => {
        const url = 'https://decide.example.com/123';
        const title = 'What to eat?';
        const creator = null;

        await copyRichLink(url, title, creator);

        expect(navigator.clipboard.write).toHaveBeenCalledTimes(1);
        const writeCallArgs = navigator.clipboard.write.mock.calls[0][0];
        const clipboardData = writeCallArgs[0].data;

        const textContent = await clipboardData['text/plain'].text();
        const htmlContent = await clipboardData['text/html'].text();

        expect(textContent).toBe('What to eat?\nhttps://decide.example.com/123');
        expect(htmlContent).toBe('<a href="https://decide.example.com/123">What to eat?</a>');
    });

    it('escapes HTML special characters in title and creator to prevent XSS', async () => {
        const url = 'https://decide.example.com/123';
        const title = '<script>alert("XSS")</script> & "Cookies"';
        const creator = 'Bob <bob@example.com>';

        await copyRichLink(url, title, creator);

        expect(navigator.clipboard.write).toHaveBeenCalledTimes(1);
        const writeCallArgs = navigator.clipboard.write.mock.calls[0][0];
        const clipboardData = writeCallArgs[0].data;

        const htmlContent = await clipboardData['text/html'].text();

        expect(htmlContent).toContain('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt; &amp; &quot;Cookies&quot;');
        expect(htmlContent).toContain('Bob &lt;bob@example.com&gt;');
        expect(htmlContent).toBe('<a href="https://decide.example.com/123">&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt; &amp; &quot;Cookies&quot; (by Bob &lt;bob@example.com&gt;)</a>');
    });

    it('falls back to copyText on failure', async () => {
        navigator.clipboard.write.mockRejectedValue(new Error('Rich text copy not supported'));
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const url = 'https://decide.example.com/123';
        await copyRichLink(url, 'title', 'creator');

        expect(navigator.clipboard.write).toHaveBeenCalledTimes(1);
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(url);
        expect(consoleWarnSpy).toHaveBeenCalled();
    });
});
