# Release Technical Note: Decide-O-Mat v2.0.0

**Date**: 2026-09-15  
**Release Tag**: `v2.0.0`  
**Release Theme**: QR Code Sharing, Mobile-First Accessibility, and Full Repository Stabilization

## Summary
Decide-O-Mat v2.0.0 marks a major milestone for the project, delivering instant client-side QR code decision sharing with full end-to-end encryption key preservation, a mobile-first responsive experience across all screen sizes, and complete closure of all outstanding GitHub issues and technical debt.

## Scope & Key Deliverables
1. **QR Code Sharing (US-037, #458)**:
   - High-contrast client-side SVG QR code generator with `#key=...` hash preservation.
   - Expandable floating action speed-dial with standard share icon, copy link, and QR modal triggers.
   - PNG export and clipboard support.
2. **Mobile-First Experience (US-038, #459, #460)**:
   - Hamburger drawer navigation in header for screens `<= 768px`.
   - Top-level Participants button in ElectionHero.
   - Safe top padding preventing question title overlap with top action icons.
   - 44px touch targets and safe-area inset compliance.
3. **Data Integrity & Key Sync (#407, #408, #413, #414)**:
   - LocalStorage key persistence on refresh.
   - Cross-device magic link encryption key migration.
   - One-time magic link token URL history scrubbing.
   - Real-time subcollection vote synchronization.
4. **Privacy, Compliance & Internationalization (#410, #416, #417)**:
   - 100% self-hosted Google Fonts and cookie consent preferences.
   - Complete bilingual (EN/DE) coverage with header language switcher.
   - User profile management.

## Verification
- 27 test files / 251 tests passing in Vitest.
- Frontend and Functions linters passing with 0 errors.
- Production build verified.
