# Implementation Plan - US-040: Enterprise Tenant Isolation & Scoping

## Goal
Enforce organization-level tenant boundaries and domain restrictions on decisions created within enterprise Microsoft Entra ID environments.

## Proposed Changes

### Backend Security & Cloud Functions
#### [MODIFY] `functions/src/middleware/auth.js`
- Validate the `tid` (tenant ID) claim on decoded Firebase ID tokens for protected routes.
- Check if target decision has `tenantId` set and ensure requesting user's `tenantId` matches.

#### [MODIFY] `firestore.rules`
- Add helper rule:
  ```
  function isSameTenant(decision) {
    return !('tenantId' in decision.data) ||
           (request.auth != null && request.auth.token.tenantId == decision.data.tenantId);
  }
  ```
- Enforce `isSameTenant(resource)` on `decisions` and subcollection read/write rules.

### Frontend UI & Decision Creation
#### [MODIFY] `frontend/src/pages/Home.jsx` / `frontend/src/components/CreateDecisionModal.jsx`
- If user is authenticated via Microsoft Entra ID, show a toggle: "Restrict to [Company Name] (Tenant Only)".
- Set `tenantId` in decision document creation payload when enabled.

#### [MODIFY] `frontend/src/pages/Decision.jsx`
- If a guest or non-matching tenant user visits a restricted decision, display an enterprise access gate ("Please sign in with your corporate account").

## Verification Plan

### Automated Tests
- Unit tests for Firestore Security Rules:
  - User with matching `tenantId` can read/vote on restricted decision.
  - Anonymous user or user from a different `tenantId` is blocked from reading/voting on restricted decision.
- Cloud Functions unit tests for tenant middleware.
- Linting:
  - `cd functions && npm run lint`
  - `cd frontend && npm run lint`
