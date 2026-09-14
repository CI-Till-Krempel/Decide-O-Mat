# User Story: Show QR Code for Decision Sharing

**As a** decision creator or participant
**I want to** display and share a QR code leading to the current decision
**So that** people in in-person or hybrid settings (meetings, workshops, presentations, social gatherings) can quickly scan the code with a smartphone camera and participate immediately without manually typing a link.

## Acceptance Criteria

### Access & Trigger
1. **Trigger — Decision Page**: A clear "Show QR Code" action (button or icon) is available on the decision page, integrated with or alongside the existing share/copy-link actions (e.g., in `ElectionHero` and the floating action button / share menu).
2. **Trigger — Archive / My Decisions**: The context menu for decision cards in `MyDecisions` includes a "Show QR Code" action alongside "Copy Link".
3. **Availability**: The QR code is accessible across all decision states:
   - In both Voting mode and Results mode.
   - For open and closed decisions.
4. **Authorization**: Available to any user who has access to the decision (both owner and participants, authenticated or guest/anonymous).

### QR Code Display & Modal
5. **Modal Presentation**: Activating the trigger displays a dedicated, accessible modal (`QRCodeModal`) containing:
   - High-contrast, scannable QR code with an adequate quiet zone.
   - The decision question/title.
   - Decision URL text display with a one-click "Copy Link" button.
   - Action to download the QR code image (PNG format) or copy image to clipboard for inclusion in slides, documents, or printouts.
   - Clear close button (`✕`) as well as keyboard `Escape` key and backdrop-click dismissal.
6. **URL Resolution & E2EE Preservation**:
   - The QR code encodes the complete, canonical URL to the decision.
   - **End-to-End Encryption (E2EE) Compatibility**: For E2E encrypted decisions, the URL fragment containing the decryption key (e.g., `#key=...`) MUST be fully preserved in the encoded QR code payload so scanning devices can decrypt and render the decision immediately without manual key exchange.
7. **Client-Side Generation & Privacy**:
   - QR code generation must happen 100% in the client browser (e.g., via SVG/Canvas).
   - No decision URLs, question texts, or cryptographic keys may be transmitted to external third-party QR generation APIs or server logs.
8. **Visual Design & Dark Theme Integration**:
   - The modal and QR presentation conform to the Decide-O-Mat design system tokens (dark background, proper padding, crisp contrast).
   - The QR code itself is rendered with high contrast (dark module on white/light background container or inverted with sufficient quiet zone) to ensure rapid decoding by standard mobile camera apps under varying lighting conditions.

### Usability & Accessibility
9. **Responsive Design**: The modal renders gracefully across desktop, tablet, and mobile viewport sizes.
10. **Accessibility**: Conforms to WAI-ARIA modal dialog standards (`role="dialog"`, `aria-modal="true"`, accessible label, focus trap, and focus restoration).
11. **Internationalization (i18n)**: All modal titles, action buttons, tooltips, and toast notifications are localized in English (`en.json`) and German (`de.json`).

## Technical Notes
- **Library Selection**: Utilize a lightweight, tree-shakeable, client-side QR generation library compatible with React 19 (e.g., `qrcode.react` or `qrcode`).
- **E2EE Critical Path**: `window.location.href` already contains the hash fragment with the encryption key when viewing an encrypted decision. The QR code generator must use this full URL.
- **Frontend Integration Points**:
  - `frontend/src/components/ElectionHero.jsx`: Add QR trigger or share menu option.
  - `frontend/src/components/QRCodeModal.jsx`: Modal component containing QR renderer, download button, and copy link fallback.
  - `frontend/src/pages/Decision.jsx`: Manage modal state and link payload.
  - `frontend/src/pages/MyDecisions.jsx`: Context menu item trigger.
  - `frontend/src/locales/en.json` & `frontend/src/locales/de.json`: Localization strings (`decision.showQRCode`, `decision.downloadQRCode`, etc.).

## Implementation Plan
- [IMP-037-QR-Code-Decision](../plans/IMP-037-QR-Code-Decision.md)
