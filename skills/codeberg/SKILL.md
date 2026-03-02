---
name: codeberg
description: Manage Codeberg repository settings. Use when configuring repos on Codeberg.
---

# Codeberg

Declarative repo settings via `codeberg-settings.toml`. See `codeberg-settings.toml` in this skill for the default template.

## Commands

| Command                                               | Purpose                                             |
| ----------------------------------------------------- | --------------------------------------------------- |
| `codeberg-settings init`                              | Generate config from current settings               |
| `codeberg-settings plan`                              | Preview changes                                     |
| `codeberg-settings apply`                             | Sync to Codeberg                                    |
| `codeberg-settings schema`                            | Show all configurable fields                        |
| `codeberg-settings status_check_contexts`             | List status check context names from recent commits |
| `codeberg-settings status_check_contexts -b <branch>` | List contexts for a specific branch                 |
| `codeberg-settings unprotect <branch>`                | Remove branch protection                            |

## Setup

1. Copy `codeberg-settings.toml` from this skill into the project root
2. Replace `REPO_NAME` with the actual repository name
3. Set `description`, `topics`, and `private` as needed
4. `codeberg-settings plan` to preview, then `codeberg-settings apply`

## Description and Topics

1. Propose a description and ask for confirmation
2. Propose topics and ask for confirmation

## Branch Protection

1. Run `codeberg-settings status_check_contexts` to list available context names
2. Add only the `pr` contexts (e.g. `ci/woodpecker/pr/check`) to `status_check_contexts` in `[branch_protection.main]`
3. `codeberg-settings plan` to preview, then `codeberg-settings apply`

- `enable_push = true` — allow direct pushes to the branch
- `enable_status_check = true` — require status checks to pass before merging PRs
- `status_check_contexts` — list of checks that must pass
- Only add `pr` contexts, not `push` contexts. PR contexts gate merging; push contexts run after code lands on main and are not useful as branch protection gates.

## Notes

- Remove empty `[repository.settings.external_tracker]` and `[repository.settings.external_wiki]` sections (causes API errors)
- Ask the user if releases should be enabled (`has_releases = true`)
