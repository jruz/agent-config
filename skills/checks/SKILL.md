---
name: checks
description: Add linters and formatters for the current project.
---

# checks Skill

Add comprehensive linting and formatting infrastructure to any project.

## Recipe Naming Convention

| Recipe       | Purpose                                        |
| ------------ | ---------------------------------------------- |
| `lang-check` | Run linter + formatter check (fails on issues) |
| `lang-fix`   | Run linter + formatter auto-fix                |

Aggregate recipes:

| Recipe  | Purpose                      |
| ------- | ---------------------------- |
| `check` | Run all `lang-check` recipes |
| `fix`   | Run all `lang-fix` recipes   |

## Templates

All templates are in this skill folder:

| File                      | Purpose                                                         |
| ------------------------- | --------------------------------------------------------------- |
| `justfile`                | All recipe templates                                            |
| `biome.json`              | Base JS/TS/JSON/CSS config (strict)                             |
| `biome-cli.json`          | CLI tools config (extends base, relaxes rules)                  |
| `Cargo.toml`              | Rust linting configuration (`[lints]` table) — see `rust` skill |
| `markdownlint-cli2.jsonc` | Markdown linting                                                |
| `nu-lint.toml`            | Nushell linting — see Skill(nushell)                            |
| `stylelintrc.json`        | CSS linting (extended)                                          |
| `yamllint.yaml`           | YAML linting                                                    |
| `flake-snippets.nix`      | Nix flake input and package references                          |

## Tool Reference

| Language       | Tool                  | Flake Package                                | Config                              |
| -------------- | --------------------- | -------------------------------------------- | ----------------------------------- |
| Gleam          | gleam format/build    | `pkgs.gleam`                                 | None                                |
| JS/TS/JSON/CSS | Biome                 | `pkgs.biome`                                 | `biome.json`                        |
| Markdown       | markdownlint-cli2     | `pkgs.markdownlint-cli2`                     | `.markdownlint-cli2.jsonc`          |
| Rust           | clippy/rustfmt        | rust-overlay                                 | None                                |
| Nushell        | nu-check/nu-lint      | See Skill(nushell)                           | `nu-lint.toml` — see Skill(nushell) |
| Ansible        | ansible-lint          | `pkgs.ansible-lint`                          | None                                |
| Nix            | statix/deadnix/nixfmt | `pkgs.statix`, `pkgs.deadnix`, `pkgs.nixfmt` | None                                |
| Shell          | shellcheck/shfmt      | `pkgs.shellcheck`, `pkgs.shfmt`              | None                                |
| YAML           | yamllint              | `pkgs.yamllint`                              | `.yamllint.yaml`                    |
| TOML           | taplo                 | `pkgs.taplo`                                 | None                                |
| CSS            | stylelint             | Via npm                                      | `.stylelintrc.json`                 |
| Lua            | selene/stylua         | `pkgs.selene`, `pkgs.stylua`                 | None                                |
| SQL            | sqlx                  | `pkgs.sqlx-cli`                              | None                                |
| CI             | woodpecker-cli        | `pkgs.woodpecker-cli`                        | None                                |

### Nushell

For nu-lint package definition, `nu-lint.toml` configuration, `nu-lint.nix` devenv module, and justfile recipes, see Skill(nushell).

## Biome Setup

### Web Projects

Copy `biome.json` to project root.

### CLI Projects (Bun/Node)

Copy both files, rename for extends:

```
project/
├── biome-base.json    # copied from skill's biome.json
└── biome.json         # copied from skill's biome-cli.json
```

## Minimal Flake Template

```nix
{
  description = "DevShell";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            fd
            just
            ripgrep
          ];
        };
      });
}
```

## Rust

For Rust linting configuration (`[lints]` table, `Cargo.toml` template, justfile recipes), see the `rust` skill.

## Rules

THE justfile SHALL use the recipe naming convention: `lang-check`, `lang-fix`.

THE `lang-check` recipe SHALL run both linter and formatter checks.

THE `lang-fix` recipe SHALL run both linter and formatter auto-fixes.

THE `check` recipe SHALL call all individual `lang-check` recipes.

THE `fix` recipe SHALL call all individual `lang-fix` recipes.

WHEN adding tools THE devenv.nix SHALL be updated with required packages.

WHEN adding tools THE justfile SHALL be updated with corresponding recipes.

WHEN a tool requires configuration THE config file SHALL be created from templates.

## Git Hooks

THE project SHALL use a pre-push hook to run checks before pushing.

THE hook SHALL be stored in `.githooks/pre-push`.

### Pre-push Hook Template

**Without Playwright:**

```
just check
just test
```

**With Playwright:**

```
just check
just test
just playwright
```

### Setup

1. Create `.githooks/` directory
2. Create `.githooks/pre-push` with appropriate template
3. Make executable: `chmod +x .githooks/pre-push`
4. Configure git: `git config core.hooksPath .githooks`
