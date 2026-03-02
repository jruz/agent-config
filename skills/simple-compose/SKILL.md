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

THE shellHook SHALL print the simple-compose version using `${sc.version}`.

## CLI

Two subcommands:

- `simple-compose up --config <file>` — keep all processes running, any exit triggers shutdown (dev servers)
- `simple-compose run --config <file>` — run all processes, exit with the last process's exit code (tests, one-shot tasks)

Both accept `--env-file <path>` to apply a KEY=VALUE env file to all processes.

## Config Schema

### Exec driver (default)

```yaml
shell: <string> # shell name (default: sh)
processes:
  <name>:
    type: <service|oneshot> # process type (default: service)
    command: <string> # shell command to run
    depends_on: [<string>, ...] # processes that must be healthy first
    env: # optional inline env vars
      KEY: "VALUE"
    health: # optional health check (one of command or exec)
      command: <string> # shell command via shell -c (exit 0 = healthy)
      exec: [<string>, ...] # direct execution without shell
      interval_secs: <int> # seconds between retries
      timeout_secs: <int> # seconds before giving up
```

### Docker driver

All processes in a config must use the same driver.

```yaml
runtime: <string> # container runtime (default: docker, e.g. podman)
processes:
  <name>:
    type: <service|oneshot> # process type (default: service)
    driver: docker # optional if docker section is present
    command: <string> # override container CMD (split by whitespace)
    exec: [<string>, ...] # override container CMD (exec form)
    docker:
      image: <string> # docker image (required if no build)
      build: <string> # build context path (required if no image)
      dockerfile: <string> # dockerfile path (optional)
      ports: [<host:container>] # port mappings
      volumes: [<host:container>] # volume mounts
    depends_on: [<string>, ...]
    env:
      KEY: "VALUE"
    health: # optional health check (one of command or exec)
      command: <string> # shell command via sh -c inside container
      exec: [<string>, ...] # direct execution without shell
      interval_secs: <int>
      timeout_secs: <int>
```

## Process Types

- `service` (default) — expected to stay running, exiting is treated as a crash
- `oneshot` — runs to completion during startup, exit 0 means success and dependents start, cannot have health checks

## Docker Driver Details

- Each run creates an isolated docker network
- Services are reachable by their process name (e.g. process `db` is reachable as `db`)
- All containers and the network are cleaned up on exit
- Health checks run inside the container via `docker exec`
- `command` (string) splits by whitespace — for simple args like `database reset -y`
- `exec` (list) passes args directly — for precise control like `["sh", "-c", "cmd1 && cmd2"]`
- `command` and `exec` are mutually exclusive

## Env Variable Interpolation

Env values support `$VAR` interpolation from other env vars in the merged set (process env + env file + host env).

## Config File Naming

THE config files SHALL follow the pattern `simple-compose.<purpose>.yaml`.

Common purposes: `run` (dev server), `test` (tests), `db` (database tasks), `pw-local` (playwright local), `pw-ci` (playwright CI).

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

### Docker CI (playwright)

WHERE tests run in Docker containers THE config SHALL use the docker driver with oneshot processes for setup steps.

See [simple-compose.pw-ci.yaml](simple-compose.pw-ci.yaml) for the full pattern:

- `postgres` — database with health check
- `reset` — oneshot to run migrations, depends on postgres
- `server` — app server with health check, depends on reset
- `playwright` — test runner, depends on server

## Key Rules

- NEVER use `simple-compose up` for test/CI workflows — use `run` so the exit code propagates
- NEVER omit health checks on database processes — dependent processes will start too early
- NEVER mix exec and docker drivers in the same config
- Health check `interval_secs` SHOULD be 2 and `timeout_secs` SHOULD be 10-20
