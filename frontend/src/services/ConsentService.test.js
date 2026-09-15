import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    getConsent,
    setConsent,
    hasConsent,
    isAnalyticsAllowed,
    revokeConsent,
    CONSENT_CHANGE_EVENT
} from './ConsentService';

describe('ConsentService', () => {
    beforeEach(() => {
        localStorage.clear();
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

    it('handles JSON parse corruption gracefully', () => {
        localStorage.setItem('decideomat_cookie_consent', 'invalid-json');
        expect(getConsent()).toBeNull();
        expect(hasConsent()).toBe(false);
    });
});
