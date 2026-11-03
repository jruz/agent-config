---
name: j-release-bump
description: Analyze commits since last release and propose a semver bump
disable-model-invocation: true
allowed-tools: Bash, Read, Grep, Glob
---

Analyze commits since the last release and propose a new semver version.

## Workflow

1. Find the latest version tag and current version:

```bash
git tag --sort=-v:refname | head -1
```

```bash
grep '^version' Cargo.toml | head -1
```

1. List commits since last tag:

```bash
git log <last-tag>..HEAD --oneline
```

1. Read the actual diff to understand what changed:

```bash
git diff <last-tag>..HEAD --stat
```

For each commit, read its diff to understand the scope and impact:

```bash
git show <hash> --stat
git show <hash>
```

1. Categorize changes by reading the code, not just commit titles:
   - **Breaking** — changed public API, removed config fields, renamed CLI flags, changed behavior in backwards-incompatible ways
   - **Feature** (`[feat]`) — new user-visible functionality
   - **Fix** (`[bugs]`) — bug fixes
   - **Refactor** (`[refa]`) — internal restructuring, no behavior change
   - **Tooling** (`[tool]`) — CI, config, dev setup, tests
   - **Dependencies** (`[deps]`) — dependency updates

2. Determine semver bump:
   - **major** — any breaking change found in the code
   - **minor** — any new feature found in the code
   - **patch** — only fixes, refactors, tooling, deps

3. Present the analysis:

**Current version:** `<version>`
**Last release tag:** `<tag>`

**Changes since last release:**

- <category>: <what actually changed in the code>

**Proposed bump:** `<current>` -> `<proposed>` (`<major|minor|patch>`)
**Reason:** <why this bump level, referencing actual code changes>

1. Wait for user confirmation before making any changes

2. Once confirmed, run `just release-bump <version>` to apply the bump (uses `scripts/release-bump.nu` from the release skill)
