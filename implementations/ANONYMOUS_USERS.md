# Anonymous Users & Identity Strategy

## 1. Overview
This document outlines the strategy for handling anonymous users in Decide-O-Mat. The goal is to provide a seamless, robust experience for users who do not wish to create an account, while ensuring data integrity (one vote per person) and compatibility with End-to-End Encryption (E2E).

## 2. Core Concepts

### 2.1. Identity Strategy: Firebase Anonymous Auth
Instead of maintaining a custom `localStorage` UUID, we will leverage **Firebase Authentication**'s `signInAnonymously` feature.

- **Mechanism**:
    - When a user visits without a session, we call `signInAnonymously()`.
    - This provisions a real Firebase `uid` and a secure session token.
- **Benefits**:
    - **Uniformity**: Both "Anonymous" and "Logged In" users have a `request.auth.uid` in Firestore rules.
    - **Security**: Eliminates the need to send custom `participantId` in payloads; the backend extracts it from the Auth Token.
    - **Persistence**: Firebase SDK handles token persistence/refresh in IndexedDB/localStorage automatically.

### 2.2. Data Privacy & E2E Integration
- The `uid` (Anonymous or Real) is known to the server (Metadata).
- The `DisplayName` is **Encrypted** on the client side before being stored.
- **Vote Integrity**: The server uses `request.auth.uid` to enforce "One Vote Per User".

### 2.3. Identity Portability (Magic Links)
To transfer this Anonymous `uid` to another device:

- **Concept**: A "Magic Link" that contains a temporary **Custom Authentication Token**.
- **Flow**:
    1.  User clicks "Link Device" -> Backend generates a Firebase Custom Token for the current `uid`.
    2.  Link: `https://decide-o-mat.com/magic?token={CustomToken}`.
    3.  Device B opens link -> `signInWithCustomToken(token)`.
    4.  Device B is now logged in as the same Anonymous User.

## 3. Implementation Details

### Backend (Cloud Functions)
- **`generateMagicLink`**: An HTTPS Callable function.
    - Checks if user is authenticated (can be anonymous).
    - Uses `admin.auth().createCustomToken(uid)` to generate a token.
    - Returns the token (or full URL).
- **Vote Triggers/Rules**:
    - Update Security Rules to allow write `if request.auth.uid == userId`.
    - Cloud Functions (if used for complex logic) verify `context.auth.uid`.

### Frontend
- **Boot Logic**:
    - `onAuthStateChanged`: If no user, trigger `signInAnonymously()`.
- **Magic Link Route**:
    - Extract `token` query param.
    - Call `signInWithCustomToken(auth, token)`.


## 4. Trade-offs

| Feature | Benefit | Trade-off / Risk | Mitigation |
| :--- | :--- | :--- | :--- |
| **ParticipantId** | No login required; frictionless. | Users can "reset" identity by clearing cache (allow multiple votes). | Acceptable risk for "casual" decisions. |
| **Magic Links** | Allows device switching without accounts. | Link theft allows identity theft. | Links should be short-lived or explicitly generated for one-time use. |
| **Server Visibility** | Server enforces uniqueness. | Server can build a metadata graph of "User X joined Decision A and B". | Minimize stored metadata; privacy policy disclosure. |
