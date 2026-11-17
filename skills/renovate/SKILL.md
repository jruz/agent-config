---
name: renovate
description: Configure self-hosted Renovate dependency updates. Use when adding Renovate to a project, grouping dependencies, or fixing a failed dependency update.
---

# Renovate

## Setup

Copy the profile for the project to its root as `renovate.json`:

| Project    | Profile                                                    |
| ---------- | ---------------------------------------------------------- |
| TypeScript | [typescript.renovate.json](files/typescript.renovate.json) |
| Next.js    | [nextjs.renovate.json](files/nextjs.renovate.json)         |
| Rust       | [rust.renovate.json](files/rust.renovate.json)             |

For mixed projects, merge the profiles' managers and package rules into one file.

The self-hosted runner already processes every `jruz/*` repository that contains `renovate.json`; nothing else is needed.

## Grouping

Group packages whose versions must move together into one `packageRules` entry, following the existing groups in the profiles.

## Validation

```bash
sandbox pnpm --package=renovate@44.178.3 dlx renovate-config-validator --strict renovate.json
```

## Failed Updates

When an update fails CI, apply the proposed version on `main` with the required fixes; Renovate closes the superseded PR.
