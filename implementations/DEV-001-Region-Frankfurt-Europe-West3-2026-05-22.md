# Implementation Notes - DEV-001: Set Cloud Functions Region to Frankfurt (europe-west3)

**Date:** 2026-05-22

## Context
The user requested to change the deployment region of the Cloud Functions from the default US region to the Frankfurt data center (`europe-west3`).

## Technical Decisions & Reasoning

### 1. Backend Global Options Update
- **File:** [index.js](file:///Users/tkrempel/Documents/Antigravity/Decide-O-Mat/functions/index.js)
- **Decision:** Import `setGlobalOptions` from `firebase-functions/v2` and invoke it with `{ region: "europe-west3" }`.
- **Reasoning:** In Cloud Functions for Firebase v2, default options (like region, memory, min/max instances, etc.) can be set globally. Putting this at the top of the entrypoint file `index.js` ensures that all functions exported from this file (including imported functions like `deleteUser`) inherit the `europe-west3` region.

### 2. Frontend Services Update
- **File:** [firebase.js](file:///Users/tkrempel/Documents/Antigravity/Decide-O-Mat/frontend/src/services/firebase.js)
- **Decision:** Pass `"europe-west3"` as the second argument to `getFunctions(app)`.
- **Reasoning:** By default, the Firebase client SDK's `getFunctions()` targets the `us-central1` region. To invoke functions deployed in a custom region like Frankfurt, the client SDK must be explicitly initialized with the same region, i.e., `getFunctions(app, "europe-west3")`.

## Verification Results
- **Linter (Backend & Frontend):** Passed cleanly in both `frontend` and `functions` directories.
- **Frontend Tests:** Ran `npm test` successfully; all 163 unit tests passed without regression.
- **Frontend Build:** Succeeded without errors.
