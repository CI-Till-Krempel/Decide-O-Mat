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
    - `npm run lint` (Run in both `frontend` and `functions` directories)
- **Fix**: If verification fails, fix the issue immediately.

### 3. Version Control
- **Commit Frequently**: Commit code as soon as a small unit of work is stable and verified.
- **Commit Messages**: Use descriptive messages explaining *what* changed and *why*.

### 4. Review Process
- **Pull Requests**: All changes should be submitted via Pull Requests (PRs) on GitHub.
- **Human Review**: The human user acts as the reviewer. The agent must address all feedback before merging.
- **No Direct Merges**: Avoid pushing directly to the `main` branch for non-trivial changes.

## Communication
- Use the `notify_user` tool to request reviews or ask questions.
- Be concise and specific in your communication.
