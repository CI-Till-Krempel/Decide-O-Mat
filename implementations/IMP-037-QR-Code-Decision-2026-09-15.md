# Implementation Note: IMP-037 - Show QR Code for Decision Sharing

**Date:** 2026-09-15  
**Story ID:** [US-037](../stories/US-037-QR-Code-Decision.md)  
**Author:** AI Agent  

## Context & Motivation
Decide-O-Mat enables rapid collaborative decision making. However, during in-person presentations, team meetings, or hybrid workshops, inviting attendees required either sending manual links over chat channels or copying URLs to external message boards. Furthermore, because Decide-O-Mat uses client-side End-to-End Encryption (E2EE) with the decryption key encoded in the URL hash fragment (`#key=...`), standard URL sharing mechanisms that omit or strip the hash break decryption for new participants.

US-037 introduces a client-side QR code sharing feature that renders high-contrast, scannable QR codes containing the complete URL and hash key fragment, along with one-click link copying and PNG image downloading.

## Technical Architecture & Decisions

### 1. Client-Side QR Generation (`qrcode.react`)
- We integrated `qrcode.react` (v4.2.0) using `QRCodeCanvas` for high-performance, purely client-side rendering.
- **Why pure client-side?** Zero server involvement guarantees zero external tracking and preserves the zero-knowledge security architecture of E2EE decisions. At no point is the decision URL or encryption key sent to a third-party QR generation service.
- Configured with error correction level `'M'`, high-contrast colors (`fgColor: '#000000'`, `bgColor: '#ffffff'`), margin inclusion, and standard size (240x240px).

### 2. URL Hash Key Preservation
- In `Decision.jsx`, the QR code is generated using `window.location.href`, guaranteeing that any active `#key=` hash fragment is retained.
- In `MyDecisions.jsx`, the QR code modal constructs the URL using `EncryptionService.getStoredKeyString(decision.id)`. If an encryption key exists in the user's local keystore, it appends `#key=${key}` to ensure mobile scanners immediately possess the decryption key upon loading.

### 3. Accessible Dialog & Interaction Design (`QRCodeModal`)
- Modal structure adheres to accessibility standards:
  - `role="dialog"`, `aria-modal="true"`, `aria-labelledby="qr-modal-title"`.
  - Keyboard listeners for Escape key dismissal.
  - Backdrop overlay click to dismiss.
  - Readonly URL input with accessible `aria-label`.
  - Rich link copy via `ClipboardUtils.copyRichLink` with standard clipboard fallbacks.
  - PNG download via direct `<canvas>` data URL (`canvas.toDataURL('image/png')`) triggered cleanly via a synthesized `<a>` download element.

### 4. Integration Points
- **Voting / Results Page (`ElectionHero.jsx` & `Decision.jsx`)**:
  - Added a dedicated QR code action button next to the Statistics icon in `ElectionHero` (`styles.topActions`).
  - Added a toolbar action button `<QRCodeIcon />` in the page actions bar.
- **Decision Management (`MyDecisions.jsx`)**:
  - Added "Show QR Code" (`myDecisions.contextMenu.showQRCode`) to the decision card context menu, enabling organizers to quickly display or download QR codes directly from their dashboard.

## Verification & Testing
- **Unit Tests**:
  - `frontend/src/components/QRCodeModal.test.jsx`: 9 tests covering rendering, E2EE key preservation, copy action, PNG download, and keyboard/backdrop dismissal.
  - `frontend/src/components/ElectionHero.test.jsx`: 19 tests verifying the QR code trigger button.
  - `frontend/src/pages/Decision.test.jsx`: 45 tests verifying toolbar and hero QR modal triggers and dismissal.
  - `frontend/src/pages/MyDecisions.test.jsx`: 12 tests verifying context menu integration and modal presentation.
- **Linters & Builds**:
  - Both `frontend` and `functions` linters pass with 0 errors and 0 warnings.
  - Production build (`npm run build`) completed successfully.
