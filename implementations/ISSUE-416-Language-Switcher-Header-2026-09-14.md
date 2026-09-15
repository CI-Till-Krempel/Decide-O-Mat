# Implementation Note: Issue #416 - Language Switcher in Header

**Date:** 2026-09-14  
**Issue:** [#416](https://github.com/CI-Till-Krempel/Decide-O-Mat/issues/416)  
**Author:** Antigravity Agent  

## Context & Problem
The application includes full internationalization support (`i18next` with `en.json` and `de.json` resource files and browser language detection via `LanguageDetector`), but had no visual UI control or toggle for users to manually switch languages between English and German. Users whose browser locale defaults to English were unable to switch to German, and vice versa.

## Solution & Architecture
1. **Header Language Toggle Button:**
   - Added a language switcher button with an accessible globe icon and language tag label (e.g. `EN` or `DE`) to the navigation bar in `frontend/src/components/Header.jsx`.
   - Connected the button to `i18n.changeLanguage()`, alternating between `'en'` and `'de'`.
   - Handled language resolution cleanly (`i18n.resolvedLanguage || i18n.language || 'en'`).
   - Added appropriate `aria-label` and `title` tooltip attributes for accessibility.

2. **Locales & Translations:**
   - Added `switchLanguage` translation key in `frontend/src/locales/en.json` ("Switch language") and `frontend/src/locales/de.json` ("Sprache wechseln").
   - Maintained strict key parity between English and German locales.

3. **Styling:**
   - Added `.langButton` and `.langLabel` in `frontend/src/components/Header.module.css` utilizing design system tokens (`var(--color-text-on-surface)`, `var(--stroke-xs)`, `var(--radius-full)`, `var(--color-accent-secondary)`).

4. **Testing:**
   - Expanded `frontend/src/components/Header.test.jsx` with unit tests verifying:
     - Rendering of the language toggle button with current language label.
     - Toggling from EN to DE on click.
     - Toggling from DE to EN when German is active.
     - Closing the user settings modal via `onClose` callback.
