# Release Plan: Decide-O-Mat v2.0 (Major Release)

**Target Version**: `v2.0.0`  
**Theme**: QR Code Sharing, Mobile-First Accessibility, and Repository Quality Hardening  
**Scope**: [US-037](../stories/US-037-QR-Code-Decision.md), [US-038](../stories/US-038-Mobile-Friendly-Experience.md), and Repository Issues [#399 through #418](https://github.com/CI-Till-Krempel/Decide-O-Mat/issues).

---

## 1. Objectives & Executive Summary

Decide-O-Mat v2.0 is a milestone major release designed to transform Decide-O-Mat from a desktop-centric tool into a truly universal, frictionless decision platform. The release accomplishes three pillars:
1. **Instant In-Person / Hybrid Sharing (US-037)**: Generate client-side, high-contrast QR codes preserving End-to-End Encryption (E2EE) keys in URL hash fragments so anyone can scan and participate instantly.
2. **First-Class Mobile Experience (US-038)**: Complete mobile-first navigation (hamburger menu/drawer), responsive layouts, 44px touch targets, safe-area padding, and keyboard-aware inputs for screens down to 320px width.
3. **Repository Hardening & Compliance**: Resolve all 20 open GitHub issues (#399 – #418), eliminating security vulnerabilities, E2EE key sync gaps, GDPR compliance concerns, and internationalization deficits.

---

## 2. Work Packages & Phased Rollout

### Phase 1: Security, Backend & Infrastructure Hardening
*Focus: Secure the database, fix package dependencies, and eliminate critical backend vulnerabilities.*

| Issue / Story | Description | Target Files |
| :--- | :--- | :--- |
| **#403** | Missing `firebase-admin` dependency in `functions/package.json` | `functions/package.json` |
| **#399** | Firestore rules: non-owners blocked from reading `participants` | `firestore.rules` |
| **#400** | Schema validation missing for client writes on `participants` | `firestore.rules`, `functions/index.js` |
| **#401** | `deleteUser` fails to scrub `encryptedDisplayName`, breaking decryption for others | `functions/deleteUser.js` |
| **#402** | Account deletion fails to reassign/clean up owned decisions | `functions/deleteUser.js` |
| **#415** | Enforce dot-voting argument limit server-side in `voteArgument` | `functions/index.js` |
| **#404** | E2EE Auditor workflow mismatched project ID (`demo-test`) causing CORS errors | `.github/workflows/e2ee-audit.yml` |

### Phase 2: Data Integrity & E2EE Key Synchronization
*Focus: Prevent user data loss, fix encryption key restoration on refresh, and eliminate app crashes.*

| Issue / Story | Description | Target Files |
| :--- | :--- | :--- |
| **#407** | E2EE: Decision view fails to recover encryption key from localStorage on refresh | `frontend/src/pages/Decision.jsx`, `EncryptionService.js` |
| **#413** | Magic Link: identity transfer loses E2EE decision encryption keys | `frontend/src/pages/MagicHandler.jsx`, `functions/index.js` |
| **#414** | Security: Magic Link token remains visible in browser address bar/history | `frontend/src/pages/MagicHandler.jsx` |
| **#408** | Final vote state persists only in localStorage rather than Firestore subcollection | `frontend/src/pages/Decision.jsx`, `functions/index.js` |
| **#418** | `StatementCard` crashes with TypeError if `participantMap` or `user` is null/undefined | `frontend/src/components/StatementCard.jsx` |

### Phase 3: Core v2.0 Features (QR Code Sharing & Mobile Optimization)
*Focus: Implement US-037 and US-038 to deliver a modern in-person and smartphone experience.*

| Issue / Story | Description | Target Files |
| :--- | :--- | :--- |
| **US-037** | **Show QR Code for Decision Sharing**<br>• Client-side generation using `qrcode.react`<br>• Full E2EE URL hash fragment preservation (`#key=...`)<br>• High-contrast accessible modal dialog<br>• Image download (PNG) & copy link fallback | `frontend/package.json`<br>`frontend/src/components/QRCodeModal.jsx`<br>`frontend/src/components/ElectionHero.jsx`<br>`frontend/src/pages/Decision.jsx`<br>`frontend/src/pages/MyDecisions.jsx` |
| **US-038** | **Mobile-Friendly Navigation & Responsive Experience**<br>• Hamburger navigation drawer in header replacing hidden links<br>• Adaptive Pro/Con column switcher for small viewports<br>• Keyboard-safe floating argument input overlay<br>• Minimum 44x44px touch targets across all cards and buttons<br>• Safe-area insets (`env(safe-area-inset-bottom)`) for FAB and bars | `frontend/src/components/Header.jsx`<br>`frontend/src/components/Header.module.css`<br>`frontend/src/pages/Decision.module.css`<br>`frontend/src/components/ElectionHero.module.css`<br>`frontend/src/components/FloatingArgumentInput.module.css`<br>`frontend/src/components/StatementCard.module.css`<br>`frontend/index.html` |

### Phase 4: UX, Internationalization & Feature Gaps
*Focus: Bring full polish, bilingual support, GDPR privacy, and missing features to completion.*

| Issue / Story | Description | Target Files |
| :--- | :--- | :--- |
| **#417** | Self-host Google Fonts locally to ensure zero external tracking and 100% GDPR compliance | `frontend/index.html`, `frontend/public/fonts/`, `index.css` |
| **#416** | Add user-facing language switcher control (EN / DE) in header and settings | `frontend/src/components/Header.jsx`, `UserSettings.jsx` |
| **#409** | Localize `NamePrompt` dialog and fix theme styling | `frontend/src/components/NamePrompt.jsx`, `locales/*.json` |
| **#410** | Localize Login & Registration page strings | `frontend/src/pages/Login.jsx`, `locales/*.json` |
| **#411** | Handle `auth/invalid-credential` gracefully with clear user feedback | `frontend/src/pages/Login.jsx` |
| **#412** | Profile settings: add email display, name editing, and password reset | `frontend/src/components/UserSettings.jsx` |
| **#405** | Implement Statistics View (US-036) trigger in `ElectionHero` and `MyDecisions` | `frontend/src/components/ElectionHero.jsx`, `MyDecisions.jsx`, `StatisticsModal.jsx` |
| **#406** | Service Worker: add push notification destination URL and `notificationclick` handler | `frontend/scripts/generate-sw.js`, `frontend/src/services/NotificationService.js` |

---

## 3. Release Verification & Cut (Phase 5)

1. **Automated Verification**:
   - `cd frontend && npm run lint` (0 errors)
   - `cd functions && npm run lint` (0 errors)
   - `cd frontend && npm run build` (successful production bundle)
   - `cd frontend && npm test -- --run` (all test suites passing)
2. **Version Bump**:
   - Bump `frontend/package.json` to `2.0.0`.
   - Bump `functions/package.json` to `2.0.0`.
3. **Documentation**:
   - Update `CHANGELOG.md` with `[2.0.0]` release section.
   - Create release announcement in `announcements/v2.0.md`.
4. **Git Release**:
   - Create git tag `v2.0.0` and deploy via CI/CD pipeline.
