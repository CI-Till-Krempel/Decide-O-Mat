# US-009: User Identification

## Description
As a user, I want to identify myself with a name so that my contributions (arguments and votes) can be recognized by others.

## Acceptance Criteria
1.  **Name Prompt**: When a user first interacts (votes or adds argument), prompt them for a display name if not set.
2.  **Persistence**: The name is saved locally (localStorage) and used for future sessions.
3.  **Edit Name**: Users can edit their display name at any time.
4.  **Visualization**:
    *   Show "Added by [Name]" on arguments.
    *   Show user avatars/initials or names next to votes (chips) if possible, or just a list of voters.

## Technical Notes
-   Store `displayName` in `localStorage`.
-   Include `authorName` in `arguments` documents.
-   Update `voteArgument` to optionally store who voted (might need schema change to track *who* voted for what, currently just counts).
