---
name: woodpecker
description: Interact with and configure Woodpecker CI. Use when subscribing to CI status updates in Pi or Claude Code, checking pipelines, investigating build failures, activating repos, or managing repo settings and secrets.
---

# Woodpecker CI

Woodpecker is a simple, container-native CI/CD engine. Use `woodpecker-cli` to interact with pipelines.

For project setup follow [SETUP.md](SETUP.md).

## Workflow Examples

| Project type      | Skill                          |
| ----------------- | ------------------------------ |
| Web apps on Nomad | [nomad](../nomad/SKILL.md)     |
| Rust CLI releases | [release](../release/SKILL.md) |

## Subscribe to CI Status Updates

When the Woodpecker watch tools are available, use them after pushing to monitor a repository and full commit SHA asynchronously. Commit watching covers push and later tag-release pipelines. Exact branch watching is also available.

| Action            | Pi                   | Claude Code                             |
| ----------------- | -------------------- | --------------------------------------- |
| Watch             | `woodpecker_watch`   | `mcp__woodpecker-channel__watch`        |
| List watches      | `woodpecker_status`  | `mcp__woodpecker-channel__status`       |
| Stop a watch      | `woodpecker_unwatch` | `mcp__woodpecker-channel__unwatch`      |
| Updates arrive as | follow-up messages   | `<channel source="woodpecker-channel">` |

| Arguments                                      | Purpose                                          |
| ---------------------------------------------- | ------------------------------------------------ |
| `{ repo: "owner/repo", commit: "<full SHA>" }` | Watch push and tag pipelines for a commit        |
| `{ repo: "owner/repo", branch: "feature" }`    | Watch an exact branch, excluding branchless tags |

- Assume CI access is already configured. Use the tools directly; do not inspect environment variables or search for credentials.
- Provide exactly one `branch` or `commit`. Get the full lowercase 40-character SHA with `git rev-parse HEAD` after pushing.
- Prefer commit watches for release workflows: tag pipelines can have an empty branch.
- Push success does not imply release success; keep watching until the release pipeline finishes.
- Unwatch once the expected pipelines have finished.

## Common Commands

| Task                  | Command                                              |
| --------------------- | ---------------------------------------------------- |
| List repos            | `woodpecker-cli repo ls`                             |
| List pipelines        | `woodpecker-cli pipeline ls <repo>`                  |
| List failed pipelines | `woodpecker-cli pipeline ls <repo> --status failure` |
| Show pipeline info    | `woodpecker-cli pipeline show <repo> <number>`       |
| Show pipeline logs    | `woodpecker-cli pipeline log show <repo> <number>`   |
| Show pipeline steps   | `woodpecker-cli pipeline ps <repo> <number>`         |
| Start a pipeline      | `woodpecker-cli pipeline start <repo>`               |
| Stop a pipeline       | `woodpecker-cli pipeline stop <repo> <number>`       |
| Lint config           | `woodpecker-cli lint .woodpecker.yaml`               |
| Get last pipeline     | `woodpecker-cli pipeline last <repo>`                |

## Pipeline List Filters

| Filter     | Example                                     |
| ---------- | ------------------------------------------- |
| `--status` | `pending`, `running`, `success`, `failure`  |
| `--branch` | `--branch main`                             |
| `--event`  | `push`, `pull_request`, `tag`, `deployment` |
| `--limit`  | `--limit 5`                                 |
| `--before` | `--before 2024-01-01T00:00:00Z`             |
| `--after`  | `--after 2024-01-01T00:00:00Z`              |

## Workflow: Investigate CI Failure

1. Find the failed pipeline:

   ```bash
   woodpecker-cli pipeline ls <repo> --status failure --limit 1
   ```

2. Get the pipeline logs:

   ```bash
   woodpecker-cli pipeline log show <repo> <number>
   ```

3. Check step status:

   ```bash
   woodpecker-cli pipeline ps <repo> <number>
   ```

## Activating a Repo

- The Woodpecker server uses GitHub as its forge.
- For Codeberg-to-GitHub migrations, follow the [migration guide](../github/migration.md).

To activate a new repo in Woodpecker:

1. Sync repos from GitHub to discover new repos:

   ```bash
   woodpecker-cli repo sync
   ```

2. Find the forge remote ID in the sync output (e.g., `forgeRemoteID: 1360109`)

3. Activate by forge remote ID:

   ```bash
   woodpecker-cli repo add <forgeRemoteID>
   ```

Note: `woodpecker-cli repo add owner/repo` does not work — use the numeric forge remote ID.

## woodpecker-settings

Declarative repo settings via `woodpecker-settings.yaml`.

| Command              | Purpose                               |
| -------------------- | ------------------------------------- |
| `init`               | Generate config from current settings |
| `plan`               | Preview changes                       |
| `apply`              | Sync to Woodpecker                    |
| `secrets set <NAME>` | Add encrypted secret                  |
| `secrets edit`       | Edit secrets in $EDITOR               |
| `--list-settings`    | Show schema                           |

### Secrets

- Copy encrypted values between projects as they are.
- The agent SHALL NOT set new secrets directly. For a secret not in the settings files, ask the user to run `woodpecker-settings secrets set <NAME>`.

## Key Rules

- Always specify repo in `owner/repo` format
- Pipeline numbers are integers, not commit hashes
- Logs require `log show` subcommand (not `logs`)
