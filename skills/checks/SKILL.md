---
name: checks
description: Add linters and formatters for the current project.
---

# checks Skill

Add comprehensive linting and formatting infrastructure to any project.

## Recipe Naming Convention

| Recipe | Purpose |
|--------|---------|
| `lang-lint` | Run linter (check only, fails on issues) |
| `lang-lint-fix` | Run linter with auto-fix |
| `lang-fmt` | Run formatter (check only, fails on issues) |
| `lang-fmt-fix` | Run formatter and write changes |

Aggregate recipes:

| Recipe | Purpose |
|--------|---------|
| `lint` | Run all linters |
| `fmt` | Run all formatters (check only) |
| `fix` | Run all fixes (lint-fix + fmt-fix) |
| `check` | Run fix + lint + fmt |

## Templates

All templates are in this skill folder:

| File | Purpose |
|------|---------|
| `justfile` | All recipe templates |
| `biome.json` | Base JS/TS/JSON/CSS config (strict) |
| `biome-cli.json` | CLI tools config (extends base, relaxes rules) |
| `Cargo.toml` | Rust linting configuration (`[lints]` table) |
| `markdownlint-cli2.jsonc` | Markdown linting |
| `nu-lint.toml` | Nushell linting |
| `stylelintrc.json` | CSS linting (extended) |
| `yamllint.yaml` | YAML linting |
| `flake-snippets.nix` | Nix flake input and package references |

## Tool Reference

| Language | Tool | Flake Package | Config |
|----------|------|---------------|--------|
| JS/TS/JSON/CSS | Biome | `pkgs.biome` | `biome.json` |
| Markdown | markdownlint-cli2 | `pkgs.markdownlint-cli2` | `.markdownlint-cli2.jsonc` |
| Rust | clippy/rustfmt | rust-overlay | None |
| Nushell | nu-check/nu-lint | `nu-lint.packages.${system}.default` | `nu-lint.toml` |
| Nix | statix/deadnix/nixfmt | `pkgs.statix`, `pkgs.deadnix`, `pkgs.nixfmt-classic` | None |
| Shell | shellcheck/shfmt | `pkgs.shellcheck`, `pkgs.shfmt` | None |
| YAML | yamllint | `pkgs.yamllint` | `.yamllint.yaml` |
| TOML | taplo | `pkgs.taplo` | None |
| CSS | stylelint | Via npm | `.stylelintrc.json` |
| Lua | selene/stylua | `pkgs.selene`, `pkgs.stylua` | None |
| SQL | sqlx | `pkgs.sqlx-cli` | None |
| CI | woodpecker-cli | `pkgs.woodpecker-cli` | None |

### Nushell Flake Input

```nix
nu-lint = {
  url = "git+https://codeberg.org/wvhulle/nu-lint";
  inputs.nixpkgs.follows = "nixpkgs";
};
```

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

## Rust Linting Configuration

THE project SHALL enforce strict linting using the `[lints]` table in `Cargo.toml`.

THE linting configuration template is available at `skills/checks/Cargo.toml`.

WHERE a project requires additional allows THE developer SHALL add them with a comment explaining the reason.

THE developer SHALL NOT use `#[allow(...)]` attributes in code to bypass linting.

WHERE linting errors occur THE developer SHALL refactor code to satisfy the linter.

THE system SHALL integrate linting into CI pipeline.

WHERE the project uses sqlx THE `rust-lint` recipe SHALL also run `db-check` before clippy.

## Rules

THE justfile SHALL use the recipe naming convention: `lang-lint`, `lang-lint-fix`, `lang-fmt`, `lang-fmt-fix`.

THE `lint` recipe SHALL call all individual `lang-lint` recipes.

THE `fmt` recipe SHALL call all individual `lang-fmt` recipes.

THE `fix` recipe SHALL call all `lang-lint-fix` and `lang-fmt-fix` recipes.

THE `check` recipe SHALL call `fix`, `lint`, and `fmt`.

WHEN a linter has no fix capability THE `lang-lint-fix` recipe SHALL be identical to `lang-lint`.

WHEN adding tools THE flake.nix SHALL be updated with required packages.

WHEN adding tools THE justfile SHALL be updated with corresponding recipes.

WHEN a tool requires configuration THE config file SHALL be created from templates.

## Git Hooks

THE project SHALL use a pre-commit hook to run checks before commits.

THE hook SHALL be stored in `.githooks/pre-commit`.

THE hook SHALL use nushell for cross-platform compatibility.

THE hook SHALL support `SKIP_HOOKS` environment variable to bypass checks.

### Pre-commit Hook Template

**Without Playwright:**

```nu
#!/usr/bin/env nu

if "SKIP_HOOKS" not-in $env {
    just check
}
```

**With Playwright:**

```nu
#!/usr/bin/env nu

if "SKIP_HOOKS" not-in $env {
    just check
    just playwright
}
```

### Setup

1. Create `.githooks/` directory
2. Create `.githooks/pre-commit` with appropriate template
3. Make executable: `chmod +x .githooks/pre-commit`
4. Configure git: `git config core.hooksPath .githooks`

### Bypass

Skip hooks for a single commit: `SKIP_HOOKS=1 git commit`
