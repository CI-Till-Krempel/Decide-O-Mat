# Implementation Plan - US-031: Home Page Redesign

## Goal
Redesign the home page to match the Figma "Home page" (Figma: "Startseite") with a full-bleed dark layout, background illustration, and new input UX.

## Proposed Changes

### Frontend
#### [MODIFY] `frontend/src/pages/Home.jsx`
- Remove the `.card` wrapper and `.container` — use full-page layout.
- Restructure JSX:
  - Background illustration layer (absolute/fixed positioned).
  - Centered content container (~578px max-width):
    - Heading: "Simply decide" (Figma: "Einfach entscheiden") (large, bold, white).
    - Description paragraph (light gray, max-width constrained).
    - Input section:
      - Floating-label text input ("Question to be decided" (Figma: "Zur Klaerung stehende Frage")).
      - Clear button (X icon) visible when text is present.
      - Circular green submit button (arrow-right icon) centered below input.
  - Remove inline "Start Deciding" button.
- Keep existing logic: `handleStart()`, encryption, navigation.

#### [NEW] `frontend/src/pages/Home.module.css`
- Full viewport height layout (`min-height: 100vh`).
- Centered flex column for content.
- Background illustration: CSS gradients or positioned SVG.
- Input field: Dark background, light border, floating label animation.
- Submit button: Circular, `var(--color-accent-success)` (lime green), centered.

#### [NEW] `frontend/src/assets/background-illustration.svg` (or CSS-only)
- Gradient circle illustration matching Figma (purple/peach/green gradient).
- Options: SVG asset or CSS `radial-gradient` + `border-radius`.

### Text Content
- Depends on i18n decision:
  - If German: Use Figma copy directly.
  - If English: Translate Figma copy to English.
  - If i18n: Create translation keys and add both languages.

## Verification Plan

### Automated Tests
- Update `Home.test.jsx`:
  - Verify heading text renders.
  - Verify input placeholder text.
  - Verify submit button triggers decision creation.
  - Verify clear button clears input.

### Manual Verification
1. Verify full-bleed dark background with gradient illustration.
2. Verify centered content layout at 1280px width.
3. Verify floating label input behavior (focus, filled, empty states).
4. Verify circular submit button appearance and hover state.
5. Verify decision creation flow still works end-to-end.
6. Test at various viewport widths for responsiveness.
