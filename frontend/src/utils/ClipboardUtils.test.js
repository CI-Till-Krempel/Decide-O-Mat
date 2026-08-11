import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { copyRichLink } from './ClipboardUtils';

describe('ClipboardUtils', () => {
    let writtenData = null;

    beforeEach(() => {
        writtenData = null;

        // Mock ClipboardItem
        vi.stubGlobal('ClipboardItem', class ClipboardItem {
            constructor(data) {
                this.data = data;
            }
        });

        // Mock navigator.clipboard
        vi.stubGlobal('navigator', {
            clipboard: {
                write: vi.fn().mockImplementation((data) => {
                    writtenData = data;
                    return Promise.resolve();
                }),
                writeText: vi.fn().mockReturnValue(Promise.resolve())
            }
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('copies rich link with creator', async () => {
        await copyRichLink('https://example.com', 'My Decision', 'Alice');

        expect(navigator.clipboard.write).toHaveBeenCalled();
        expect(writtenData).toBeDefined();
        
        const clipboardItem = writtenData[0];
        expect(clipboardItem).toBeDefined();
        expect(clipboardItem.data['text/html']).toBeDefined();
        expect(clipboardItem.data['text/plain']).toBeDefined();
    });

    it('copies rich link without creator', async () => {
        await copyRichLink('https://example.com', 'My Decision', null);

        expect(navigator.clipboard.write).toHaveBeenCalled();
        expect(writtenData).toBeDefined();
    });

    it('escapes special HTML characters to prevent XSS', async () => {
        // Mock Blob to inspect passed values
        const originalBlob = globalThis.Blob;
        const blobsCreated = [];
        
        vi.stubGlobal('Blob', class Blob {
            constructor(contentArray, options) {
                this.content = contentArray[0];
                this.options = options;
                blobsCreated.push(this);
            }
        });

        await copyRichLink(
            'https://example.com?a="b"&c=<d>',
            'Decision <Q>',
            'Alice "The Coder"'
        );

        vi.stubGlobal('Blob', originalBlob);

        // Find the html blob
        const htmlBlob = blobsCreated.find(b => b.options.type === 'text/html');
        expect(htmlBlob).toBeDefined();
        
        // Assert that unescaped characters do not exist in HTML href or content
        expect(htmlBlob.content).not.toContain('"https://example.com?a="b"&c=<d>"');
        expect(htmlBlob.content).not.toContain('<Q>');
        expect(htmlBlob.content).not.toContain('"The Coder"');

        // Check for proper escaping
        expect(htmlBlob.content).toContain('href="https://example.com?a=&quot;b&quot;&amp;c=&lt;d&gt;"');
        expect(htmlBlob.content).toContain('Decision &lt;Q&gt;');
        expect(htmlBlob.content).toContain('Alice &quot;The Coder&quot;');
    });

    it('falls back to plain text copy if write fails', async () => {
        navigator.clipboard.write.mockRejectedValue(new Error('Clipboard write failed'));

        await copyRichLink('https://example.com', 'My Decision', 'Alice');

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com');
    });

    it('falls back to plain text copy if ClipboardItem is not supported', async () => {
        vi.stubGlobal('ClipboardItem', undefined);

        await copyRichLink('https://example.com', 'My Decision', 'Alice');

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com');
    });
});
