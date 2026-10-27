# IMP-SEC-001: Daily Gemini CLI Security Agent

- **Date**: 2026-10-27
- **Status**: Implemented
- **Workflow**: `.github/workflows/security-agent.yml`
- **Scripts**: `.github/scripts/security-merge-gate.mjs`, `.github/scripts/security-release.mjs`
- **Tests**: `.github/scripts/security-merge-gate.test.mjs`, `.github/scripts/security-release.test.mjs`

## Why

Security alerts and Dependabot PRs accumulate quickly across `frontend`, `functions`, and GitHub Actions. Most are routine patch/minor updates whose CI checks already pass, yet manually reviewing, merging, bumping versions, updating `CHANGELOG.md`, and cutting tags delays security fixes. At the same time, giving an LLM unrestricted write credentials to merge PRs and tag releases poses a prompt-injection risk because Dependabot PR bodies include upstream release notes and commit messages from third parties.

## Design Decisions

### 1. Privilege Separation: Read-Only LLM + Deterministic Gate
- **Gemini CLI runs with a read-only GitHub App token** (`contents: read`, `pull-requests: read`, `checks: read`) and a restricted tool allowlist (`cat`, `jq`, `tee`, `ls`, `grep`, `head`, `tail`, `gh pr view/diff/checks/list`). Even if upstream release notes contain a prompt injection payload, the agent process cannot merge PRs, push commits, or modify issues.
- Gemini writes its proposals to `.security-agent/decisions.json` and a human-readable `.security-agent/report.md`.
- `.github/scripts/security-merge-gate.mjs` re-validates every proposed PR against deterministic rules before any merge occurs:
  - Author must be `app/dependabot` / `dependabot[bot]`.
  - PR is not a draft, `mergeable === "MERGEABLE"`, and every check in `statusCheckRollup` succeeded (or was skipped/neutral).
  - Title matches a standard single-package bump (`patch` or `minor`, or `major` only for `devDependencies` outside root) or a `*-minor-patch` Dependabot group.
  - Merges use `gh pr merge --squash --match-head-commit <sha>` so a race condition pushing a new commit after check evaluation is rejected.
  - Capped at 5 merges per run; conflicting PRs receive `@dependabot rebase` for the next run.

### 2. Deterministic Patch Release via Release PR + GitHub App Tag Push
- The `release` job contains no LLM logic. `.github/scripts/security-release.mjs` bumps the patch version in `frontend/` and `functions/` (`package.json` and `package-lock.json`), collapses any duplicate top-level `version` keys, and inserts a new `## [X.Y.Z] - YYYY-MM-DD` section with sanitised PR titles under `### Security` in `CHANGELOG.md`.
- Because `main` is branch-protected, the version bump is committed to `release/vX.Y.Z`, opened as a PR (labeled `release`, `security`, `NO_REVIEW`), verified via `gh pr checks --watch` and `checksGreen`, and squash-merged.
- The tag `vX.Y.Z` is pushed using the **GitHub App token** (`GEMINI_APP_ID` / `GEMINI_APP_PRIVATE_KEY`) rather than `GITHUB_TOKEN`. Events triggered by `GITHUB_TOKEN` do not start other workflows; using the App token ensures pushing `vX.Y.Z` triggers both:
  - `release.yml` (creates the GitHub Release from `CHANGELOG.md`), and
  - `deploy.yml` (`deploy-prod` job, which pauses for maintainer approval in the `PRODUCTION` GitHub Environment).

### 3. Fix Duplicate Version in `functions/package.json`
- `functions/package.json` previously contained two top-level `"version"` keys (`"2.0.0"` on line 3 and `"1.6.7"` on line 30), causing `JSON.parse` and `npm` to resolve the version as `1.6.7`. We removed the duplicate key and aligned `functions/package-lock.json` to `2.0.0`.
- `setPackageVersion` in `security-release.mjs` parses and re-serializes `package.json`, preventing duplicate keys from recurring.

### 4. Dependabot Minor/Patch Grouping
- Updated `.github/dependabot.yml` to group `minor` and `patch` updates per ecosystem (`frontend-minor-patch`, `functions-minor-patch`, `actions-minor-patch`), reducing PR churn and rebase cascades while keeping major updates isolated for manual review.
