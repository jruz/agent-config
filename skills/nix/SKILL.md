---
name: nix
description: Lint and format Nix files. Use when adding nix linting or working with nix flakes.
---

Base directory for this skill: /home/jruz/.claude/skills/nix

# Nix

Lint and format Nix files with statix, deadnix, and nixfmt.

## Tools

| Tool    | Purpose              |
| ------- | -------------------- |
| nixfmt  | Nix formatter        |
| statix  | Nix linter           |
| deadnix | Dead code detection  |
| fd      | File finder for glob |

## Flake Packages

Reference: `flake.nix`

## Justfile Recipes

Reference: `justfile`

## Rules

WHEN adding nix linting THE flake SHALL include `deadnix`, `fd`, `nixfmt`, and `statix` in `buildInputs`.

WHEN adding nix linting THE justfile SHALL include `nix-check` and `nix-fix` recipes.

THE `nix-check` recipe SHALL run nixfmt check, statix check, and deadnix fail.

THE `nix-fix` recipe SHALL run nixfmt, statix fix, and deadnix edit.

THE `check` aggregate recipe SHALL include `just nix-check`.

THE `fix` aggregate recipe SHALL include `just nix-fix`.
