# Decide-O-Mat

Decide-O-Mat is a minimalist, highly scalable web application designed to facilitate collaborative decision-making through a pro/con list mechanism. It functions similarly to "Doodle" but for weighing options rather than scheduling.

## Documentation Index

Navigate the project documentation:

- **[Product Vision](PRODUCT.md)**  
  Detailed functional and non-functional requirements, defining the "what" and "why" of the application.

- **[Roadmap](ROADMAP.md)**  
  The project's evolution plan, tracking versions from MVP (v1.0) to future enhancements like authentication and multi-option decisions.

- **[Architecture](ARCHITECTURE.md)**  
  System design overview, technology stack (React + Cloud Functions + Firestore), data models, and scalability considerations.

- **[Release Process](RELEASE.md)**  
  Guide on how to release new versions, including semantic versioning rules and the automated GitHub Actions workflow.

- **[Changelog](CHANGELOG.md)**  
  History of all notable changes, features, and bug fixes for each released version.

## Development Workflow

### Environments

We use a multi-stage environment setup to ensure stability:

1.  **Local Development**:
    *   **Frontend**: Runs locally via Vite (`npm run dev`). Connects to Firebase Emulators for data.
    *   **Backend**: Runs locally via Firebase Emulators (`firebase emulators:start`).
    *   **Config**: Uses `.env.local` for initialization credentials (safe to use Staging credentials here).

2.  **Staging (`staging`)**:
    *   **Trigger**: Automatically deployed on every push to the `main` branch.
    *   **Purpose**: Integration testing and verification in a live environment.
    *   **URL**: `https://decide-o-mat-staging.web.app`

3.  **Production (`prod`)**:
    *   **Trigger**: Automatically deployed when a version tag (e.g., `v1.2.0`) is pushed.
    *   **Purpose**: Live application for end users.
    *   **URL**: `https://decide-o-mat.web.app`
45: 
46: ### Service Account Permissions

### Service Account Permissions

The Service Account used for GitHub Actions deployments (`FIREBASE_SERVICE_ACCOUNT`) requires the following Google Cloud IAM roles:

*   **Cloud Functions Admin** (`roles/cloudfunctions.admin`): To deploy functions.
*   **Firebase Hosting Admin** (`roles/firebasehosting.admin`): To deploy hosting sites.
*   **Firebase Rules Admin** (`roles/firebaserules.admin`): To deploy/test security rules.
*   **Firebase Extensions Viewer** (`roles/firebaseextensions.viewer`): To list installed extensions during deploy.
*   **Service Account User** (`roles/iam.serviceAccountUser`): To act as the runtime service account.
*   **API Keys Viewer** (`roles/serviceusage.apiKeysViewer`): (Optional) To view API keys during deploy.

### Setup for New Developers

1.  **Prerequisites**:
    *   Node.js (v20+)
    *   Firebase CLI (`npm install -g firebase-tools`)
    *   Java (for Firebase Emulators)

2.  **Clone & Install**:
    ```bash
    git clone <repository-url>
    cd decide-o-mat
    cd frontend && npm install
    cd ../functions && npm install
    ```

3.  **Configure Environment**:
    *   Create `frontend/.env.local`.
    *   Populate it with **Staging** project credentials (ask a team member or get them from the Firebase Console > Project Settings).
    *   *Note: These are only used to initialize the SDK. Local development connects to emulators.*

    ```env
    VITE_FIREBASE_API_KEY=...
    VITE_FIREBASE_AUTH_DOMAIN=...
    VITE_FIREBASE_PROJECT_ID=...
    VITE_FIREBASE_STORAGE_BUCKET=...
    VITE_FIREBASE_MESSAGING_SENDER_ID=...
    VITE_FIREBASE_APP_ID=...
    VITE_FIREBASE_MEASUREMENT_ID=...
    ```

4.  **Start Development Server**:
    *   **Terminal 1 (Emulators)**:
        ```bash
        firebase emulators:start
        ```
    *   **Terminal 2 (Frontend)**:
        ```bash
        cd frontend
        npm run dev
        ```

## Development Resources

Directories containing detailed development artifacts:

- **[User Stories](stories/)**  
  Detailed descriptions of user requirements and acceptance criteria for each feature.

- **[Implementation Plans](plans/)**  
  Technical design documents and step-by-step plans created *before* implementation begins.

- **[Implementation Notes](implementations/)**  
  Records of what was actually implemented, including troubleshooting notes, bug fixes, and deviations from the original plans.
