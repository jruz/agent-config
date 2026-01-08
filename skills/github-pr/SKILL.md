---
name: github-pr
description: Format PR titles with proper prefixes (Feat, Fix, Refactor, Deps, Tools). Use when creating or modifying PRs.
---

# GitHub PR

This skill defines conventions for creating well-structured GitHub Pull Requests. PRs should be small, focused, and clearly communicate what changed and why.

## Overview

PRs are typically squash-merged, so the PR title becomes the commit message. Prefixes categorize changes for readable history and filtering.

## Prefixes

THE PR titles SHALL use one of these prefixes:

- `[Feature]` - New functionality users can see or use
- `[Fix]` - Bug fixes in application code (src/)
- `[Refactor]` - Code restructuring, cleanup, renaming
- `[Deps]` - Dependency updates
- `[Tools]` - CI, config, tooling, dev setup, tests

THE prefix SHALL be capitalized.

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
[Feature] Keyboard Navigation: Add support for intraday page
[Fix] Date Redirect: Handle null values
[Refactor] Frontend Architecture: Convert to functional patterns
[Deps] Cargo: Update dependencies (non-major)
[Tools] GitHub Actions: Add CI workflow
```

## Prefix Selection

WHEN adding new user-facing functionality THE PR title SHALL use `[Feature]`.

WHEN fixing broken behavior in application code (src/) THE PR title SHALL use `[Fix]`.

WHEN restructuring code without changing behavior THE PR title SHALL use `[Refactor]`.

WHEN updating dependencies THE PR title SHALL use `[Deps]`.

WHEN changing CI, tooling, config, tests, or dev setup THE PR title SHALL use `[Tools]`.

WHEN fixing CI, tooling, or config issues THE PR title SHALL use `[Tools]` not `[Fix]`.

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
- ❌ Bad: "Replace Node.js with Bun" + remove unused tools + fix clippy lint
- ✓ Good: "Replace Node.js with Bun" (one focused change)

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

## Quick Reference

### Title Pattern
`[Prefix] Area/Thing: Imperative Action`

### Required Description Sections
1. **What** - Bulleted imperatives describing changes
2. **Why** - Bulleted reasons explaining motivation

### Key Principles
- One PR = One concern
- Target ~100 lines, max 1000 lines
- Use prefixes: Feature, Fix, Refactor, Deps, Tools
- Imperative mood, under 72 chars, no period
- Split large changes into smaller PRs
