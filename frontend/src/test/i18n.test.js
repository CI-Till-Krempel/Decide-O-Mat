import { describe, it, expect, beforeEach } from 'vitest';
import i18n, { updateDocumentLang } from '../i18n';

describe('i18n document lang synchronization', () => {
    beforeEach(() => {
        document.documentElement.lang = 'en';
    });

    it('sets documentElement.lang correctly via updateDocumentLang', () => {
        updateDocumentLang('de');
        expect(document.documentElement.lang).toBe('de');

        updateDocumentLang('en-US');
        expect(document.documentElement.lang).toBe('en');

        updateDocumentLang(null);
        expect(document.documentElement.lang).toBe('en');
    });

    it('updates documentElement.lang on i18n language change', async () => {
        await i18n.changeLanguage('de');
        expect(document.documentElement.lang).toBe('de');

        await i18n.changeLanguage('en');
        expect(document.documentElement.lang).toBe('en');
    });
});
