# Implementation Plan - US-037: Show QR Code for Decision Sharing

## Goal
Allow users to display and download a QR code for the current decision, including full support for End-to-End Encrypted (E2EE) URL fragments, enabling fast and frictionless mobile participation in meetings and presentations.

## Proposed Changes

### Frontend Dependencies
#### [MODIFY] `frontend/package.json`
- Add lightweight client-side QR generation dependency (e.g., `qrcode.react` or `qrcode`).

### Frontend Components & Pages
#### [NEW] `frontend/src/components/QRCodeModal.jsx` & `QRCodeModal.module.css`
- Modal dialog containing:
  - Canvas / SVG rendered QR code with high-contrast quiet zone.
  - Decision title/question header.
  - Formatted link display with "Copy Link" button.
  - "Download QR Code" (PNG) button.
  - Accessible dialog attributes, focus management, and keyboard close (Esc).

#### [MODIFY] `frontend/src/components/ElectionHero.jsx` & `ElectionHero.module.css`
- Add QR code action icon/button next to stats or share controls.
- Connect `onShowQRCode` callback.

#### [MODIFY] `frontend/src/pages/Decision.jsx`
- Introduce `showQRModal` state.
- Wire QR code action from `ElectionHero` or FAB to open `QRCodeModal` with `window.location.href`.

#### [MODIFY] `frontend/src/pages/MyDecisions.jsx`
- Add "Show QR Code" option to `getContextMenuItems` on decision cards.

#### [MODIFY] `frontend/src/locales/en.json` & `frontend/src/locales/de.json`
- Add localization strings:
  - `decision.showQRCode`: "Show QR Code" / "QR-Code anzeigen"
  - `decision.qrModalTitle`: "Share Decision via QR Code" / "Entscheidung per QR-Code teilen"
  - `decision.downloadQRCode`: "Download QR Code" / "QR-Code herunterladen"
  - `decision.qrInstructions`: "Scan this code with a phone camera to open and vote on this decision." / "Diesen Code mit einer Smartphone-Kamera scannen, um abzustimmen."

## Verification Plan

### Automated Tests
- Unit tests for `QRCodeModal`:
  - Renders QR code canvas/SVG given a decision URL.
  - Correctly encodes E2EE hash fragments (`#key=...`).
  - Fires copy link callback and download trigger.
  - Dismisses on Escape key and close button.
- Unit tests for `ElectionHero` and `MyDecisions`:
  - Verify QR trigger button renders and invokes the handler.
- Linting and build verification:
  - `cd frontend && npm run lint`
  - `cd frontend && npm run build`

### Manual Verification
1. Open an existing decision (both plain and E2E encrypted).
2. Click "Show QR Code".
3. Scan the displayed QR code with a physical mobile device.
4. Verify the mobile browser navigates directly to the decision and decrypts content correctly.
5. Click "Download QR Code" and verify downloaded PNG image is valid and scannable.
