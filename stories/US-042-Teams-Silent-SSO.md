# User Story: Microsoft Teams Silent Single Sign-On (SSO)

**As a** Microsoft Teams user  
**I want to** open Decide-O-Mat tabs inside Teams and be signed in automatically without clicking login buttons or encountering popup authorization windows  
**So that** using Decide-O-Mat feels completely native, instant, and frictionless inside my corporate collaboration environment.

## Acceptance Criteria

### Silent Token Acquisition
1. **Teams SDK Token Retrieval**:
   - When the app detects it is running inside Teams, it invokes `teams.authentication.getAuthToken()`.
   - Acquires the user's Entra ID `id_token` silently using the Teams logged-in identity without any popup dialogue.
2. **Fallback Consent Flow**:
   - If admin consent or multi-factor challenge is required (`interaction_required`), provide a clean Teams native popup consent prompt via `teams.authentication.authenticate()`.

### Backend Token Validation & Firebase Token Minting
3. **`exchangeTeamsToken` Cloud Function**:
   - Endpoint: `POST /api/auth/exchangeTeamsToken`.
   - Validates the incoming Entra ID JWT against Microsoft's public JWKS endpoint (`https://login.microsoftonline.com/common/discovery/v2.0/keys`).
   - Verifies issuer, audience (Azure App Client ID), signature, and expiration.
   - Extracts user identifiers: `oid` (object id), `tid` (tenant id), `preferred_username`, `name`, `email`.
   - Mints a Firebase Custom Auth Token with custom claims (`tenantId`, `provider: 'microsoft.com'`) via `firebase-admin.auth().createCustomToken()`.
4. **Client Session Initialization**:
   - Frontend calls `signInWithCustomToken(auth, customToken)`.
   - User profile is established and real-time Firestore listeners connect immediately with authenticated security rule permissions.

### Performance & Caching
5. **Fast Startup**:
   - Token acquisition and exchange completes in `< 1.5 seconds` on initial tab load.
   - Subsequent tab views use cached session tokens until expiry.

## Technical Notes
- **Azure App Registration Requirements**:
  - Expose an API: `api://<app-domain>/<client-id>` with `access_as_user` scope.
  - Authorize Teams Client IDs:
    - Teams desktop/mobile: `1fec8e78-bce4-4aaf-ab1b-5451cc387264`
    - Teams web client: `5e3ce6c0-2b1f-4285-8d4b-75ee78787346`
- **Cloud Function**:
  - `functions/src/auth/exchangeTeamsToken.js` using `jsonwebtoken` and `jwks-rsa`.

## Implementation Plan
- [IMP-042-Teams-Silent-SSO](../plans/IMP-042-Teams-Silent-SSO.md)
