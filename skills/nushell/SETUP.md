# Nushell Setup

- Add `nushell`, `nu-lint`, and `fd` to `flake.nix`.
- Sync [files/](files/) into the repository root, preserving relative paths. These files are the source of truth.
- Add `mod nushell '.just/nushell.justfile'` to the root `justfile`.
