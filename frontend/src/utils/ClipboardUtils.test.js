import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { copyRichLink } from './ClipboardUtils';

describe('ClipboardUtils', () => {
    let originalClipboardWrite;
    let originalClipboardWriteText;
    let originalClipboardItem;

    beforeEach(() => {
        originalClipboardWrite = navigator.clipboard.write;
        originalClipboardWriteText = navigator.clipboard.writeText;
        originalClipboardItem = window.ClipboardItem;

        navigator.clipboard.write = vi.fn().mockResolvedValue(undefined);
        navigator.clipboard.writeText = vi.fn().mockResolvedValue(undefined);
        
        class MockClipboardItem {
            constructor(data) {
                this.data = data;
            }
        }
        window.ClipboardItem = MockClipboardItem;
    });

    afterEach(() => {
        navigator.clipboard.write = originalClipboardWrite;
        navigator.clipboard.writeText = originalClipboardWriteText;
        window.ClipboardItem = originalClipboardItem;
        vi.restoreAllMocks();
    });

    it('successfully copies rich link with creator', async () => {
        const url = 'https://decide-o-mat.web.app/d/123';
        const title = 'What should we eat?';
        const creator = 'Bob';

        await copyRichLink(url, title, creator);

        expect(navigator.clipboard.write).toHaveBeenCalledTimes(1);
        const dataArg = navigator.clipboard.write.mock.calls[0][0];
        expect(dataArg).toHaveLength(1);
        
        const clipboardItem = dataArg[0];
        expect(clipboardItem).toBeInstanceOf(window.ClipboardItem);
        
        const htmlBlob = clipboardItem.data['text/html'];
        expect(htmlBlob).toBeInstanceOf(Blob);
        expect(htmlBlob.type).toBe('text/html');
        
        const textBlob = clipboardItem.data['text/plain'];
        expect(textBlob).toBeInstanceOf(Blob);
        expect(textBlob.type).toBe('text/plain');

        const htmlText = await htmlBlob.text();
        expect(htmlText).toBe('<a href="https://decide-o-mat.web.app/d/123">What should we eat? (by Bob)</a>');

        const plainText = await textBlob.text();
        expect(plainText).toBe('What should we eat? (by Bob)\nhttps://decide-o-mat.web.app/d/123');
    });

    it('successfully copies rich link without creator', async () => {
        const url = 'https://decide-o-mat.web.app/d/123';
        const title = 'What should we eat?';
        const creator = null;

        await copyRichLink(url, title, creator);

        expect(navigator.clipboard.write).toHaveBeenCalledTimes(1);
        const dataArg = navigator.clipboard.write.mock.calls[0][0];
        const clipboardItem = dataArg[0];

        const htmlText = await clipboardItem.data['text/html'].text();
        expect(htmlText).toBe('<a href="https://decide-o-mat.web.app/d/123">What should we eat?</a>');

        const plainText = await clipboardItem.data['text/plain'].text();
        expect(plainText).toBe('What should we eat?\nhttps://decide-o-mat.web.app/d/123');
    });

    it('escapes unsafe HTML characters in the title and creator name', async () => {
        const url = 'https://decide-o-mat.web.app/d/123';
        const title = 'Sushi & Burger <script>alert("xss")</script>';
        const creator = 'User "Danger" & \'Co\'';

        await copyRichLink(url, title, creator);

        expect(navigator.clipboard.write).toHaveBeenCalledTimes(1);
        const dataArg = navigator.clipboard.write.mock.calls[0][0];
        const clipboardItem = dataArg[0];

        const htmlText = await clipboardItem.data['text/html'].text();
        expect(htmlText).toContain('Sushi &amp; Burger &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
        expect(htmlText).toContain('User &quot;Danger&quot; &amp; &#039;Co&#039;');
    });

    it('falls back to writing plain URL text when navigator.clipboard.write fails', async () => {
        const url = 'https://decide-o-mat.web.app/d/123';
        const title = 'What should we eat?';
        const creator = 'Bob';

        navigator.clipboard.write.mockRejectedValue(new Error('Permission denied'));

        await copyRichLink(url, title, creator);

        expect(navigator.clipboard.write).toHaveBeenCalledTimes(1);
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(url);
    });

    it('falls back to writing plain URL text when ClipboardItem is not available in the window object', async () => {
        const url = 'https://decide-o-mat.web.app/d/123';
        const title = 'What should we eat?';
        const creator = 'Bob';

        window.ClipboardItem = undefined;

        await copyRichLink(url, title, creator);

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(url);
    });
});
