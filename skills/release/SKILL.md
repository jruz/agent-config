---
name: release
description: Set up Rust CLI releases. Use when copying release templates into a repository or wiring version metadata and release CI.
---

# Release Setup

Copy-ready templates live in [files/](files/). Copy its contents into the repository root, including hidden directories, preserving the directory structure. Copy symlink targets as regular files.

The skill templates are the source of truth. Preserve unrelated repository configuration. If existing release configuration differs from the templates, ask for confirmation before resolving the deviation.

## Files to Copy

Copy every file inside [files/](files/) except `.gitignore`, which is merged.

Files outside `files/` are merge guidance, not part of the root copy.

Remove obsolete split Rust release scripts and recipes when replacing an existing setup.

Remove `.woodpecker/tag.yml`; `.woodpecker/release.yml` publishes the tag from pushes to `main`.

## Files to Modify

| Repository file       | Change                                                                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/main.rs`         | Declare `mod version;` and set the clap parser's `#[command(version = version::clap_version())]`. Adapt the path if the parser lives in another module. |
| `justfile`            | Add the `release` recipe from [references/justfile](references/justfile).                                                                               |
| `.just/rust.justfile` | Replace the `build`, `build-host`, `install` and `run` recipes with [references/rust.justfile](references/rust.justfile).                               |
| `AGENTS.md`           | Merge the Release section from [references/AGENTS.md](references/AGENTS.md).                                                                            |
| `README.md`           | Merge the installation section from [references/README.md](references/README.md), replacing `<project>` with the Cargo package name.                    |
| `.gitignore`          | Merge entries from [files/.gitignore](files/.gitignore) instead of overwriting.                                                                         |
| `Cargo.toml`          | Add the `build.rs` error dependency with `cargo add --build thiserror`.                                                                                 |

## Conditional Changes

- Existing `flake.nix`: merge project-specific dev shell tools into [files/flake.nix](files/flake.nix).
- `release.json` is missing until the first release publishes; `nix build` fails until then.
- Existing `build.rs`: merge the version metadata setup.
- OpenSSL/native TLS dependencies: change `Cargo.toml` to use Rustls with the `ring` provider; initialize that provider in binary entry points before HTTP calls.
- CI runner not configured: use the [woodpecker skill](../woodpecker/SKILL.md).
- Check `woodpecker-settings.yaml` if `GITHUB_TOKEN` is set, if not copy it over from the [woodpecker setup](../woodpecker/SETUP.md).

## Skill Development

[scripts/](scripts/) holds the release script tests and mocks. Copy them into a project only while developing [release.nu](files/scripts/release.nu) there, and remove them before committing.

Run the release tests after editing [release.nu](files/scripts/release.nu):

```sh
nu "$HOME/.pi/agent/skills/nushell/files/scripts/nushell-test.nu" "$HOME/.pi/agent/skills/release/scripts"
```
