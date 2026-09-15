# User Story: Teams Channel Tabs & Live Meeting Extension

**As a** team lead or meeting organizer  
**I want to** pin a decision to a Teams channel or add Decide-O-Mat as an app to a live Teams meeting  
**So that** all team members can collaborate, brainstorm arguments, and cast votes directly during channels chats and live meeting calls.

## Acceptance Criteria

### Channel Tab Configuration
1. **Configurable Tab Flow**:
   - When a user clicks `+` to add a tab in a Teams channel or group chat, the Decide-O-Mat configuration modal opens (`/teams/config`).
   - The user can either:
     - Select an existing decision from their list.
     - Create a brand new decision directly in the modal.
   - Upon selection/creation, `pages.config.setSettings({ contentUrl, entityId, suggestedDisplayName })` is executed and `pages.config.setValidityState(true)` enables the "Save" button.
2. **Channel Tab Display**:
   - The channel tab renders the selected decision with full real-time voting, pro/con argument creation, and net score calculation.
   - All channel members accessing the tab are authenticated via silent SSO and have their votes identified.

### Live Meeting Extension (In-Meeting Experience)
3. **Meeting Sidepanel**:
   - When added to a scheduled or ad-hoc Teams meeting (`meetingSidePanel` context), Decide-O-Mat displays an optimized vertical layout:
     - Live pro/con list.
     - Fast upvote / downvote buttons.
     - Real-time final vote bar.
4. **Meeting Stage Sharing**:
   - The organizer can click "Share to Stage" (`meetingStage` context) to project the live results graph and decision consensus onto the main Teams meeting screen.

## Technical Notes
- **Teams Manifest Contexts**:
  - `configurableTabs`: `scopes: ["team", "groupChat"]`.
  - `meetingSidePanel` and `meetingStage` context declarations.
- **Frontend Routing**:
  - `/teams/config`: Config dialog for tab creation.
  - `/teams/tab/:decisionId`: Optimized view for channel tab and meeting sidepanel.

## Implementation Plan
- [IMP-043-Teams-Channel-Meeting-Tabs](../plans/IMP-043-Teams-Channel-Meeting-Tabs.md)
