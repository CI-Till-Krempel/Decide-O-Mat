# Agentic Development Workflow

This document outlines the "Lean Agentic Workflow" adopted for the development of Decide-O-Mat. The goal is to maintain high code quality, ensure stability, and facilitate effective collaboration between AI agents and human developers.

## Core Principles

1.  **Iterate in Small Steps**: Break down complex tasks into manageable, atomic units of work. Avoid "big bang" changes that are hard to debug and review.
2.  **Test Driven Development (TDD)**: Write tests *before* writing the implementation code. This ensures that requirements are clearly understood and that the code is testable by design.
3.  **Keep the Build Green**: Ensure that the project builds and tests pass at all times. **Never commit broken code.** Fix breakages immediately before proceeding to new features.
4.  **Ask for Clarification**: If a requirement is ambiguous or a technical blocker arises, stop and ask the human user for guidance. Do not make assumptions that could lead to wasted effort.

## Workflow Steps

### 1. Task Breakdown
- Analyze the user request.
- Break it down into small, verifiable tasks.
- Update the `task.md` file to reflect the current plan.

### 2. Implementation Cycle
- **Write Tests**: Create a failing test case that defines the desired behavior (Red).
- **Write Code**: Implement the minimum amount of code to make the test pass (Green).
- **Refactor**: Improve the code structure without changing behavior (Refactor).
- **Verify**: Run builds, tests, and linting immediately after changes.
    - `npm run build`
    - `npm test`
    - **LINTING IS MANDATORY**: You must run the linter in **BOTH** `frontend` and `functions` directories.
        - Run `cd frontend && npm run lint`
        - Run `cd functions && npm run lint`
    - **Pre-Commit Check**: Ensure ALL linters pass *before* adding or committing any code.
    - **Iterate**: If linting fails, fix the errors and run the linter again. Repeat until it passes completely. Do not assume one fix resolves all issues.

### 3. Version Control
- **Commit Frequently**: Commit code as soon as a small unit of work is stable and verified.
- **Commit Messages**: Use descriptive messages explaining *what* changed and *why*.

### 4. Documentation
- **Implementation Notes**: For every non-trivial task, create a technical note in the `implementations/` directory.
    - **Filename**: `[Story-ID]-[Description]-[Date].md` (e.g., `IMP-010-Auth-Integration-2025-12-02.md`).
    - **Content**: Explain *why* specific changes were made, technical reasoning, and deviations from the original plan. Focus on the "why", not just the "what".

### 5. Review Process
- **Pull Requests**: All changes should be submitted via Pull Requests (PRs) on GitHub.
- **Human Review**: The human user acts as the reviewer. The agent must address all feedback before merging.
- **Update Roadmap**: When creating a PR, check off the completed story or task list item in `ROADMAP.md` and mark it as done.
- **Branch Protection**: NEVER push directly to `main`. ALL changes must be merged via Pull Requests, without exception.

### 5.1 Issue Resolution Process
For work triggered by a GitHub Issue:
1.  **Fresh Branch**: Always create a fresh branch from `main` for the specific issue.
2.  **Implementation**: Follow the standard Implementation Cycle.
3.  **Pull Request**: Create a PR as usual.
4.  **Issue Comment**: After creating the PR, comment on the original Issue.
    - Mention the PR (e.g., "Fixed in PR #123").
    - Close the issue if applicable (or let the PR merge close it, but the comment is mandatory).

### 6. Release Preparation
- **Announcement Post**: For every major and minor release, generate a short blog post announcing the new version.
    - **Location**: `announcements/v[VERSION].md`
    - **Content**: Brief introduction, new features, and a teaser for the next version.

## Communication
- Use the `notify_user` tool to request reviews or ask questions.
- Be concise and specific in your communication.
