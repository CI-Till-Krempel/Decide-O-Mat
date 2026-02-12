# Implementation Plan - US-030: Footer Redesign

## Goal
Redesign the footer to match the Figma design with legal links and branding.

## Proposed Changes

### Frontend
#### [MODIFY] `frontend/src/components/Footer.jsx`
- Restructure JSX layout:
  - Left section: Legal links — "AGB", "Datenschutz", "Impressum".
  - Right section: "Decide-O-Mat" text + version number.
- Remove encryption status indicator (or relocate — decision pending).
- Remove old inline styles; use CSS Module.

#### [NEW] `frontend/src/components/Footer.module.css`
- Dark background matching the page.
- Flexbox layout with `justify-content: space-between`.
- Links: Styled per Figma (muted color, hover state).
- Version text: Small, muted, right-aligned.
- Consistent padding with the rest of the page layout.

### Routing
- Add placeholder routes for legal pages:
  - `/legal/terms` (AGB)
  - `/legal/privacy` (Datenschutz)
  - `/legal/imprint` (Impressum)
- These render placeholder content until US-016 is fully implemented.

#### [MODIFY] `frontend/src/App.jsx` (or router config)
- Add routes for legal page placeholders.

## Verification Plan

### Automated Tests
- Update `Footer.test.jsx` to verify new link structure.
- Verify legal links render with correct `href`/`to` attributes.
- Verify version number displays.

### Manual Verification
1. Verify footer appears on all pages.
2. Verify legal links navigate to placeholder pages.
3. Verify version number matches build.
4. Verify visual match with Figma.
