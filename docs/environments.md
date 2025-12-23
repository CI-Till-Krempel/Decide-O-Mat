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

To secure the application, App Check must be configured in both the Google Cloud Console (for keys) and the Firebase Console (for enforcement).

#### Phase 1: Create Keys (Google Cloud Console)
You need valid reCAPTCHA v3 keys. It is best practice to have **separate keys for Staging and Production** to prevent pollution of traffic metrics.

1.  Go to the [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin/create).
2.  **Create a new site**:
    *   **Label**: `Decide-O-Mat Staging` (or Prod).
    *   **reCAPTCHA type**: **v3** (Score based).
    *   **Domains**: Add your domains:
        *   `localhost` (for Staging/Dev keys)
        *   `127.0.0.1` (for Staging/Dev keys)
        *   `your-staging-project.web.app`
        *   `your-production-domain.com` (for Prod keys)
3.  **Copy Keys**: You will get two keys:
    *   **Site Key**: Public. Goes into your frontend code (`.env`).
    *   **Secret Key**: Private. Goes into the Firebase Console.

#### Phase 2: Configure Firebase (Firebase Console)
Link the secret key to your Firebase project.

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select your project (Staging or Prod).
3.  Navigate to **Build** -> **App Check**.
4.  Click **Get Started** (if it's your first time).
5.  **Register your Web App**:
    *   Find your web app in the list.
    *   Click **Register** (or the reCAPTCHA icon).
    *   Select **reCAPTCHA v3**.
    *   Paste the **Secret Key** (from Phase 1).
    *   Click **Save**.

#### Phase 3: Update Environment Variables (Frontend)
Your frontend needs the **Site Key** to initialize the provider.

1.  Open your `.env` file (or `.env.staging` / `.env.production`).
2.  Update the variable:
    ```bash
    VITE_RECAPTCHA_SITE_KEY=your_copied_site_key_here
    ```
3.  **Deploy**: When you deploy to Firebase Hosting, this key will be baked into the build.

#### Phase 4: Enforcement Settings
Controls whether requests are actually blocked.

*   **Staging**:
    *   In Firebase Console -> App Check -> **APIs** tab.
    *   Expand **Cloud Firestore** and **Cloud Functions**.
    *   You can leave enforcement **OFF** initially to monitor traffic.
*   **Production**:
    *   Once you see verify successful traffic in the "Metrics" tab, turn enforcement **ON** in the Console.

> **Note**: For Staging, you strictly *do not* need to enable the "Enforcement" switch in the UI if the code handles it, but enabling it in "Unenforced Mode" gives you visibility into % of verified traffic.

### SDK Version & Testing
> **Info**: We use a `CustomProvider` in `frontend/src/services/firebase.js` to mock App Check on localhost. This works around issues with `connectAppCheckEmulator` in recent Firebase SDK versions.
>
> **CI Note**: In the `e2ee-auditor` workflow, we temporarily overwrite `firestore.rules` with permissive rules. This is because the App Check Emulator does not reliably start in "Demo Project" mode, preventing Firestore from verifying the local tokens.
