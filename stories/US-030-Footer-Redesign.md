# User Story: Footer Redesign

**As a** user
**I want** a footer with legal links and application branding
**So that** I can access legal information and know which version of the app I'm using.

## Acceptance Criteria
1. **Dark Background**: Full-width dark footer consistent with overall theme.
2. **Legal Links** (left-aligned): "AGB" (Terms), "Datenschutz" (Privacy), "Impressum" (Legal Notice).
3. **Branding** (right-aligned): "Decide-O-Mat" text and version number (e.g., "v1.6.0").
4. **Link Targets**: Legal links navigate to their respective pages (placeholder routes until US-016 is implemented).
5. **Encryption Indicator**: Decision needed — the current footer shows E2E encryption status which is not in the Figma design.

## Design Gaps
- **Encryption status indicator**: Currently displayed in footer, not present in Figma. Decision: keep, relocate, or remove.

## Technical Notes
- Current component: `frontend/src/components/Footer.jsx`
- Legal pages (US-016) are not yet implemented — links can point to placeholder routes.
- Version is injected via Vite's `__APP_VERSION__` define.

## Figma Reference
- Node ID: `555:1457` (Footer component)

## Implementation Plan
- [IMP-030-Footer-Redesign](../plans/IMP-030-Footer-Redesign.md)
