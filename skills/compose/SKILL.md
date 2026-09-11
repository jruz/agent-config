---
name: compose
description: Orchestrate dev processes with compose. Use when adding process orchestration, health checks, or dev workflows.
---

# Compose

Process orchestrator for dev and CI workflows. Runs local processes or docker containers with health checks and dependency ordering.

## Installation

See `flake.nix` in this skill directory for a nix flake example.

## Commands

- `compose up --config <file>` — start all processes, stop when any exits
- `compose run --config <file>` — start all processes, stop when the last dependency chain completes
- `compose run --config <file> --env-file <file>` — same but load env vars from file

## Config Files

### compose.dev.yaml

Local dev workflow. Processes run directly on the host.

```yaml
processes:
  postgres:
    command: just env-kill-ports pg-start
    health:
      command: just pg-ready
      interval_secs: 2
      timeout_secs: 10

  frontend:
    command: just frontend-build frontend-watch
    depends_on: [postgres]

  server:
    command: just sqlx-reset rust-watch
    depends_on: [postgres]
```

### compose.db.yaml

Run a one-off database task.

```yaml
processes:
  postgres:
    command: just env-kill-ports pg-start
    health:
      command: just pg-ready
      interval_secs: 2
      timeout_secs: 10

  task:
    command: just db-run-args
    depends_on: [postgres]
```

### compose.test.yaml

Run rust tests with a database.

```yaml
processes:
  postgres:
    command: just env-kill-ports pg-start
    health:
      command: just pg-ready
      interval_secs: 2
      timeout_secs: 10

  rust-test:
    command: just sqlx-reset rust-test-run
    depends_on: [postgres]
```

### compose.playwright.yaml

Playwright E2E tests running entirely in docker containers.

```yaml
shell: bash
processes:
  postgres:
    docker:
      image: "postgres:18.1"
    env:
      PGPORT: "61001"
    health:
      command: "pg_isready --username=${POSTGRES_USER}"
      interval_secs: 2
      timeout_secs: 30

  reset:
    type: oneshot
    docker:
      build: .
      dockerfile: Dockerfile.sqlx
    command: "database reset -y"
    env:
      DATABASE_URL: "postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:${POSTGRES_PORT}/${POSTGRES_DB}"
    depends_on:
      - postgres

  web:
    docker:
      build: .
      dockerfile: Dockerfile.server
    env:
      APP_DOMAIN: web
      REVISION: test
    depends_on:
      - reset
    health:
      command: "curl --fail --silent http://localhost:${APP_PORT}/health"
      interval_secs: 2
      timeout_secs: 60

  seed:
    type: oneshot
    docker:
      image: web
    exec:
      ["sh", "-c", "./tasks admin-user && ./tasks categories && ./tasks seed"]
    depends_on:
      - web

  playwright:
    docker:
      build: .
      dockerfile: Dockerfile.playwright
      volumes:
        - "./playwright/screenshots:/app/playwright/screenshots"
        - "./test-results:/app/test-results"
    exec: ["sh", "-c", "npx playwright test $PLAYWRIGHT_ARGS"]
    env:
      APP_DOMAIN: web
    depends_on:
      - seed
```

## Playwright Hostnames

THE HTTP service for Chromium tests SHALL NOT use `app` as its hostname.

Chromium reads `app` as the HSTS-preloaded `.app` name. It changes `http://app` to `https://app`.

The Playwright error is `page.goto: net::ERR_SSL_PROTOCOL_ERROR`. A trace shows a `307 Internal Redirect` with `Non-Authoritative-Reason: HSTS`.

THE HTTP service SHOULD use a name such as `web`.

## Config Fields

### runtime

Optional top-level field. Sets the container runtime binary.

```yaml
runtime: podman
```

Values: `docker` (default), `podman`.

### shell

Optional top-level field. Sets the shell used for exec processes and shell health checks.

```yaml
shell: bash
```

Default: `sh`.

### type

- Default (`service`): long-running process, stays alive
- `type: oneshot`: runs once then exits

### exec

CMD override in exec form (docker processes only). Mutually exclusive with `command` on docker processes.

```yaml
seed:
  docker:
    image: app
  exec: ["sh", "-c", "./tasks admin-user && ./tasks seed"]
```

## Docker Processes

THE docker processes SHALL use `build` + `dockerfile` instead of pre-built images:

```yaml
app:
  docker:
    build: .
    dockerfile: Dockerfile.server
```

THE docker processes MAY reference another process's image by name:

```yaml
seed:
  docker:
    image: app
```

THE docker processes MAY mount volumes:

```yaml
playwright:
  docker:
    build: .
    dockerfile: Dockerfile.playwright
    volumes:
      - "./test-results:/app/test-results"
```

## Build Args

THE docker processes MAY specify explicit `build_args` passed as `--build-arg` to `docker build`:

```yaml
app:
  docker:
    build: .
    build_args:
      NODE_VERSION: "22"
      ENV: "development"
```

WHEN `build_args` is omitted, all resolved env vars (inline `env`, `env_file`, global `--env-file`) are forwarded as `--build-arg`.

## Variable Interpolation

All string values support `${VAR}` interpolation. Variables resolve from: inline `env`, `env_file`, `--env-file`, and host environment. Undefined variables stay literal.

THE string values SHALL use `${VAR}` syntax (not `$VAR`) for compose-level interpolation.

Interpolation applies to: `command`, `exec`, `ports`, `volumes`, `health.command`, `health.exec`.

```yaml
processes:
  api:
    docker:
      build: .
      ports:
        - "${API_PORT}:${API_PORT}"
    env:
      API_PORT: "8000"
    command: "uvicorn app:app --port ${API_PORT}"
    health:
      exec: ["curl", "--fail", "http://localhost:${API_PORT}/health"]
      interval_secs: 2
      timeout_secs: 15
```

## Health Checks

THE health checks SHALL use `command` for shell commands:

```yaml
health:
  command: "pg_isready --username=${POSTGRES_USER}"
  interval_secs: 2
  timeout_secs: 30
```

THE health checks MAY use `exec` for non-shell execution:

```yaml
health:
  exec: ["curl", "--fail", "http://localhost:${APP_PORT}/health"]
  interval_secs: 1
  timeout_secs: 30
```

## Justfile Recipes

```just
compose-dev:
  compose up --config compose.dev.yaml

playwright *ARGS='':
  PLAYWRIGHT_ARGS="{{ARGS}}" compose run \
    --config compose.playwright.yaml \
    --env-file <(just sops-decrypt-test)
```
