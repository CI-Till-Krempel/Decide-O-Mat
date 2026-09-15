# Implementation Plan - US-043: Teams Channel Tabs & Live Meeting Extension

## Goal
Implement a configurable tab setup page for pinning decisions to Teams channels, and an optimized view for live meeting sidepanels and stage sharing.

## Proposed Changes

### Frontend Tab Configuration & Views
#### [NEW] `frontend/src/pages/TeamsConfig.jsx` & `TeamsConfig.module.css`
- Rendered when user adds Decide-O-Mat tab to a channel.
- Displays list of user's existing decisions with search/filter.
- Provides "Create New Decision" button right inside the configuration view.
- Integrates with Teams SDK `pages.config`:
  - Calls `pages.config.registerOnSaveHandler(saveEvent => ...)`.
  - Sets `pages.config.setSettings({ contentUrl, entityId, suggestedDisplayName })`.
  - Calls `pages.config.setValidityState(true)` once a decision is selected.

#### [NEW] `frontend/src/pages/MeetingSidePanel.jsx` & `MeetingSidePanel.module.css`
- Compact vertical layout optimized for Teams meeting side panel (`width ~ 320-380px`).
- Quick argument input, swipe/tap vote chips, and live score gauge.

#### [MODIFY] `frontend/src/pages/Decision.jsx`
- Support meeting stage mode (`?mode=stage`): Fullscreen dark visualization of live results graph and decision consensus without editing controls.

## Verification Plan

### Automated Tests
- Unit tests for `TeamsConfig`:
  - Registers onSaveHandler and enables validity when decision is selected.
- Unit tests for `MeetingSidePanel`:
  - Renders decision data in compact responsive container.
- Linting & Build:
  - `cd frontend && npm run lint`
  - `cd frontend && npm run build`
