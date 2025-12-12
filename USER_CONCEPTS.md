# User Concepts & Vote Integrity

This document explains the types of users in **Decide-O-Mat**, the authentication providers supported, and how these relate to the integrity of decision votes.

## User Types

### 1. Guest Users (Anonymous)
*   **Definition**: A user who accesses the application without signing in.
*   **Technical Implementation**: Uses Firebase Anonymous Authentication.
*   **Characteristics**:
    *   **Ephemeral-ish**: The account is tied to the specific browser instance.
    *   **Data Persistence**: Votes and created decisions are saved to the anonymous User ID (UID).
    *   **Risk**: If the user clears their browser data (localStorage/IndexedDB), the anonymous UID is lost, and they lose access to their previous votes and decisions.

### 2. Verified Users (Authenticated)
*   **Definition**: A user who has signed in using a permanent credential (Email/Password or Google).
*   **Characteristics**:
    *   **Persistent**: The account can be accessed from any device or browser.
    *   **Security**: Protected by credentials (password or OAuth).
    *   **Identity**: Can have a display name and profile picture (from Google).

## Supported Authentication Providers

1.  **Google Sign-In**:
    *   Uses OAuth 2.0.
    *   Automatically provides a verified email and profile picture.
    *   Recommended for ease of use.

2.  **Email & Password**:
    *   Standard registration flow.
    *   Requires a valid email address.
    *   Supports password reset functionality.

## Implications for Vote Integrity

The integrity of a decision relies on ensuring that **one person = one vote**.

### How We Handle Identity
*   **Unique ID (UID)**: Every vote is stamped with the voter's Firebase UID.
*   **Enforcement**: The backend database rules prevents multiple votes from the same UID on a single decision.

### Transitioning from Guest to Verified
When a Guest User chooses to sign up, they have two options which impact their data:

#### Option A: Create New Account (Default)
*   **Action**: User signs up *without* checking "Link to my current guest account".
*   **Result**:
    *   A **new** UID is generated.
    *   The previous Guest identity is effectively "left behind" in the browser history (unless they log out and the anon session persists, but usually it's replaced).
    *   **Vote Integrity**: The new user has 0 votes. They can vote again on decisions they previously voted on as a guest (technically a loophole, but acceptable for privacy/fresh start).

#### Option B: Link Account (Opt-In)
*   **Action**: User checks "Link to my current guest account" before signing up.
*   **Result**:
    *   The existing Guest UID is **promoted** to a Verified User.
    *   The UID remains the same.
    *   **Vote Integrity**: All previous votes are preserved. The user *cannot* vote again on decisions they already voted on, because their UID has not changed. This maintains the strictest continuity of identity.
