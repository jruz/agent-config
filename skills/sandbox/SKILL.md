---
name: sandbox
description: Sandbox untrusted package managers with Docker. Use when adding bun/cargo/pnpm sandboxing, configuring container isolation, or isolating dependency installs.
---

# Sandbox

Projects get `scripts/sandbox.nu` and [flake.nix](flake.nix) through the [TypeScript setup](../typescript/SETUP.md).

Docker is the only supported method. Migrate projects that still use Bubblewrap to the Docker wrapper.

## Usage

- `sandbox <command> [...args]` runs a command in its runtime container
- `sandbox build` builds missing runtime images
- `sandbox build --force` rebuilds all runtime images
- `sandbox --help` lists the supported commands

## Setup Flow

The `sandbox` command won't exist until the user reloads their shell (direnv).

1. Tell the user to reload the shell
2. Once confirmed, run project checks

## Project Configuration

An optional project-root `sandbox.json` supports:

- `readonlyHomeDirectories`: home-relative directories mounted read-only.
- `agerManifest`: project-relative Ager manifest whose existing plaintext entries are masked with `/dev/null`.

Both keys are optional. A declared manifest must exist.

## Rules

- untrusted tools are only reachable through `sandbox`, never from the default shell
- prefix every untrusted tool call in the justfile with `sandbox`
- orchestration recipes call other recipes without `sandbox`

## Skill Development

[scripts/](scripts/) tests the skill itself. Never copy it into projects; they only receive [files/](files/).

Run the wrapper tests after editing [sandbox.nu](files/scripts/sandbox.nu):

```sh
nu "$HOME/.pi/agent/skills/nushell/files/scripts/nushell-test.nu" "$HOME/.pi/agent/skills/sandbox/scripts"
```
