import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    getConsent,
    setConsent,
    hasConsent,
    isAnalyticsAllowed,
    revokeConsent,
    openCookiePreferences,
    CONSENT_CHANGE_EVENT,
    OPEN_COOKIE_PREFERENCES_EVENT,
} from './ConsentService';

describe('ConsentService', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    it('returns null when no consent has been set', () => {
        expect(getConsent()).toBeNull();
        expect(hasConsent()).toBe(false);
        expect(isAnalyticsAllowed()).toBe(false);
    });

    it('stores essential-only consent properly', () => {
        const spyEvent = vi.fn();
        window.addEventListener(CONSENT_CHANGE_EVENT, spyEvent);

        const consent = setConsent({ analytics: false });
        expect(consent.essential).toBe(true);
        expect(consent.analytics).toBe(false);
        expect(consent.decidedAt).toBeDefined();

        expect(hasConsent()).toBe(true);
        expect(isAnalyticsAllowed()).toBe(false);
        expect(getConsent()).toEqual(consent);
        expect(spyEvent).toHaveBeenCalledTimes(1);

        window.removeEventListener(CONSENT_CHANGE_EVENT, spyEvent);
    });

    it('defaults analytics to false when setConsent is called without arguments', () => {
        const consent = setConsent();
        expect(consent.essential).toBe(true);
        expect(consent.analytics).toBe(false);
        expect(hasConsent()).toBe(true);
        expect(isAnalyticsAllowed()).toBe(false);
    });

    it('stores analytics consent when accepted', () => {
        const consent = setConsent({ analytics: true });
        expect(consent.essential).toBe(true);
        expect(consent.analytics).toBe(true);

        expect(hasConsent()).toBe(true);
        expect(isAnalyticsAllowed()).toBe(true);
        expect(getConsent()).toEqual(consent);
    });

    it('revokes consent and removes it from storage', () => {
        setConsent({ analytics: true });
        expect(hasConsent()).toBe(true);

        const spyEvent = vi.fn();
        window.addEventListener(CONSENT_CHANGE_EVENT, spyEvent);

        revokeConsent();
        expect(hasConsent()).toBe(false);
        expect(getConsent()).toBeNull();
        expect(isAnalyticsAllowed()).toBe(false);
        expect(spyEvent).toHaveBeenCalledWith(expect.objectContaining({ detail: null }));

        window.removeEventListener(CONSENT_CHANGE_EVENT, spyEvent);
    });

    it('dispatches OPEN_COOKIE_PREFERENCES_EVENT when openCookiePreferences is called', () => {
        const spyEvent = vi.fn();
        window.addEventListener(OPEN_COOKIE_PREFERENCES_EVENT, spyEvent);

        openCookiePreferences();

        expect(spyEvent).toHaveBeenCalledTimes(1);
        expect(spyEvent.mock.calls[0][0].type).toBe(OPEN_COOKIE_PREFERENCES_EVENT);

        window.removeEventListener(OPEN_COOKIE_PREFERENCES_EVENT, spyEvent);
    });

    it('handles JSON parse corruption gracefully', () => {
        localStorage.setItem('decideomat_cookie_consent', 'invalid-json');
        expect(getConsent()).toBeNull();
        expect(hasConsent()).toBe(false);
        expect(isAnalyticsAllowed()).toBe(false);
    });

    it('handles non-object JSON values in getConsent gracefully', () => {
        const nonObjectValues = ['123', '"plain-string"', 'true', 'false', '["array"]'];
        for (const val of nonObjectValues) {
            localStorage.setItem('decideomat_cookie_consent', val);
            expect(getConsent()).toBeNull();
            expect(hasConsent()).toBe(false);
            expect(isAnalyticsAllowed()).toBe(false);
        }
    });

    it('handles localStorage errors in getConsent gracefully', () => {
        vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
            throw new Error('Storage disabled');
        });
        expect(getConsent()).toBeNull();
        expect(hasConsent()).toBe(false);
    });

    it('handles localStorage errors in setConsent gracefully', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const storageError = new Error('QuotaExceededError');
        vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
            throw storageError;
        });

        const consent = setConsent({ analytics: true });
        expect(consent.analytics).toBe(true);
        expect(consoleSpy).toHaveBeenCalledWith('Failed to save cookie consent to localStorage:', storageError);
    });

    it('handles localStorage errors in revokeConsent gracefully', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const storageError = new Error('Storage error');
        vi.spyOn(localStorage, 'removeItem').mockImplementation(() => {
            throw storageError;
        });

        revokeConsent();
        expect(consoleSpy).toHaveBeenCalledWith('Failed to revoke cookie consent in localStorage:', storageError);
    });
});
