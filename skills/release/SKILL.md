---
name: release
description: Configure release versioning for Rust projects. Use when adding --version output, build metadata, or release configuration.
---

# Release Specification

## Overview

This specification defines the release versioning pattern for Rust CLI projects. It embeds version, revision, and build time into the binary via `--version`.

## Build Script

THE project SHALL contain a `build.rs` from the template at `skills/release/src/build.rs`.

## Version Module

THE project SHALL contain a `src/version.rs` from the template at `skills/release/src/version.rs`.

THE clap command SHALL use `#[command(version = version::clap_version())]`.

THE `main.rs` SHALL declare `mod version;`.

## REVISION Environment Variable

THE project SHALL contain a `.envrc` from the template at `skills/release/.envrc`.

THE `.envrc` SHALL append `export REVISION=dev` for local development.

THE Woodpecker CI steps SHALL set `REVISION: ${CI_COMMIT_SHA}` in their environment.

AFTER modifying `.envrc` THE system SHALL tell the user to reload their shell and wait for confirmation before proceeding with any build or check commands.

## Nix Flake

THE project SHALL contain a `flake.nix` from the template at `skills/release/flake.nix`.

THE `description` field SHALL be replaced with the project description.

THE `devShells.default` packages list SHALL include any additional project dependencies.

## Codeberg Releases

THE Codeberg repo SHALL have releases enabled (`has_releases = true` in `codeberg-settings.toml`).

THE system SHALL use the codeberg skill to enable releases via `codeberg-settings apply`.

## CI Pipelines

THE project SHALL contain `.woodpecker/tag.yml` from the template at `skills/release/.woodpecker/tag.yml`.

THE project SHALL contain `.woodpecker/release.yml` from the template at `skills/release/.woodpecker/release.yml`.

## Release Scripts

THE project SHALL contain `scripts/release-build.sh` from the template at `skills/release/scripts/release-build.sh`.

THE project SHALL contain `scripts/release-upload.ts` from the template at `skills/release/scripts/release-upload.ts`.

THE project SHALL contain `scripts/release-delete.ts` from the template at `skills/release/scripts/release-delete.ts`.

THE project SHALL contain `scripts/log.ts` from the template at `skills/release/scripts/log.ts`.

## Justfile Recipes

THE project SHALL merge recipes from `skills/release/justfile` into the project justfile.

## Cross-Platform Builds and TLS

NEVER use `native-tls`/OpenSSL. It requires extensive Nix env vars (`OPENSSL_DIR`, `OPENSSL_LIB_DIR`, etc.) and breaks cargo-zigbuild cross-compilation.

THE project SHALL use `rustls` with the `ring` crypto provider:

```toml
reqwest = { version = "...", default-features = false, features = ["blocking", "http2", "json", "rustls-no-provider"] }
rustls = { version = "...", default-features = false, features = ["ring", "logging", "std", "tls12"] }
```

THE binary entry points SHALL initialize the crypto provider before any HTTP calls:

```rust
rustls::crypto::ring::default_provider()
    .install_default()?;
```

## Gitignore

THE project SHALL contain a `.gitignore` from the template at `skills/release/.gitignore`, preserving any existing content.

## Required Changes Checklist

WHEN adding release versioning to a project THE system SHALL:

1. Create `build.rs` from `skills/release/src/build.rs`
2. Create `src/version.rs` from `skills/release/src/version.rs`
3. Add `mod version;` to `main.rs`
4. Set `#[command(version = version::clap_version())]` on the clap parser
5. Create `.envrc` from `skills/release/.envrc`, preserving any existing content
6. Tell the user to reload their shell and wait for confirmation before running any build or check commands
7. Add `REVISION: ${CI_COMMIT_SHA}` to all Woodpecker CI build steps
8. Create `flake.nix` from `skills/release/flake.nix`, replacing `description` and adding project-specific dev dependencies
9. Create `.woodpecker/tag.yml` from `skills/release/.woodpecker/tag.yml`
10. Create `.woodpecker/release.yml` from `skills/release/.woodpecker/release.yml`
11. Create `scripts/release-build.sh` from `skills/release/scripts/release-build.sh`
12. Create `scripts/release-upload.ts` from `skills/release/scripts/release-upload.ts`
13. Create `scripts/release-delete.ts` from `skills/release/scripts/release-delete.ts`
14. Create `scripts/log.ts` from `skills/release/scripts/log.ts`
15. Merge recipes from `skills/release/justfile` into the project justfile
16. Merge entries from `skills/release/.gitignore` into the project `.gitignore`
17. Enable releases on Codeberg (`has_releases = true`) via the codeberg skill
