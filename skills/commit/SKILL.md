---
name: commit
description: Commit guidelines for reviewable PRs. Use when committing code.
---

# Git Commits

This skill defines conventions for individual commits during development. Well-structured commits make PRs easier to review by telling a logical story.

## Git Commands

THE agent SHALL NOT use `git -C` flag.

THE agent SHALL run bare `git` commands from the working directory.

### Examples

```bash
git status
git diff
git log --oneline -5
git add src/main.rs
git commit -m "[feat] Auth: Add login endpoint"
```

## Atomic Commits

THE commit SHALL represent a single logical change.

THE commit SHALL address one concern or one part of a feature.

THE commit SHALL compile and pass tests.

THE commit SHALL NOT mix unrelated changes.

### Benefits of Small Commits

THE small commits enable:

- **Faster reviews**: Easier to find time for reviewing small changes than blocking time for large reviews
- **Thorough examination**: Reviewers provide better feedback on focused changes
- **Lower defect risk**: Fewer modifications make impact assessment easier
- **Reduced rework**: Rejection of a small commit wastes less effort than rejection of a large one
- **Simpler merging**: Extended work on large changes creates numerous conflicts
- **Easier rollbacks**: Smaller commits reduce cascading complications when reverting
- **Better understanding**: Future developers can understand the evolution of the code

### Size Guidelines

THE commit SHOULD be focused enough to review in a few minutes.

THE commit SHALL include all context needed to understand the change.

THE commit SHALL maintain system functionality after being applied.

THE commit SHALL remain meaningful in scope.

WHERE a commit is too small to understand implications THE developer SHALL combine it with related work.

## Logical Progression

THE commits in a PR SHALL tell a story that builds up the feature step by step.

THE commits SHALL be ordered so each one builds on the previous.

THE reviewer SHOULD be able to understand the approach by reading commits in sequence.

## Separate Concerns

THE refactoring commits SHALL be separate from behavior change commits.

WHEN adding new functionality THE developer SHALL:

1. First commit refactoring to prepare for the change
2. Then commit the new functionality

THE cleanup commits SHALL be separate from feature commits.

## Splitting Strategies

WHERE work is too large for one commit THE developer SHALL use these strategies:

**By concern**: Separate different aspects of the change into distinct commits.

**By layer**: Implement changes at one architectural layer per commit.

**By component**: Change one module or component per commit.

**Preparation then implementation**: First commit refactoring or infrastructure, then commit the feature that uses it.

WHERE tests are needed THE developer SHALL include tests in the same commit as the code they test.

WHERE existing tests need improvement THE developer MAY commit test improvements separately before refactoring.

THE developer SHALL NOT create commits that break the build or tests.

## Commit Messages

THE commit message SHALL describe what the commit does.

THE commit message SHALL be clear enough for a reviewer to understand the change.

THE commit message MAY be brief since the PR description provides broader context.

### Message Format

THE commit title SHALL use the format `[Prefix] Area/Thing: Imperative Action`.

THE commit title SHALL use one of these prefixes (lowercase, 4 chars):

- `[feat]` - New functionality users can see or use
- `[bugs]` - Bug fixes in application code (src/)
- `[refa]` - Code restructuring, cleanup, renaming
- `[deps]` - Dependency updates
- `[tool]` - CI, config, tooling, dev setup, tests

THE Area/Thing SHALL identify the component, module, or domain being changed.

THE Imperative Action SHALL describe what the commit does in imperative mood.

THE commit title SHALL NOT end with a period.

WHERE additional context is needed THE commit SHALL include a message body.

THE message body SHALL use bulleted lists in imperative tone.

THE bullets SHALL describe what was done.

THE bullets SHALL NOT end with periods.

### Examples

**Commit with title only:**

```
[refa] Order Validation: Extract quantity checks into helper
```

**Commit with title and body:**

```
[refa] Databento Service: Refactor authentication flow

- Extract token refresh into separate function
- Add retry logic for expired tokens
- Remove duplicate error handling
```

## Commit Cleanup

BEFORE creating a PR THE developer SHALL organize commits into a logical story.

THE developer MAY use messy commits during exploration.

THE developer SHALL use `git rebase -i` to reorganize commits before PR.

THE developer MAY use `git add -p` to split changes across commits.

THE developer MAY use `git add-lines` to stage specific lines by line number.

THE developer MAY use `git commit --fixup` with `git rebase --autosquash` to target fixes.

THE developer MAY use `git reword <commit> "<new message>"` to reword any commit non-interactively.

THE final commit history SHALL be clean regardless of how it was developed.

### git add-lines

THE `git add-lines` tool stages specific lines from a file's diff.

THE line numbers are 1-indexed positions within the diff body, NOT file line numbers.

THE numbering starts at line 1 after each hunk header (`@@`) and counts every line (context, additions, deletions).

THE developer can only stage changed lines (additions `+` and deletions `-`), not context lines.

TO see the numbered diff THE developer SHALL run `git add-lines` with only a filename:

```bash
git add-lines src/main.rs                   # show numbered diff
```

TO stage specific lines THE developer SHALL pass line numbers after the filename:

```bash
git add-lines src/main.rs 10 15 20          # stage diff lines 10, 15, 20
git add-lines --dry-run src/main.rs 10 15   # preview patch without staging
```

THE developer SHALL use `git add-lines` when `git add -p` hunk boundaries do not align with desired commit boundaries.

## Quick Reference

### Principles

- **Atomic** - One logical change per commit
- **Buildable** - Each commit compiles and passes tests
- **Sequential** - Tell a story, building on previous commits
- **Separated** - Refactoring separate from behavior changes

### Workflow

1. Refactor first (separate commit)
2. Add functionality (separate commit)
3. Cleanup if needed (separate commit)

### Cleanup Before PR

Use `git rebase -i` to reorganize messy commits into a clean story.

Common actions: `pick`, `reword`, `squash`, `fixup`, `drop`

### Reword Alias

THE `git reword` alias enables non-interactive commit message editing:

```bash
git reword <commit-hash> "new message"
```

THE alias is defined in `~/.gitconfig`:

```ini
[alias]
    reword = "!f() { old=$(git log --format=%s -n 1 $1); git commit --allow-empty --only -m \"amend! $old\" -m \"$2\"; GIT_SEQUENCE_EDITOR=: git rebase --interactive --autosquash $1~1; }; f"
```

THE alias works by:

1. Creating an "amend!" commit with the new message
2. Running `git rebase --autosquash` non-interactively via `GIT_SEQUENCE_EDITOR=:`
