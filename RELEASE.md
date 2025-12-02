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

## How to Create a Release

The release process is automated using GitHub Actions. To trigger a release, follow these steps:

1.  **Update Changelog**:
    - Add a new section in `CHANGELOG.md` for the new version.
    - Move "Unreleased" items to this new section.
    - Ensure the date is correct (YYYY-MM-DD).

2.  **Bump Version**:
    - Update the `version` field in `frontend/package.json`.
    - (Optional) Update `functions/package.json` if backend changes were made.

3.  **Commit Changes**:
    ```bash
    git add CHANGELOG.md frontend/package.json
    git commit -m "chore: bump version to x.y.z"
    git push origin main
    ```

4.  **Tag and Push**:
    Create a git tag matching the version number (must start with `v`).
    ```bash
    git tag vx.y.z
    git push origin vx.y.z
    ```

5.  **Automation**:
    - The GitHub Action `release.yml` will automatically trigger.
    - It will extract the release notes from `CHANGELOG.md`.
    - It will create a GitHub Release with the corresponding tag and notes.

## Manual Release (Fallback)

If the automation fails, you can manually create a release in the GitHub UI:
1.  Go to "Releases" > "Draft a new release".
2.  Choose the tag `vx.y.z`.
3.  Paste the relevant section from `CHANGELOG.md` into the description.
4.  Publish the release.
