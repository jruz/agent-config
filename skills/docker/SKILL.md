---
name: docker
description: Write Dockerfiles using registry images and BuildKit cache mounts. Use when writing Dockerfiles, adding Docker images, configuring build caching, or working with container builds.
---

# Docker

## Registry Images

| Image                         | Tag         | Includes                                                                                                                               |
| ----------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `registry.jruz.io/bun`        | `1.3.11-1`  | bun                                                                                                                                    |
| `registry.jruz.io/node`       | `24.14.1-1` | node, pnpm                                                                                                                             |
| `registry.jruz.io/playwright` | `1.58.2-2`  | node, pnpm, playwright, chromium (Debian-based)                                                                                        |
| `registry.jruz.io/rust`       | `1.94.1-2`  | rust, clippy, rustfmt, cargo-nextest, cargo-watch, cargo-binstall, pkgconf, openssl-dev, musl-dev (Alpine-based, static musl binaries) |
| `registry.jruz.io/tools`      | `25.11-1`   | nix, deadnix, nixfmt, hadolint, statix, woodpecker-cli                                                                                 |

Registry source and version tags: `/mnt/work/projects/registry/justfile`

## Cache Mounts

Global to the BuildKit instance — shared across all projects and worktrees. Must be on each `RUN` line (not inheritable from base images).

```dockerfile
RUN --mount=type=cache,target=/usr/local/cargo/registry cargo build --release
RUN --mount=type=cache,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile
RUN --mount=type=cache,target=/root/.bun/install/cache bun install --frozen-lockfile
```

## Rust Dependency Caching

Dummy build caches dependency compilation. Clean the app crate's fingerprints and deps before the real build — otherwise cargo reuses the dummy binary.

```dockerfile
COPY Cargo.toml Cargo.lock ./
RUN mkdir -p src/bin && echo "fn main() {}" > src/bin/app.rs && touch src/lib.rs
RUN --mount=type=cache,target=/usr/local/cargo/registry cargo build --release --bin app
RUN rm -rf src/ target/release/.fingerprint/CRATE-* target/release/deps/CRATE-* target/release/deps/libCRATE-* target/release/app

COPY src/ src/
RUN --mount=type=cache,target=/usr/local/cargo/registry cargo build --release --bin app
```

## Rules

- Use `registry.jruz.io/` images, not `docker.io/`
- Add cache mounts to every `RUN` that downloads packages
- Use `alpine` for runtime stages (rust produces static musl binaries)
- Pin full image tags (e.g., `1.94.1-2`)
