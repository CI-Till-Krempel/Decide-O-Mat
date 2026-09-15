const CONSENT_STORAGE_KEY = 'decideomat_cookie_consent';
export const CONSENT_CHANGE_EVENT = 'decideomat_consent_changed';
export const OPEN_COOKIE_PREFERENCES_EVENT = 'decideomat_open_cookie_preferences';

/**
 * Dispatches an event requesting the cookie preferences dialog to be opened.
 */
export function openCookiePreferences() {
    window.dispatchEvent(new CustomEvent(OPEN_COOKIE_PREFERENCES_EVENT));
}

/**
 * @typedef {Object} ConsentState
 * @property {boolean} essential - Always true (strictly necessary)
 * @property {boolean} analytics - Whether analytics/performance cookies are consented to
 * @property {string} decidedAt - ISO timestamp of when the decision was made
 */

/**
 * Retrieves the current stored cookie consent state.
 * @returns {ConsentState|null} The consent state or null if not yet decided.
 */
export function getConsent() {
    try {
        const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

/**
 * Saves cookie consent preferences to localStorage and dispatches an update event.
 * @param {Object} options
 * @param {boolean} options.analytics - Whether analytics is accepted
 * @returns {ConsentState} The saved consent object
 */
export function setConsent({ analytics = false }) {
    const consent = {
        essential: true,
        analytics: Boolean(analytics),
        decidedAt: new Date().toISOString(),
    };
    try {
        localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
        window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: consent }));
    } catch (err) {
        console.warn('Failed to save cookie consent to localStorage:', err);
    }
    return consent;
}

/**
 * Checks whether the user has made an explicit consent choice.
 * @returns {boolean}
 */
export function hasConsent() {
    return getConsent() !== null;
}

/**
 * Checks whether analytics consent is granted.
 * @returns {boolean}
 */
export function isAnalyticsAllowed() {
    const consent = getConsent();
    return Boolean(consent?.analytics);
}

/**
 * Revokes / resets cookie consent preferences.
 */
export function revokeConsent() {
    try {
        localStorage.removeItem(CONSENT_STORAGE_KEY);
        window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: null }));
    } catch (err) {
        console.warn('Failed to revoke cookie consent in localStorage:', err);
    }
}
