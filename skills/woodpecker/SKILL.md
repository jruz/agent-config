---
name: woodpecker
description: Interact with Woodpecker CI. Use when checking pipelines or build logs on Woodpecker CI.
---

# Woodpecker CI

Woodpecker is a simple, container-native CI/CD engine. Use `woodpecker-cli` to interact with pipelines.

## Common Commands

| Task                    | Command                                                      |
| ----------------------- | ------------------------------------------------------------ |
| List repos              | `woodpecker-cli repo ls`                                     |
| List pipelines          | `woodpecker-cli pipeline ls <repo>`                          |
| List failed pipelines   | `woodpecker-cli pipeline ls <repo> --status failure`         |
| Show pipeline info      | `woodpecker-cli pipeline show <repo> <number>`               |
| Show pipeline logs      | `woodpecker-cli pipeline log show <repo> <number>`           |
| Show pipeline steps     | `woodpecker-cli pipeline ps <repo> <number>`                 |
| Start a pipeline        | `woodpecker-cli pipeline start <repo>`                       |
| Stop a pipeline         | `woodpecker-cli pipeline stop <repo> <number>`               |
| Lint config             | `woodpecker-cli lint .woodpecker.yaml`                       |
| Get last pipeline       | `woodpecker-cli pipeline last <repo>`                        |

## Pipeline List Filters

| Filter      | Example                                          |
| ----------- | ------------------------------------------------ |
| `--status`  | `pending`, `running`, `success`, `failure`       |
| `--branch`  | `--branch main`                                  |
| `--event`   | `push`, `pull_request`, `tag`, `deployment`      |
| `--limit`   | `--limit 5`                                      |
| `--before`  | `--before 2024-01-01T00:00:00Z`                  |
| `--after`   | `--after 2024-01-01T00:00:00Z`                   |

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

## Repo Format

Repos use the format `owner/repo-name` (e.g., `jruz/jruz.io`).

## Multiline Commands

Use YAML `|` block and bash `\` continuations for long commands:

```yaml
commands:
  - |
    echo "$TOKEN" | kaniko \
      --context . \
      --destination $IMAGE \
      --label org.opencontainers.image.revision=${CI_COMMIT_SHA} \
      --registry-username jruz \
      --registry-password-stdin
```

## Key Rules

- Use `woodpecker-cli` not `woodpecker` (deprecated)
- Always specify repo in `owner/repo` format
- Pipeline numbers are integers, not commit hashes
- Logs require `log show` subcommand (not `logs`)
