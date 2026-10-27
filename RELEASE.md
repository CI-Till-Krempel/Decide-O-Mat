# Release Process

This document outlines the process for releasing new versions of **Decide-O-Mat**.

## Versioning Strategy

We follow [Semantic Versioning 2.0.0](https://semver.org/): `MAJOR.MINOR.PATCH`.

- **MAJOR**: Incompatible API changes.
- **MINOR**: Backward-compatible functionality (new features).
- **PATCH**: Backward-compatible bug fixes.

## Changelog

We maintain a `CHANGELOG.md` file following the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) convention.

### Format
Each version should have a section with the version number and date:
```markdown
## [1.3.0] - 2025-12-02
### Added
- New feature description
### Fixed
- Bug fix description
```

## Environment Protection

To prevent unauthorized or accidental deployments to production, we use **GitHub Environment Protection Rules**.

### Configuration (One-Time Setup)
1.  Go to the GitHub Repository **Settings**.
2.  Navigate to **Environments** in the sidebar.
3.  Click on **PRODUCTION** (this environment is created automatically by the workflow).
4.  Enable **Required Reviewers**:
    - Check the box.
    - Add trusted team members (or yourself) as reviewers.
5.  (Optional) Enable **Deployment Branches**:
    - Restrict deployment to the `main` branch or tags matching `v*` (e.g., `v1.0.0`).

**Effect:** When the `deploy-prod` job is triggered, it will pause and wait for manual approval from a reviewer before proceeding.

## How to Create a Release

The release process is automated using GitHub Actions. To trigger a release, follow these steps:

1.  **Generate Announcement**:
    - Create a blog post in `announcements/vX.Y.md`.
    - Outline new features and future plans.

2.  **Update Changelog**:
    - Add a new section in `CHANGELOG.md` for the new version.
    - Move "Unreleased" items to this new section.
    - Ensure the date is correct (YYYY-MM-DD).

3.  **Bump Version**:
    - Update the `version` field in `frontend/package.json`.
    - (Optional) Update `functions/package.json` if backend changes were made.

4.  **Commit Changes**:
    ```bash
    git add CHANGELOG.md frontend/package.json
    git commit -m "chore: bump version to x.y.z"
    git push origin main
    ```

5.  **Tag and Push**:
    Create a git tag matching the version number (must start with `v`).
    ```bash
    git tag vx.y.z
    git push origin vx.y.z
    ```

6.  **Automation**:
    - The GitHub Action `release.yml` will automatically trigger.
    - It will extract the release notes from `CHANGELOG.md`.
    - It will create a GitHub Release with the corresponding tag and notes.

## Automated Security Patch Releases

The **Security Agent** (`.github/workflows/security-agent.yml`) runs every weekday at 04:00 UTC to keep dependencies and security patches up to date:

1.  **Triage & Merge**: Gemini CLI (running with a read-only token) evaluates open Dependabot PRs and security alerts. A deterministic merge gate (`.github/scripts/security-merge-gate.mjs`) verifies that approved PRs are authored by Dependabot, have all checks green, and are patch/minor updates (or `*-minor-patch` groups / `devDependency` updates) before merging up to 5 PRs.
2.  **Release PR & Tag**: When at least one PR is merged, the `release` job runs `.github/scripts/security-release.mjs` to bump the patch version across `frontend/` and `functions/` (`package.json` and `package-lock.json`) and add a `### Security` section to `CHANGELOG.md`. It opens a `release/vX.Y.Z` PR, waits for all checks to pass, squash-merges it, and pushes tag `vX.Y.Z` using the GitHub App token.
3.  **Staging & Production Deployment**: Pushing to `main` deploys to **Staging** automatically. Pushing tag `vX.Y.Z` triggers `release.yml` (GitHub Release) and `deploy.yml` (`deploy-prod`), which waits for maintainer approval in the **PRODUCTION** GitHub Environment.

### Required GitHub App Permissions (`GEMINI_APP`)
To allow the Security Agent to read alerts, merge Dependabot PRs (including workflow updates), and trigger tag workflows, the GitHub App configured via `GEMINI_APP_ID` / `GEMINI_APP_PRIVATE_KEY` requires:
- **Repository permissions**:
  - `Contents`: Read and write
  - `Pull requests`: Read and write
  - `Issues`: Read and write
  - `Workflows`: Read and write *(required to merge `github-actions` Dependabot PRs)*
  - `Checks`: Read-only
  - `Commit statuses`: Read-only
  - `Dependabot alerts`: Read-only
  - `Code scanning alerts`: Read-only
  - `Secret scanning alerts`: Read-only
- **Branch protection**: If `main` requires approving reviews, add `GEMINI_APP` to the ruleset bypass list so it can merge verified Dependabot PRs and its own `release/vX.Y.Z` PR.

## Manual Release (Fallback)

If the automation fails, you can manually create a release in the GitHub UI:
1.  Go to "Releases" > "Draft a new release".
2.  Choose the tag `vx.y.z`.
3.  Paste the relevant section from `CHANGELOG.md` into the description.
4.  Publish the release.
