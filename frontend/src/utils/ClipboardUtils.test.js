import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { copyRichLink } from './ClipboardUtils';

describe('ClipboardUtils', () => {
    let originalClipboardWrite;
    let originalClipboardWriteText;
    let originalClipboardItem;
    let originalConsoleWarn;

    beforeEach(() => {
        // Backup
        originalClipboardWrite = navigator.clipboard.write;
        originalClipboardWriteText = navigator.clipboard.writeText;
        originalClipboardItem = window.ClipboardItem;
        originalConsoleWarn = console.warn;

        // Mock console.warn to keep test output clean
        console.warn = vi.fn();
    });

    afterEach(() => {
        // Restore
        if (originalClipboardWrite) {
            navigator.clipboard.write = originalClipboardWrite;
        } else {
            delete navigator.clipboard.write;
        }
        navigator.clipboard.writeText = originalClipboardWriteText;
        window.ClipboardItem = originalClipboardItem;
        console.warn = originalConsoleWarn;
        vi.restoreAllMocks();
    });

    it('successfully copies rich link with a creator', async () => {
        const writeMock = vi.fn().mockResolvedValue(undefined);
        navigator.clipboard.write = writeMock;

        const clipboardItemData = [];
        class MockClipboardItem {
            constructor(data) {
                this.data = data;
                clipboardItemData.push(data);
            }
        }
        window.ClipboardItem = MockClipboardItem;

        await copyRichLink('https://example.com/decide', 'Test Title', 'John Doe');

        expect(writeMock).toHaveBeenCalledTimes(1);
        expect(clipboardItemData).toHaveLength(1);

        const item = clipboardItemData[0];
        expect(item['text/html']).toBeInstanceOf(Blob);
        expect(item['text/plain']).toBeInstanceOf(Blob);

        // Read blob content to verify
        const htmlText = await item['text/html'].text();
        const plainText = await item['text/plain'].text();

        expect(htmlText).toBe('<a href="https://example.com/decide">Test Title (by John Doe)</a>');
        expect(plainText).toBe('Test Title (by John Doe)\nhttps://example.com/decide');
    });

    it('successfully copies rich link without a creator', async () => {
        const writeMock = vi.fn().mockResolvedValue(undefined);
        navigator.clipboard.write = writeMock;

        const clipboardItemData = [];
        class MockClipboardItem {
            constructor(data) {
                this.data = data;
                clipboardItemData.push(data);
            }
        }
        window.ClipboardItem = MockClipboardItem;

        await copyRichLink('https://example.com/decide', 'Test Title', null);

        expect(writeMock).toHaveBeenCalledTimes(1);
        expect(clipboardItemData).toHaveLength(1);

        const item = clipboardItemData[0];
        const htmlText = await item['text/html'].text();
        const plainText = await item['text/plain'].text();

        expect(htmlText).toBe('<a href="https://example.com/decide">Test Title</a>');
        expect(plainText).toBe('Test Title\nhttps://example.com/decide');
    });

    it('escapes unsafe HTML characters to prevent XSS', async () => {
        const writeMock = vi.fn().mockResolvedValue(undefined);
        navigator.clipboard.write = writeMock;

        const clipboardItemData = [];
        class MockClipboardItem {
            constructor(data) {
                this.data = data;
                clipboardItemData.push(data);
            }
        }
        window.ClipboardItem = MockClipboardItem;

        const unsafeTitle = 'Title <script>alert("xss")</script> & more';
        const unsafeCreator = 'Creator & <img src=x onerror=alert(1)>';

        await copyRichLink('https://example.com/decide', unsafeTitle, unsafeCreator);

        expect(writeMock).toHaveBeenCalledTimes(1);
        const htmlText = await clipboardItemData[0]['text/html'].text();
        const plainText = await clipboardItemData[0]['text/plain'].text();

        // HTML version must be escaped
        expect(htmlText).toContain('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
        expect(htmlText).toContain('&amp; more');
        expect(htmlText).toContain('Creator &amp; &lt;img src=x onerror=alert(1)&gt;');
        expect(htmlText).not.toContain('<script>');
        expect(htmlText).not.toContain('<img');

        // Plain text version should be untouched/raw for normal text-based display
        expect(plainText).toContain(unsafeTitle);
        expect(plainText).toContain(unsafeCreator);
    });

    it('falls back to writing plain text URL if ClipboardItem is not supported', async () => {
        window.ClipboardItem = undefined;
        const writeTextMock = vi.fn().mockResolvedValue(undefined);
        navigator.clipboard.writeText = writeTextMock;

        await copyRichLink('https://example.com/decide', 'Test Title', 'John');

        expect(writeTextMock).toHaveBeenCalledWith('https://example.com/decide');
        expect(console.warn).toHaveBeenCalled();
    });

    it('falls back to writing plain text URL if navigator.clipboard.write fails', async () => {
        const writeMock = vi.fn().mockRejectedValue(new Error('Permission Denied'));
        navigator.clipboard.write = writeMock;

        const writeTextMock = vi.fn().mockResolvedValue(undefined);
        navigator.clipboard.writeText = writeTextMock;

        class MockClipboardItem {
            constructor(data) {
                this.data = data;
            }
        }
        window.ClipboardItem = MockClipboardItem;

        await copyRichLink('https://example.com/decide', 'Test Title', 'John');

        expect(writeMock).toHaveBeenCalled();
        expect(writeTextMock).toHaveBeenCalledWith('https://example.com/decide');
        expect(console.warn).toHaveBeenCalled();
    });
});
