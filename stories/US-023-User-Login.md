# US-023: User Login & Registration

## Description
As a user, I want to create an account or log in so that I can persist my identity across devices and access my decision history.

## Acceptance Criteria
- [ ] Users can sign in using **Google** (OAuth).
- [ ] Users can sign in using **Email/Password**.
- [ ] New users can **Register** via Email/Password.
- [ ] Validations for email format and password strength exist.
- [ ] "Forgot Password" flow is available for email users.
- [ ] Users can **Logout** from the application.
- [ ] Upon login, any anonymous data (current session) is merged or associated with the logged-in account (if possible/safe, or prompt user).
- [ ] The header reflects the logged-in state (User Avatar/Name).

## Technical Notes
- Use Firebase Authentication.
- Existing anonymous users should be upgraded/linked if possible (Firebase `linkWithCredential`).
