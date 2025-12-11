# US-022: Magic Link Identity Transfer

**Role**: Anonymous User
**Goal**: I want to transfer my anonymous profile to another device so I can continue participating without starting over.

## Acceptance Criteria

### 1. Generate Magic Link
- [ ] In the settings/footer, there is a "Transfer Identity" button.
- [ ] Clicking it calls the backend to generate a **Custom Auth Token**.
- [ ] The app displays a link: `.../magic?token=...`.
- [ ] I can copy this link.

### 2. Consume Magic Link
- [ ] When I open this link on a new device (Device B), the app detects the `token` param.
- [ ] The app calls `signInWithCustomToken()`.
- [ ] Device B is now authenticated as the same UID.
- [ ] Update `localStorage` Display Name if possible (or user just re-enters name, as encrypted data is on Device A - actually, we might want to sync the encrypted name to the server user profile eventually, but for now re-entry is acceptable for MVP).

### 3. Security
- [ ] The link should ideally be short-lived or use a signature to prevent easy forgery (optional for MVP but recommended).
- [ ] Warning displayed to user not to share this link publicly.

## Technical Notes
- Create a specific route `/magic` or handle globally in `App.jsx`.
- Update `localStorage` upon successful processing.
