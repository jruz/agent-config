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

## Workflow Templates

Templates are in this skill folder:

### Web projects (Docker Swarm)

| File | Purpose |
|------|---------|
| `.woodpecker/check.yml` | Push to main, manual, or PR: run checks via nix develop |
| `.woodpecker/playwright.yml` | Push to main, manual, or PR: run Playwright E2E tests |
| `.woodpecker/build-main.yml` | Push to main: build frontend + backend docker image |
| `.woodpecker/build-pr.yml` | Pull request: build frontend + backend docker image |
| `.woodpecker/deploy-main.yml` | Push to main: push image, deploy to production (depends on check, playwright, build-main) |
| `.woodpecker/deploy-pr.yml` | Pull request: push image, deploy preview, seed data, cleanup on close (depends on check, playwright, build-pr) |
| `docker-compose.yaml` | Docker Swarm service definition with Traefik, Postgres |
| `woodpecker-settings.yaml` | Default repo settings template |

### Binary projects (Codeberg releases)

| File | Purpose |
|------|---------|
| `.woodpecker/check.yml` | Push to main, manual, or PR: run checks via nix develop |
| `.woodpecker/tag.yml` | Push to main: read version from Cargo.toml, create git tag if missing |
| `.woodpecker/release.yml` | On tag: multi-platform build (linux, macOS, windows), release upload |
| `scripts/release-upload.ts` | TypeScript script to upload release binaries to Codeberg |
| `justfile` | Build recipes for release builds and upload |
| `woodpecker-settings.yaml` | Default repo settings template |

### Dockerfile templates

| File | Purpose |
|------|---------|
| `Dockerfile.rust` | Multi-stage: nix build + debian-slim runtime for Rust web apps |
| `Dockerfile.gleam` | Multi-stage: nix build + erlang-alpine runtime for Gleam apps |
| `Dockerfile.static` | Multi-stage: nix build + static-web-server for static sites |

Copy the appropriate Dockerfile template as `Dockerfile` in the project root.

### Setup

Copy the appropriate files to the project root. Merge `justfile` recipes into the project's justfile.

**Note:** `release.yml`, `release-upload.ts`, and `justfile` use `BINARY_NAME` as a placeholder. Replace with the actual binary name. The upload script uses `CI_REPO` (set by Woodpecker) for the Codeberg API repo path.

## Linting

THE project SHALL lint woodpecker config using `woodpecker-cli lint`.

THE linter recipe SHALL be set up according to the checks skill.

## woodpecker-settings

Declarative repo settings via `woodpecker-settings.yaml`.

| Command | Purpose |
|---------|---------|
| `init` | Generate config from current settings |
| `plan` | Preview changes |
| `apply` | Sync to Woodpecker |
| `secrets set <NAME>` | Add encrypted secret |
| `secrets edit` | Edit secrets in $EDITOR |
| `--list-settings` | Show schema |

### Setup

1. `woodpecker-settings init`
2. Set `trusted.volumes: true` under `settings:`
3. `woodpecker-settings apply`

### Secrets

THE `woodpecker-settings.yaml` template includes an age-encrypted `CODEBERG_TOKEN` secret.

THE agent SHALL NOT set secrets directly.

THE agent SHALL ask the user to run:

```bash
woodpecker-settings secrets set CODEBERG_TOKEN
```

## Server Logs (Grafana/Loki)

When deploying containers to Docker Swarm, use `scripts/grafana-logs.ts` to query container logs from Loki via Grafana.

### Setup

When adding deploy workflows to a project, copy `scripts/grafana-logs.ts` and `scripts/log.ts` from the hetzner repo, and add this justfile recipe:

```just
grafana-logs stack limit="20":
  bun scripts/grafana-logs.ts {{stack}} {{limit}}
```

### Usage

```bash
just grafana-logs money-pr-6
just grafana-logs money-pr-6 100
```

## Key Rules

- Use `woodpecker-cli` not `woodpecker` (deprecated)
- Always specify repo in `owner/repo` format
- Pipeline numbers are integers, not commit hashes
- Logs require `log show` subcommand (not `logs`)
