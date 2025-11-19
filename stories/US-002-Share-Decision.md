# User Story: Share Decision

**As a** host
**I want to** share the decision URL with others
**So that** they can participate in the decision-making process.

## Acceptance Criteria
1.  **Unique URL**: Each decision has a unique, unguessable URL (e.g., using a UUID or random string).
2.  **Copy to Clipboard**: The decision page has a "Copy Link" button that copies the current URL to the user's clipboard.
3.  **No Login**: Accessing the URL requires no authentication; possession of the link grants access.

## Technical Notes
- The URL ID should be the document ID from the database.
- Frontend: Use `navigator.clipboard.writeText()` for the copy functionality.
