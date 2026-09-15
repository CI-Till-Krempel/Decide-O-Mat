import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CookieConsent from './CookieConsent';
import * as ConsentService from '../services/ConsentService';
const { openCookiePreferences } = ConsentService;

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => {
            const translations = {
                'cookieConsent.title': 'Privacy & Cookie Preferences',
                'cookieConsent.description': 'We use cookies and local storage.',
                'cookieConsent.privacyPolicyLink': 'Read our Privacy Policy',
                'cookieConsent.acceptAll': 'Accept All',
                'cookieConsent.essentialOnly': 'Essential Only',
                'cookieConsent.customize': 'Customize',
                'cookieConsent.savePreferences': 'Save Preferences',
                'cookieConsent.essentialCategory': 'Strictly Necessary',
                'cookieConsent.essentialDesc': 'Required for core functionality.',
                'cookieConsent.analyticsCategory': 'Analytics & Performance',
                'cookieConsent.analyticsDesc': 'Helps us understand app usage.',
            };
            return translations[key] || key;
        },
    }),
}));

describe('CookieConsent Component', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    const renderCookieConsent = () => {
        return render(
            <MemoryRouter>
                <CookieConsent />
            </MemoryRouter>
        );
    };

    it('renders banner when no consent choice has been stored', () => {
        renderCookieConsent();
        expect(screen.getByTestId('cookie-consent-banner')).toBeInTheDocument();
        expect(screen.getByText('Privacy & Cookie Preferences')).toBeInTheDocument();
        expect(screen.getByTestId('accept-all-button')).toBeInTheDocument();
        expect(screen.getByTestId('essential-only-button')).toBeInTheDocument();
        expect(screen.getByTestId('customize-button')).toBeInTheDocument();
    });

    it('does not render banner when consent is already set', () => {
        ConsentService.setConsent({ analytics: true });
        renderCookieConsent();
        expect(screen.queryByTestId('cookie-consent-banner')).not.toBeInTheDocument();
    });

    it('saves analytics consent when Accept All is clicked', () => {
        const setConsentSpy = vi.spyOn(ConsentService, 'setConsent');
        renderCookieConsent();

        fireEvent.click(screen.getByTestId('accept-all-button'));

        expect(setConsentSpy).toHaveBeenCalledWith({ analytics: true });
        expect(screen.queryByTestId('cookie-consent-banner')).not.toBeInTheDocument();
    });

    it('saves non-analytics consent when Essential Only is clicked', () => {
        const setConsentSpy = vi.spyOn(ConsentService, 'setConsent');
        renderCookieConsent();

        fireEvent.click(screen.getByTestId('essential-only-button'));

        expect(setConsentSpy).toHaveBeenCalledWith({ analytics: false });
        expect(screen.queryByTestId('cookie-consent-banner')).not.toBeInTheDocument();
    });

    it('opens customize preferences and allows saving selective choices', () => {
        const setConsentSpy = vi.spyOn(ConsentService, 'setConsent');
        renderCookieConsent();

        fireEvent.click(screen.getByTestId('customize-button'));
        expect(screen.getByTestId('cookie-preferences-details')).toBeInTheDocument();

        const checkbox = screen.getByTestId('analytics-checkbox');
        expect(checkbox.checked).toBe(false);

        fireEvent.click(checkbox);
        expect(checkbox.checked).toBe(true);

        fireEvent.click(screen.getByTestId('save-preferences-button'));
        expect(setConsentSpy).toHaveBeenCalledWith({ analytics: true });
        expect(screen.queryByTestId('cookie-consent-banner')).not.toBeInTheDocument();
    });

    it('re-opens preferences banner when openCookiePreferences is called', () => {
        ConsentService.setConsent({ analytics: false });
        renderCookieConsent();
        expect(screen.queryByTestId('cookie-consent-banner')).not.toBeInTheDocument();

        act(() => {
            openCookiePreferences();
        });

        expect(screen.getByTestId('cookie-consent-banner')).toBeInTheDocument();
        expect(screen.getByTestId('cookie-preferences-details')).toBeInTheDocument();
        expect(screen.getByTestId('analytics-checkbox').checked).toBe(false);
    });

    it('closes banner when privacy policy link is clicked', () => {
        renderCookieConsent();
        const link = screen.getByText('Read our Privacy Policy');
        fireEvent.click(link);
        expect(screen.queryByTestId('cookie-consent-banner')).not.toBeInTheDocument();
    });
});
