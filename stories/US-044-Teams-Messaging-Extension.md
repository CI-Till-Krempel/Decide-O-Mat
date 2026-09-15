# User Story: Teams Messaging Extension & Link Unfurling

**As a** Teams chat participant  
**I want to** create and share decisions directly from the chat compose box and have pasted Decide-O-Mat links automatically expand into informative cards  
**So that** I can initiate quick team votes without switching apps or manually copying and pasting summaries.

## Acceptance Criteria

### Messaging Extension (Compose Action & Search)
1. **Compose Box Action**:
   - Clicking the Decide-O-Mat icon in the Teams message formatting bar opens a lightweight creation dialog (Task Module).
   - The user enters a question/topic and optional initial pro/con arguments.
   - Submitting the dialog posts an interactive Decision Hero card into the active channel or chat.
2. **Search Extension**:
   - Typing `@Decide-O-Mat <keyword>` in the compose box allows searching through the user's active decisions and inserting a selected card into the conversation.

### Link Unfurling (Smart Card Expansion)
3. **Link Recognition**:
   - When a user pastes a Decide-O-Mat URL (e.g., `https://decide-o-mat.web.app/decision/<id>`) into a Teams chat, Teams automatically queries the bot backend (`composeExtension/queryLink`).
4. **Adaptive Card Preview**:
   - The link unfurls into an Adaptive Card showing:
     - Decision Question / Title.
     - Current Status (Open / Closed) and Participant Count.
     - Net Score and Yes/No progress bar.
     - Direct "Open Decision" action button.
5. **E2EE Privacy Guard**:
   - If a link contains an E2EE decryption key (`#key=...`), the server-side bot does NOT receive the key (hash fragments are client-only). The unfurled card displays an encrypted placeholder ("Encrypted Decision - Click to Open & Decrypt") preserving strict zero-knowledge confidentiality.

## Technical Notes
- **Azure Bot Service Endpoint**:
  - `POST /api/teams/messages` webhook configured in Azure Bot Framework.
- **Payload Format**: Adaptive Cards JSON Schema (v1.5).

## Implementation Plan
- [IMP-044-Teams-Messaging-Extension](../plans/IMP-044-Teams-Messaging-Extension.md)
