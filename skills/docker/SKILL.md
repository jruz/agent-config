---
name: docker
description: Write Dockerfiles and run hardened containers using registry images and BuildKit cache mounts. Use when writing Dockerfiles, configuring container isolation, adding Docker images, configuring build caching, or working with container builds.
---

# Docker

## Registry Images

| Image                         | Includes                                                                                                              |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `oven/bun`                    | bun                                                                                                                   |
| `registry.jruz.io/node`       | node, pnpm                                                                                                            |
| `registry.jruz.io/playwright` | node, pnpm, playwright, chromium (Debian-based)                                                                       |
| `registry.jruz.io/rust`       | rust, clippy, rustfmt, cargo-binstall, cargo-nextest, cargo-watch, cargo-machete, just, sqlx-cli, mold (Debian-based) |
| `registry.jruz.io/tools`      | nix, deadnix, nixfmt, hadolint, statix, woodpecker-cli                                                                |

Current tags: `~/dev/projects/registry/scripts/images.ts`

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
COPY .cargo/ .cargo/
RUN mkdir -p src/bin && echo "fn main() {}" > src/bin/app.rs && touch src/lib.rs
RUN --mount=type=cache,target=/usr/local/cargo/registry cargo build --release --bin app
RUN rm -rf src/ target/release/.fingerprint/CRATE-* target/release/deps/CRATE-* target/release/deps/libCRATE-* target/release/app

COPY src/ src/
RUN --mount=type=cache,target=/usr/local/cargo/registry cargo build --release --bin app
```

## Runtime Isolation

Run from the repository root with `IMAGE` set to a version-pinned Bun image and `tmp/example.ts` present:

```bash
uid="$(id --user)"
gid="$(id --group)"
root="$(git rev-parse --show-toplevel)"

docker run \
  --rm \
  --interactive \
  --user "$uid:$gid" \
  --read-only \
  --cap-drop ALL \
  --security-opt no-new-privileges \
  --tmpfs /tmp:exec \
  --tmpfs "$HOME" \
  --env "HOME=$HOME" \
  --env TMPDIR=/tmp \
  --mount "type=bind,src=$root,dst=/app" \
  --workdir /app \
  "${IMAGE:?Set IMAGE to a version-pinned Bun image}" \
  bun /app/tmp/example.ts
```

- Add `--tty` only when stdin and stdout are terminals.
- For rootless Podman, also use `--userns keep-id` with the explicit user.
- Mount writable runtime caches separately from the read-only container filesystem.

## Rules

- Use `registry.jruz.io/` images except Bun, which uses the official `oven/bun` image
- Add cache mounts to every `RUN` that downloads packages
- Use `debian:trixie-slim` or distroless for rust runtime stages (rust produces glibc binaries)
- Pin full image tags (e.g., `1.99.1`)
