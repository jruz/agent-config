---
name: simple-compose
description: Orchestrate dev processes with simple-compose. Use when adding process orchestration, health checks, or dev workflows.
---

# Simple Compose

Process orchestrator for dev workflows. Runs processes with dependency ordering, health checks, and colored output.

## Installation

WHERE a project uses Nix flakes THE developer SHALL add `simple-compose` as a flake input and include it in packages.

THE flake SHALL use the input and package references from [flake.nix](flake.nix).

THE flake input SHALL pin to a specific version tag using `?ref=refs/tags/vX.Y.Z`.

THE shellHook SHALL print the simple-compose version. Since the binary has no `--version` flag, use the flake input metadata approach shown in [flake.nix](flake.nix).

## CLI

Two subcommands:

- `simple-compose up --config <file>` — keep all processes running, any exit triggers shutdown (dev servers)
- `simple-compose run --config <file>` — run all processes, exit with the last process's exit code (tests, one-shot tasks)

Both accept `--env-file <path>` to apply a KEY=VALUE env file to all processes.

## Config Schema

```yaml
shell: <string>                     # shell name (default: sh)
processes:
  <name>:                           # unique process name
    command: <string>               # shell command to run
    depends_on: [<string>, ...]     # processes that must be healthy first
    env:                            # optional inline env vars
      KEY: "VALUE"
    health:                         # optional health check
      command: <string>             # health check shell command
      interval_secs: <int>          # seconds between retries
      timeout_secs: <int>           # seconds before giving up
```

## Config File Naming

THE config files SHALL follow the pattern `simple-compose.<purpose>.yaml`.

Common purposes: `run` (dev server), `test` (tests), `db` (database tasks).

## Justfile Recipes

THE project SHALL include the recipes from this skill's [justfile](justfile) under `# ---------------- SIMPLE COMPOSE` section.

THE `compose-up` recipe SHALL use `simple-compose up` for long-running dev workflows.

THE `compose-run` recipe SHALL use `simple-compose run` for one-shot tasks.

## Patterns

### Database dependency

WHERE a process needs a database THE config SHALL define a `postgres` process with a health check.

THE health check SHALL use `pg_isready` or a just recipe that wraps it.

Dependent processes SHALL use `depends_on: [postgres]`.

### Server dependency

WHERE a process needs a running server THE config SHALL add a health check using `curl --silent --fail`.

### One-shot task with args

WHERE a recipe passes arguments to a compose process THE recipe SHALL use an env var:

```just
compose-task *ARGS:
  env TASK_ARGS="{{ARGS}}" \
    simple-compose run --config simple-compose.task.yaml
```

The compose process reads the env var in its command.

### Docker processes (CI)

WHERE processes run in Docker THE config SHALL set `shell: bash` for process substitution syntax.

Docker processes SHALL use `--rm` and `--network` flags for cleanup and connectivity.

## Key Rules

- NEVER use `simple-compose up` for test/CI workflows — use `run` so the exit code propagates
- NEVER omit health checks on database processes — dependent processes will start too early
- Health check `interval_secs` SHOULD be 2 and `timeout_secs` SHOULD be 10-20
