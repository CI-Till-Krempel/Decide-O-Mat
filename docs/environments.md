# Environment Configuration & Security

Decide-O-Mat uses a multi-tier environment strategy to balance developer velocity with strict security in production. This document outlines the configuration and security policies for each environment.

## Environment Strategies

### 1. Local Development (`localhost`)
- **Goal**: Rapid iteration and testing.
- **App Check**: Uses **App Check Emulator**.
- **Authentication**: Firebase Emulators.
- **Database**: Local Firestore Emulator (data is ephemeral).
- **Setup**:
  - Ensure `VITE_RECAPTCHA_SITE_KEY` is set (can be a placeholder if only using emulators).
  - Run `firebase emulators:start` to start the App Check emulator.
  - The client automatically connects to the emulator; no Debug Token registration is required in the console.

### 2. Staging (`decide-o-mat-staging`)
- **Goal**: Integration testing, bug tracing, and error monitoring.
- **App Check**: **Monitored Only** (Unenforced Mode).
  - **Firebase Console**: App Check is ENABLED but the "Enforcement" toggle is OFF (or metrics only).
  - **Cloud Functions**: Code explicitly disables enforcement (`enforceAppCheck: false`).
  - **Firestore Rules**: Rules check for token existence but logic may be permissive for debugging (though ideally mirrors prod).
- **Why?**: This allows developers to see "App Check failed" logs in the console to diagnose issues *without* blocking legitimate test traffic (e.g., from Postman or non-attested devices).

### 3. Production (`decide-o-mat-prod`)
- **Goal**: Maximum Security and Data Protection.
- **App Check**: **Strictly Enforced**.
  - **Cloud Functions**: Code enforces check (`enforceAppCheck: true`). requests without valid tokens are rejected with `401 Unauthorized`.
  - **Firestore Rules**:  `allow read: if request.app != null` ensures only attested apps reads data. Direct writes are disabled.
- **Why?**: To prevent API abuse, scraping, and unauthorized access to user data.

## Configuration Details

### Firebase App Check Setup

To secure the application, App Check must be configured in the Firebase Console for each project.

1.  **Navigate to Console**: [Firebase Console](https://console.firebase.google.com/) -> **App Check**.
2.  **Register App**: Select your web app and register it with **reCAPTCHA v3**.
    - You will need a reCAPTCHA Secret Key from [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin).
3.  **Local Development**:
    - No configuration needed for localhost. Ideally, ensure `VITE_RECAPTCHA_SITE_KEY` is set in `.env` (even to a dummy value) so the provider initializes.

> **Note**: For Staging, you strictly *do not* need to enable the "Enforcement" switch in the UI if the code handles it, but enabling it in "Unenforced Mode" gives you visibility into % of verified traffic.

### SDK Version & Testing
> **IMPORTANT**: The E2EE Auditor tests rely on `connectAppCheckEmulator` to verify App Check enforcement locally. This function is available in Firebase JS SDK **v11.x**.
>
> ⚠️ **Do not upgrade to `firebase` v12.x** without verifying that `connectAppCheckEmulator` (or an equivalent replacement) is available. In tested v12 builds, this function was missing, causing CI tests to fail because they could not connect to the App Check emulator.
