# Implementation Plan - US-016: Legal Pages

## Goal
Add required legal pages and footer navigation.

## Proposed Changes

### Frontend (React)
#### [NEW] `src/pages/Legal/Impressum.tsx`
#### [NEW] `src/pages/Legal/Privacy.tsx`
#### [NEW] `src/pages/Legal/Terms.tsx`
-   Static content pages.

#### [NEW] `src/components/Footer.tsx`
-   Links to legal pages.

#### [MODIFY] `src/App.tsx`
-   Add routes.
-   Include `Footer` in layout.

## Verification Plan

### Manual Verification
1.  Visit `/impressum`, `/privacy`, `/terms`.
2.  Check Footer links work.
