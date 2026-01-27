---
name: pr
description: Format PR titles with prefixes. Use when creating PRs.
---

# Pull Requests

This skill defines conventions for creating well-structured Pull Requests. PRs should be small, focused, and clearly communicate what changed and why.

## Overview

PRs are typically squash-merged, so the PR title becomes the commit message. Prefixes categorize changes for readable history and filtering.

## Prefixes

THE PR titles SHALL use one of these prefixes (lowercase, 4 chars):

- `[feat]` - New functionality users can see or use
- `[bugs]` - Bug fixes in application code (src/)
- `[refa]` - Code restructuring, cleanup, renaming
- `[deps]` - Dependency updates
- `[tool]` - CI, config, tooling, dev setup, tests

THE prefix SHALL be lowercase.

THE prefix SHALL be enclosed in square brackets.

## Title Format

THE PR title SHALL follow the format `[Prefix] Area/Thing: Imperative Action`.

THE Area/Thing SHALL identify the component, module, or domain being changed.

THE Imperative Action SHALL describe what the change does.

THE description SHALL start with a capital letter.

THE description SHALL use imperative mood (add, fix, update, not added, fixed, updated).

THE PR title SHALL be concise (under 72 characters total).

THE PR title SHALL NOT end with a period.

### Examples

```
[feat] Keyboard Navigation: Add support for intraday page
[bugs] Date Redirect: Handle null values
[refa] Frontend Architecture: Convert to functional patterns
[deps] Cargo: Update dependencies (non-major)
[tool] GitHub Actions: Add CI workflow
```

## Prefix Selection

WHEN adding new user-facing functionality THE PR title SHALL use `[feat]`.

WHEN fixing broken behavior in application code (src/) THE PR title SHALL use `[bugs]`.

WHEN restructuring code without changing behavior THE PR title SHALL use `[refa]`.

WHEN updating dependencies THE PR title SHALL use `[deps]`.

WHEN changing CI, tooling, config, tests, or dev setup THE PR title SHALL use `[tool]`.

WHEN fixing CI, tooling, or config issues THE PR title SHALL use `[tool]` not `[bugs]`.

## Description Structure

THE PR description SHALL answer two questions: What change is being made and Why are these changes being made.

### What Section

THE description SHALL use bulleted imperatives to list changes.

THE description SHALL give readers a sense of what is changing without needing to read the entire code.

THE description SHALL list key modifications, new functionality, or behavior changes.

THE bullets SHALL use imperative mood without periods.

THE bullets SHALL be concise and action-oriented.

**Example:**

```
## What

- Add OAuth authentication flow
- Create login page with Google sign-in
- Store tokens in secure cookies
```

### Why Section

THE description SHALL use bulleted reasons to explain the motivation.

THE description SHALL explain the context the author had when making the change.

THE description SHALL document decisions that aren't reflected in the source code.

THE description SHALL explain the problem being solved or motivation for the change.

THE bullets SHALL be concise and focus on reasoning.

WHERE tradeoffs exist THE description SHALL include them.

WHERE limitations exist THE description SHALL acknowledge them.

WHERE alternative approaches were considered THE description SHALL mention them.

WHERE relevant THE description SHALL reference related issues, bug numbers, or design documents.

**Example:**

```
## Why

- Users need a secure way to authenticate without managing passwords
- OAuth reduces security risk compared to storing credentials
- Google is the primary identity provider for our user base
```

### Preview Section (Woodpecker Repos Only)

WHEN a repo uses Woodpecker CI for deployment THE description SHALL include a Preview section.

THE Preview section SHALL appear after the Why section.

THE Preview section SHALL contain a single URL where the PR can be previewed.

THE URL format SHALL be `https://{repo_name}-{pr_number}.jruz.io`.

In the case WHERE the repo name is `jruz.io` THE URL format SHALL be `https://www-{pr_number}.jruz.io`.

THE PR number SHALL be obtained from the PR creation response or determined after PR creation.

WHEN creating the PR THE assistant SHALL update the description with the correct preview URL after the PR number is known.

**Example:**

```
## Preview

- https://trader-45.jruz.io
```

### Collaborative Description Writing

WHEN creating a PR description THE developer MAY provide sparse reasoning.

WHEN sparse reasoning is provided THE assistant SHALL expand it into a detailed "Why" section.

THE assistant SHALL present the expanded version to the developer for confirmation.

THE assistant SHALL NOT finalize the description without developer confirmation.

THE developer MAY correct or refine the expanded version before finalizing.

## What NOT to Include

THE description SHALL NOT include:

- Summary sections
- Test plan sections
- Testing checklists
- Implementation details (HOW it was done)

THE description explains WHAT and WHY, not HOW to test or implement.

## PR Size

THE PR SHALL be kept small to enable effective code review.

THE PR size SHOULD be around 100 lines of substantive changes.

THE PR size SHOULD NOT exceed 1000 lines except in rare circumstances.

WHERE a PR exceeds reasonable size THE reviewer MAY reject it and request it be split.

THE PR SHALL represent one self-contained change addressing a single concern.

WHERE multiple concerns exist THE developer SHALL split them into separate PRs.

### Single Concern Principle

Each PR must address ONE self-contained change.

Do NOT bundle unrelated changes:

- Bad: "Replace Node.js with Bun" + remove unused tools + fix clippy lint
- Good: "Replace Node.js with Bun" (one focused change)

If title doesn't reflect all changes, the PR must be split.

### Strategies for Splitting Large Changes

WHERE a feature is too large for one PR THE developer SHALL use one of these strategies:

**Stacking**: Submit one small PR for review, then create the next PR based on the first.

**By files**: Separate changes that affect different files or modules into separate PRs.

**Horizontal splitting**: Create shared abstractions or infrastructure in one PR, then use them in subsequent PRs.

**Vertical splitting**: Implement self-contained sub-features in separate PRs.

WHERE refactoring is needed THE developer SHALL submit refactoring in a separate PR before feature changes.

WHERE tests need improvement THE developer SHALL submit test improvements in a separate PR before refactoring.

### Exceptions to Size Limits

THE following changes MAY exceed normal size limits:

- **File deletions**: Removing entire files is quick to review regardless of line count.
- **Automated refactoring**: Tool-generated changes where review validates intent, not individual lines.

## GitHub

WHEN creating a PR on GitHub THE assistant SHALL use the `gh` CLI.

THE assistant SHALL push the branch to remote BEFORE creating the PR.

```bash
git push -u origin branch-name
```

THE assistant SHALL use HEREDOC syntax for the body to preserve formatting.

**Example:**

```bash
gh pr create --title "[bugs] Auth: Handle expired tokens" --body "$(cat <<'EOF'
## What

- Add token refresh logic
- Handle expiration gracefully

## Why

- Users were getting logged out unexpectedly
- Tokens expire after 24 hours

## Preview

https://myapp-123.jruz.io
EOF
)"
```

NOTE: For Woodpecker repos, the PR number is not known until after creation. The assistant SHOULD create the PR first, then update the description with the correct preview URL using `gh pr edit`.

THE assistant SHALL use `gh pr view --web` to open the PR in browser if requested.

## Codeberg

WHEN creating a PR on Codeberg THE assistant SHALL use the Codeberg API via curl.

THE assistant SHALL push the branch to remote BEFORE creating the PR.

```bash
git push -u origin branch-name
```

THE assistant SHALL use the CODEBERG_TOKEN environment variable for authentication.

THE API endpoint is `https://codeberg.org/api/v1/repos/{owner}/{repo}/pulls`.

**Example:**

```bash
curl -s -X POST "https://codeberg.org/api/v1/repos/owner/repo/pulls" \
  -H "Authorization: token $CODEBERG_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$(cat <<'EOF'
{
  "title": "[bugs] Auth: Handle expired tokens",
  "head": "bugs-auth",
  "base": "main",
  "body": "## What\n\n- Add token refresh logic\n- Handle expiration gracefully\n\n## Why\n\n- Users were getting logged out unexpectedly\n- Tokens expire after 24 hours\n\n## Preview\n\nhttps://myapp-123.jruz.io"
}
EOF
)"
```

THE assistant SHALL extract and display the PR URL from the API response.

NOTE: For Woodpecker repos, the assistant SHALL extract the PR number from the API response and update the description with the correct preview URL using the PATCH endpoint.

**Example (updating PR body after creation):**

```bash
curl -s -X PATCH "https://codeberg.org/api/v1/repos/owner/repo/pulls/{pr_number}" \
  -H "Authorization: token $CODEBERG_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"body": "... updated body with correct preview URL ..."}'
```

## Quick Reference

### Title Pattern

`[Prefix] Area/Thing: Imperative Action`

### Required Description Sections

1. **What** - Bulleted imperatives describing changes
2. **Why** - Bulleted reasons explaining motivation
3. **Preview** - Deployed URL (Woodpecker repos only): `https://{repo}-{pr_number}.jruz.io`

### Key Principles

- One PR = One concern
- Target ~100 lines, max 1000 lines
- Use prefixes: feat, bugs, refa, deps, tool
- Imperative mood, under 72 chars, no period
- Split large changes into smaller PRs
