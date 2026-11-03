---
name: sandbox
description: Sandbox untrusted package managers with bubblewrap. Use when adding bun/cargo/pnpm sandboxing, configuring bwrap, or isolating dependency installs.
---

# Sandbox

Isolate untrusted package managers (bun, cargo, pnpm) using bubblewrap (bwrap) to prevent supply chain attacks from accessing sensitive files.

## Setup Flow

During setup, the `sandbox` command won't exist until the user reloads their shell (direnv). To prevent git hooks from failing:

1. Add an early return to the `check` recipe while setting up:

   ```just
   check:
       #!/usr/bin/env nu
       if (which sandbox | is-empty) { exit 0 }
       ^just woodpecker-check
       ^just ts-check
       ...
   ```

2. Tell the user to reload the shell
3. Once reloaded, remove the early return and restore normal `check` recipe

## Architecture

| Component                  | Purpose                                                           |
| -------------------------- | ----------------------------------------------------------------- |
| `devShells.default`        | Safe tools only + `sandbox` wrapper                               |
| `sandbox` wrapper          | `writeShellScriptBin` — enters bwrap with hardcoded `makeBinPath` |
| `scripts/sandbox-check.ts` | Verifies sensitive paths are blocked                              |

Reference files: `rust-bun.flake.nix` (rust + bun), `rust-playwright.flake.nix` (rust + pnpm + playwright), `justfile`, `scripts/sandbox-check.ts`

## Single Shell Design

- `devShells.default` — loaded by direnv, has ONLY safe tools. No `cargo`, no `bun`, no `pnpm`.
- The `sandbox` wrapper hardcodes PATH via `makeBinPath` — tools inside bwrap come from nix store paths, not from the outer shell.
- Untrusted tools are NEVER in the default shell PATH.
- NO escape hatch shell — all untrusted tool access goes through `sandbox`.

## Package Lists

- `commonPackages` — safe tools available in both the default shell and inside bwrap (just, nu, git, rg, sops, taplo)
- `sandboxPackages` — untrusted tools only available inside bwrap (cargo, pnpm, node, etc.)
- `sandboxPath` — `makeBinPath` of commonPackages + sandboxPackages + core unix utils (bash, coreutils, gnugrep, gnused, stdenv.cc)

## Sandbox Wrapper

Defined in `flake.nix` as `writeShellScriptBin "sandbox"`. Key properties:

- `--unshare-user --unshare-ipc --unshare-uts --unshare-cgroup` — namespace isolation without PID unshare
- `--die-with-parent` — kill sandbox if parent dies
- `--tmpfs "$HOME"` — blanks entire home, selective binds override
- `--setenv PATH "${sandboxPath}"` — hardcoded nix store paths via `makeBinPath`
- `--symlink /usr/bin/env` and `--symlink /bin/sh` — required by shebangs
- `exec bwrap "${ARGS[@]}" -- "$@"` — pass all args to bwrap

## Mount Rules

| Mount                     | Type        | Purpose                         |
| ------------------------- | ----------- | ------------------------------- |
| `/nix`                    | ro-bind     | Nix store (tools, libraries)    |
| `/etc/resolv.conf`        | ro-bind     | DNS resolution                  |
| `/etc/ssl`, `/etc/static` | ro-bind-try | TLS certificates                |
| `/run/current-system/sw`  | ro-bind-try | NixOS system packages           |
| `$HOME/.gitconfig`        | ro-bind-try | Git config (read-only)          |
| `$HOME/.ssh/known_hosts`  | ro-bind-try | SSH known hosts only (NOT keys) |
| `/usr/bin/env`            | symlink     | Required by shebangs            |
| `/bin/sh`                 | symlink     | Required by shell scripts       |
| `/dev`                    | dev         | Device files                    |
| `/proc`                   | proc        | Process info                    |
| `$HOME`                   | tmpfs       | Blanks entire home              |
| `$(pwd)`                  | bind (rw)   | Project directory               |
| `/tmp`                    | bind (rw)   | Temp files                      |

Per-tool cache mounts (add as needed):

| Mount                     | Tool  |
| ------------------------- | ----- |
| `$HOME/.cargo`            | cargo |
| `$HOME/.bun`              | bun   |
| `$HOME/.local/share/pnpm` | pnpm  |

## Blocked Paths

- `$HOME/.ssh` (SSH keys — only `known_hosts` is bound)
- `$HOME/.config/sops` (age keys)
- Any path outside the project directory

## Justfile Integration

Put `sandbox` directly in front of every untrusted tool call. Every recipe is self-contained:

```just
# orchestration: no sandbox wrapping
check:
    just frontend-check
    just rust-check

# inner recipes: sandbox in front of the tool
rust-clippy:
    sandbox cargo clippy --all-targets

ts-check:
    sandbox pnpm exec tsc --noEmit
```

For nushell shebang recipes, use `^sandbox`:

```just
rust-fix:
  #!/usr/bin/env nu
  ^sandbox cargo fmt --all
  ^sandbox cargo clippy --fix --all-targets --allow-dirty
```

## pnpm Store

Force centralized pnpm store via env var in sandbox wrapper:

```nix
--setenv npm_config_store_dir "$HOME/.local/share/pnpm/store"
```

Without this, pnpm creates a `.pnpm-store` in the project directory because `$HOME` is tmpfs (cross-filesystem detection).

## Adding New Package Managers

1. Add the package to `sandboxPackages`
2. Add its cache directory as `--bind` in the `sandbox` wrapper
3. Verify with `sandbox-check`

## Key Rules

- NEVER put untrusted tools in `commonPackages`
- ALWAYS use `--tmpfs "$HOME"` then selectively bind back cache dirs
- ALWAYS use `makeBinPath` for PATH inside sandbox
- ALWAYS test with `scripts/sandbox-check.ts` after changes
- ALWAYS use `--ro-bind-try` for paths that may not exist
- ALWAYS symlink `/bin/sh` — needed by pnpm/npm wrapper scripts
- DO NOT use `--unshare-pid` — breaks bun's `posix_spawn`
- DO NOT use `--unshare-all` — use individual `--unshare-*` flags to avoid PID unshare
