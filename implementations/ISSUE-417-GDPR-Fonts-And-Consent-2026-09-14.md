# Implementation Note: Issue #417 - GDPR Self-Hosted Fonts & Cookie Consent

**Date:** 2026-09-14  
**Issue:** [#417](https://github.com/CI-Till-Krempel/Decide-O-Mat/issues/417)  
**Story Reference:** [US-018: GDPR Compliance](stories/US-018-GDPR-Compliance.md)  
**Author:** Antigravity Agent  

## Context & Problem
In `frontend/index.html`, external Google Fonts (`Alfa Slab One` and `Open Sans`) were loaded directly from Google's CDNs (`fonts.googleapis.com` and `fonts.gstatic.com`) without user consent on page load. Under EU GDPR Art. 6(1) and German case law (LG München 2022), transmitting user IP addresses to third-party Google font servers without prior explicit consent violates data privacy regulations.

Furthermore, US-018 required:
1. Cookie/Consent Banner: A banner informing users and obtaining consent for non-essential storage / trackers.
2. Self-hosting / blocking third-party services: External fonts and services must not leak user data unconditionally.
3. Revocation: The option to revoke or adjust consent preferences at any time.

## Solution & Architecture
1. **Self-Hosted Font Assets:**
   - Installed `@fontsource/alfa-slab-one` and `@fontsource/open-sans` in `frontend/package.json`.
   - Imported required font weights (400, 600) into `frontend/src/main.jsx`, allowing Vite to bundle the WOFF/WOFF2 font assets directly on the same origin.
   - Removed external CDN `<link rel="preconnect">` and Google Fonts stylesheet links from `frontend/index.html`.

2. **GDPR Consent Service (`ConsentService.js`):**
   - Implemented `src/services/ConsentService.js` managing consent state in `localStorage` (`decideomat_cookie_consent`).
   - Categorized storage into strictly necessary (encryption keys, auth sessions) and optional analytics.
   - Provides `getConsent()`, `setConsent()`, `hasConsent()`, `isAnalyticsAllowed()`, `revokeConsent()`, and `openCookiePreferences()`.
   - Dispatches `decideomat_consent_changed` and `decideomat_open_cookie_preferences` custom window events for reactive UI updates.

3. **Cookie Consent Component (`CookieConsent.jsx`):**
   - Renders an accessible, responsive banner fixed at the bottom with dark-theme styling consistent with the design system tokens.
   - Options for "Accept All", "Essential Only", and "Customize" (preferences view with clear category explanations).
   - Links to Privacy Policy (`/legal/privacy`).
   - Re-opens when `openCookiePreferences()` is called.

4. **Consent Revocation / Management in Footer:**
   - Added a "Cookie Settings" button in `frontend/src/components/Footer.jsx` that triggers `openCookiePreferences()`, allowing users to adjust or revoke consent at any time.

5. **Internationalization:**
   - Added complete German (`de.json`) and English (`en.json`) translations for the consent banner and footer button, maintaining 100% key parity.

6. **Verification & Testing:**
   - Added unit test suite `ConsentService.test.js` (5 tests).
   - Added unit test suite `CookieConsent.test.jsx` (7 tests).
   - Updated `Footer.test.jsx` to test the Cookie Settings button and preference trigger.
   - All 20 test files (188 tests) pass.
   - Both linters in `frontend` and `functions` pass.
   - Production bundle builds successfully without third-party font requests.
