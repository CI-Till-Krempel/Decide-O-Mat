# User Story: Microsoft Entra ID (Azure AD) Web Authentication

**As a** corporate user or organization member  
**I want to** sign in to Decide-O-Mat using my corporate Microsoft / Office 365 account (Microsoft Entra ID)  
**So that** I do not have to manage separate passwords, can benefit from enterprise single sign-on (SSO), and seamlessly transition from anonymous sessions to my corporate identity.

## Acceptance Criteria

### Authentication Trigger & UI
1. **Login Page Action**: A "Sign in with Microsoft" button is rendered on the Login and Register pages alongside existing providers (Google, Email/Password).
2. **Branding & Accessibility**: The button adheres to Microsoft official branding guidelines (Microsoft logo, standard typography) and conforms to WCAG contrast standards.
3. **Account Linking**:
   - When an anonymous user signs in via Microsoft, their anonymous identity, existing created decisions, and voting history are automatically linked (`linkWithPopup` / `linkWithCredential`).
   - If an account already exists with the same verified corporate email, the user is prompted to link or sign in as per Firebase Auth security policies.

### OAuth 2.0 & Token Handling
4. **Provider Configuration**: Uses Firebase Authentication `OAuthProvider('microsoft.com')` configured with:
   - Scopes: `openid`, `profile`, `email`, `User.Read`.
   - Custom parameters: `prompt=select_account`, `tenant=organizations` (allowing any work or school directory).
5. **Profile Synchronization**:
   - `displayName`, `email`, and `photoURL` (if provided in Microsoft profile claims) are synchronized with the Decide-O-Mat `UserContext` and user profile.
   - User profile in `users/{userId}` stores `authProvider: 'microsoft.com'` and Microsoft tenant metadata (`tenantId`).

### Error Handling & Internationalization
6. **Error States**: Clear, localized error toasts/messages for:
   - User cancellation / popup closed (`auth/popup-closed-by-user`).
   - Tenant access denied / admin consent required (`auth/user-disabled`, `auth/operation-not-allowed`).
   - Account conflict resolution.
7. **Localization (i18n)**: All button labels, tooltip texts, and error descriptions are fully localized in English (`en.json`) and German (`de.json`).

## Technical Notes
- **Azure App Registration**:
  - Application (Client) ID and Secret configured in Azure Entra Admin center and Firebase Auth Console.
  - Redirect URL: `https://<firebase-project-id>.firebaseapp.com/__/auth/handler`.
- **Frontend Integration Points**:
  - `frontend/src/contexts/UserContext.jsx`: Add `loginWithMicrosoft(linkExisting = false)` method using `OAuthProvider('microsoft.com')`.
  - `frontend/src/pages/Login.jsx`: Render Microsoft login button and error handlers.
  - `frontend/src/locales/en.json` & `frontend/src/locales/de.json`: Localization entries (`auth.signInWithMicrosoft`, etc.).

## Implementation Plan
- [IMP-039-Entra-ID-Authentication](../plans/IMP-039-Entra-ID-Authentication.md)
