# Implementation Notes - CI: Deploy Concurrency Control

**Date:** 2026-09-14

## Context
When multiple pull requests are merged in rapid succession to `main`, GitHub Actions triggers concurrent runs of the `Deploy` workflow. In Firebase App Hosting, starting a rollout while another rollout/build is already active on the same backend (`decide-o-mat-staging`) causes the Firebase API to reject the operation with:
```
HTTP Error: 409, unable to queue the operation
```
Because the step failed, the subsequent deployment steps (such as Cloud Functions and Firestore rules deployment) were skipped for those runs, leaving pending changes undeployed.

## Technical Decisions & Reasoning

### 1. Job-Level Concurrency in Deploy Workflow
- **File:** [.github/workflows/deploy.yml](file:///Users/tkrempel/Documents/Antigravity/Decide-O-Mat/.github/workflows/deploy.yml)
- **Decision:** Add job-level `concurrency` to `deploy-staging` and `deploy-prod`:
  ```yaml
  concurrency:
    group: deploy-staging
    cancel-in-progress: false
  ```
  and
  ```yaml
  concurrency:
    group: deploy-prod
    cancel-in-progress: false
  ```
- **Reasoning:**
  - **Job-level over workflow-level:** Placing concurrency at the job level allows the initial `build` job (linting, tests, build) to continue running concurrently across multiple commits for rapid validation and status reporting. Only the deployment jobs that interact with shared Firebase environments are serialized.
  - **`cancel-in-progress: false`:** Cancelling an in-progress deployment job mid-execution could abort the runner while Cloud Build / App Hosting or Cloud Functions deployment is actively executing on Google Cloud, leaving resources in an inconsistent state and causing immediately queued jobs to still clash with the lingering cloud operation. By allowing the active deployment to finish cleanly, queued jobs proceed safely once the environment is idle.

## Verification
- Validated YAML syntax in [.github/workflows/deploy.yml](file:///Users/tkrempel/Documents/Antigravity/Decide-O-Mat/.github/workflows/deploy.yml).
- Ran all required linters (`frontend` and `functions`) and tests (`frontend`) according to the Lean Agentic Workflow checklist.
