# User Story: Enterprise Tenant Isolation & Scoping

**As an** IT administrator or enterprise workspace owner  
**I want to** restrict decision access and creation to users belonging to our specific Microsoft Entra ID tenant / company domain  
**So that** confidential company decisions cannot be viewed, edited, or voted on by external users or personal Microsoft accounts.

## Acceptance Criteria

### Tenant Scoping & Policy Enforcement
1. **Decision Creation Scoping**:
   - Authenticated corporate users have an option when creating a decision to mark it as **"Company Only (Restricted to Tenant)"**.
   - The decision document stores the owner's Entra ID `tenantId` and allowed company email domains (e.g. `['@company.com']`).
2. **Access Control & Authorization**:
   - Access to tenant-restricted decisions is enforced in Cloud Functions and Firestore Security Rules:
     - Non-authenticated / anonymous visitors attempting to open a tenant-restricted decision are presented with a tenant login gate ("This decision is restricted to members of [Organization Name]. Please sign in with your work account.").
     - Authenticated users with non-matching `tenantId` receive an access denied error.
3. **Domain Whitelisting**:
   - System supports optional environment/instance level configuration (`RESTRICTED_TENANT_ID` or `ALLOWED_DOMAINS`) for dedicated enterprise instances.

### Security & Audit Trail
4. **Token Claim Verification**:
   - Cloud Functions strictly verify the `tid` (tenant ID) claim on the Firebase Auth decoded token before allowing writes to tenant-restricted decisions.
5. **Localization & UX**:
   - Tenant-restricted badges and informative login prompts are displayed in the decision UI and translated into English and German.

## Technical Notes
- **Firestore Schema**:
  - `decisions/{decisionId}.tenantId`: string (e.g., `3f7b2...`).
  - `decisions/{decisionId}.isTenantRestricted`: boolean.
- **Backend / Rules**:
  - `firestore.rules`: Validate `request.auth.token.firebase.identities['microsoft.com']` or custom claim `tenantId`.
  - `functions/src/`: Middleware to validate `tenantId` on restricted endpoints (`voteArgument`, `closeDecision`, etc.).

## Implementation Plan
- [IMP-040-Enterprise-Tenant-Restrictions](../plans/IMP-040-Enterprise-Tenant-Restrictions.md)
