import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { copyRichLink } from './ClipboardUtils';

describe('copyRichLink', () => {
    let originalClipboard;
    let originalClipboardItem;
    let mockWrite;
    let mockWriteText;
    let mockConsoleWarn;

    beforeEach(() => {
        // Save originals
        originalClipboard = navigator.clipboard;
        originalClipboardItem = window.ClipboardItem;

        // Create mocks
        mockWrite = vi.fn().mockResolvedValue(undefined);
        mockWriteText = vi.fn().mockResolvedValue(undefined);
        
        // Define navigator.clipboard
        Object.defineProperty(navigator, 'clipboard', {
            value: {
                write: mockWrite,
                writeText: mockWriteText
            },
            configurable: true,
            writable: true
        });

        // Mock ClipboardItem
        window.ClipboardItem = class ClipboardItem {
            constructor(data) {
                this.data = data;
            }
        };

        mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        // Restore originals
        if (originalClipboard === undefined) {
            delete navigator.clipboard;
        } else {
            Object.defineProperty(navigator, 'clipboard', {
                value: originalClipboard,
                configurable: true,
                writable: true
            });
        }
        window.ClipboardItem = originalClipboardItem;
        vi.restoreAllMocks();
    });

    it('successfully copies a rich link with a creator', async () => {
        const url = 'https://decide-o-mat.web.app/d/123';
        const title = 'What to eat?';
        const creator = 'Alice';

        await copyRichLink(url, title, creator);

        expect(mockWrite).toHaveBeenCalledTimes(1);
        const writtenData = mockWrite.mock.calls[0][0];
        expect(writtenData).toBeInstanceOf(Array);
        expect(writtenData.length).toBe(1);

        const clipboardItem = writtenData[0];
        expect(clipboardItem).toBeInstanceOf(window.ClipboardItem);

        // Verify HTML content in Blob
        const htmlBlob = clipboardItem.data['text/html'];
        expect(htmlBlob).toBeInstanceOf(Blob);
        expect(htmlBlob.type).toBe('text/html');
        
        const htmlText = await htmlBlob.text();
        expect(htmlText).toBe('<a href="https://decide-o-mat.web.app/d/123">What to eat? (by Alice)</a>');

        // Verify Text content in Blob
        const plainBlob = clipboardItem.data['text/plain'];
        expect(plainBlob).toBeInstanceOf(Blob);
        expect(plainBlob.type).toBe('text/plain');
        const plainText = await plainBlob.text();
        expect(plainText).toBe('What to eat? (by Alice)\nhttps://decide-o-mat.web.app/d/123');

        expect(mockWriteText).not.toHaveBeenCalled();
    });

    it('successfully copies a rich link without a creator', async () => {
        const url = 'https://decide-o-mat.web.app/d/123';
        const title = 'What to eat?';
        const creator = null;

        await copyRichLink(url, title, creator);

        expect(mockWrite).toHaveBeenCalledTimes(1);
        const clipboardItem = mockWrite.mock.calls[0][0][0];

        const htmlText = await clipboardItem.data['text/html'].text();
        expect(htmlText).toBe('<a href="https://decide-o-mat.web.app/d/123">What to eat?</a>');

        const plainText = await clipboardItem.data['text/plain'].text();
        expect(plainText).toBe('What to eat?\nhttps://decide-o-mat.web.app/d/123');
    });

    it('escapes HTML special characters to prevent XSS vulnerabilities', async () => {
        const url = 'https://decide-o-mat.web.app/d/123';
        const title = 'Vote & Choose <Best> "Pizza"\'s';
        const creator = 'Eve <script>alert(1)</script>';

        await copyRichLink(url, title, creator);

        expect(mockWrite).toHaveBeenCalledTimes(1);
        const clipboardItem = mockWrite.mock.calls[0][0][0];

        const htmlText = await clipboardItem.data['text/html'].text();
        expect(htmlText).toContain('Vote &amp; Choose &lt;Best&gt; &quot;Pizza&quot;&#039;s');
        expect(htmlText).toContain('(by Eve &lt;script&gt;alert(1)&lt;/script&gt;)');
        expect(htmlText).not.toContain('<script>');
    });

    it('falls back to plain text copy if write fails', async () => {
        mockWrite.mockRejectedValue(new Error('Clipboard write permission denied'));
        const url = 'https://decide-o-mat.web.app/d/123';

        await copyRichLink(url, 'Title', null);

        expect(mockWrite).toHaveBeenCalledTimes(1);
        expect(mockConsoleWarn).toHaveBeenCalledTimes(1);
        expect(mockWriteText).toHaveBeenCalledWith(url);
    });
});
