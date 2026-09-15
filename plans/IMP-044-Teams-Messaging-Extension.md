# Implementation Plan - US-044: Teams Messaging Extension & Link Unfurling

## Goal
Implement a Microsoft Teams messaging extension allowing users to create decisions and search existing decisions from the chat compose box, alongside automatic link unfurling into rich summary cards.

## Proposed Changes

### Backend Bot Framework & Webhook
#### [NEW] `functions/src/teams/messagingExtension.js`
- Handle Teams Bot activity type `composeExtension/query`:
  - Search Firestore `decisions` owned by or shared with the querying user.
  - Return preview items formatted as `messagingExtensionResult`.
- Handle `composeExtension/queryLink`:
  - Parse pasted Decide-O-Mat URL.
  - Fetch non-sensitive decision public metadata (question, status, vote counts).
  - Return Adaptive Card attachment for link unfurling.
  - For E2EE decisions, return clean zero-knowledge card with "Encrypted Decision" placeholder.
- Handle `composeExtension/submitAction`:
  - Process creation of decision from compose modal and return inserted card into message feed.

#### [MODIFY] `functions/src/index.js`
- Route `/api/teams/messages` HTTP webhook to Teams bot handler.

## Verification Plan

### Automated Tests
- Unit tests for `messagingExtension`:
  - Parses decision query and returns valid Adaptive Card search results.
  - Correctly unfurls decision URL into rich card JSON structure.
  - Handles encrypted decision URLs without leaking private data.
- Linting:
  - `cd functions && npm run lint`
