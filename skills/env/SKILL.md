---
name: env
description: Manage secrets with sops and age encryption. Use when working with env vars and secrets.
---

# Sops + Age Secrets Management

Encrypt secrets in YAML files using sops with age encryption. Secrets are stored encrypted in `.env.{ENV}.yaml` and decrypted to `.env` for local use.

## File Layout

| File              | Purpose                                        | Git tracked |
| ----------------- | ---------------------------------------------- | ----------- |
| `.sops.yaml`      | sops config (encryption rules, age public key) | yes         |
| `.env.{ENV}.yaml` | encrypted secrets per environment              | yes         |
| `.env`            | decrypted dotenv (generated)                   | no          |

## Setup

THE project SHALL add `sops`, `age`, and `bun` to `flake.nix` packages.

THE project SHALL have a `.sops.yaml` at the project root using the template in `.sops.yaml`.

THE `.gitignore` SHALL include `.env` and SHALL NOT include `.env.{ENV}.yaml`.

THE age private key already exists at `~/.config/sops/age/keys.txt` (sops default). NEVER generate a new key.

THE public key SHALL be extracted with `age-keygen -y ~/.config/sops/age/keys.txt` when creating a new `.sops.yaml`.

## .sops.yaml

THE project SHALL have a `.sops.yaml` at the project root using the template in `.sops.yaml`.

THE `encrypted_regex` SHALL match key suffixes that contain sensitive values.

THE `encrypted_regex` SHALL default to `(_KEY|_SECRET|_TOKEN|_EMAIL|_PASSWORD)$`.

WHERE additional suffixes are needed THE developer SHALL extend the regex.

## Justfile Recipes

THE project SHALL include the recipes from this skill's `justfile` under `# ---------------- DOTENV` and `# ---------------- SOPS` sections.

## Scripts

WHERE `scripts/log.ts` does not exist THE project SHALL copy it from this skill.

THE project SHALL include `scripts/dotenv-load.nu` for loading `.env` into nushell inline recipes.

THE project SHALL include `scripts/env-set-database-url.nu` for building `DATABASE_URL` from individual Postgres env vars.

THE project SHALL include `scripts/sops-sync-check.ts` for key validation.

THE project SHALL include `scripts/dotenv-show.ts` for masked secret display.

THE project SHALL include `scripts/sops-set-secret.ts` for interactive secret input with paste support.

THE project SHALL include `scripts/dotenv-setup-ports.ts` for worktree port assignment.

THE project SHALL include `scripts/dotenv-kill-ports.ts` for killing processes on all port variables.

THE `PORT_VARS` constant in `dotenv-setup-ports.ts` and `dotenv-kill-ports.ts` SHALL be customized per project to list all port variables (e.g. `APP_PORT`, `POSTGRES_PORT`).

## Workflow

1. Use `just sops-set dev KEY VALUE` to set individual keys
2. Use `just sops-set-secret dev KEY` for sensitive values (interactive prompt)
3. Use `just sops-decrypt-dev` to generate `.env` from `.env.dev.yaml`
4. Use `just dotenv-show` to verify decrypted values (secrets masked)
5. Use `just sops-run-test 'command'` to run commands with test env
6. Use `just sops-sync-check` to validate all env files have matching keys

## Passwords

THE project SHALL generate passwords with `just sops-set-password ENV KEY`.

EACH environment SHALL have a unique password per service.

## Key Rules

- NEVER read `.env`, `.env.*`, or `~/.config/sops/age/keys.txt`
- NEVER commit `.env` — only `.env.{ENV}.yaml` (encrypted) is tracked
- NEVER log or print secret values
- NEVER modify `encrypted_regex` in `.sops.yaml` or inside `.env.{ENV}.yaml` files — only the user changes encryption patterns
- NEVER modify `SECRET_PATTERN` in `scripts/dotenv-show.ts` — only the user changes masking patterns
- `sops-sync-check` SHOULD be included in the project's `just check` recipe
- `sops-decrypt-dev` SHOULD be called from the project's `just setup` recipe
- `dotenv-setup-ports` SHOULD be called from the project's `just setup` recipe after `sops-decrypt-dev`
