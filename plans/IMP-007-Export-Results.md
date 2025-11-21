# Implementation Plan - US-007: Export Results as Image

## Goal
Enable users to export the decision results (question, pros/cons, score) as an image file.

## Proposed Changes

### Frontend (React)
#### [NEW] `src/components/ExportButton.tsx`
- Button component that triggers the export.
- Uses `html2canvas` (or similar) to capture the decision view.

#### [MODIFY] `src/pages/Decision.tsx`
- Add `ExportButton` to the toolbar/header.
- Ensure the layout is capture-friendly (or create a hidden container for rendering the export view).

#### [NEW] `package.json`
- Add dependency: `html2canvas`.

## Verification Plan

### Automated Tests
- **Unit Tests**: Verify `ExportButton` renders.

### Manual Verification
1.  Open a decision with arguments and votes.
2.  Click "Export as Image".
3.  Verify a file is downloaded (e.g., `decision-results.png`).
4.  Open the image and verify content (Question, Score, Arguments).
