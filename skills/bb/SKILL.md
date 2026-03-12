---
name: bb
description: Write Babashka scripts. Use when writing Clojure scripts with Babashka.
---

# Babashka

Use this skill when writing Babashka (bb) scripts.

## Project Setup

Copy `bb.edn`, `scripts/log.clj` from this skill folder to the project.

Add dependencies from `flake.nix` to the project flake.

Merge recipes from `justfile` into the project justfile.

## Script Structure

THE script SHALL start with a shebang `#!/usr/bin/env bb`.

THE script SHALL use `(require '[log])` for logging via the shared `scripts/log.clj` module.

THE script SHALL use `(System/exit 1)` for non-zero exit codes.

## Namespaces

THE script SHALL declare a namespace with `(ns ...)` when defining reusable functions.

THE script SHALL use `(require '[...])` for dependencies.

THE script SHALL NOT use `load-file`.

## Style

THE script SHALL use `let` bindings for intermediate values.

THE script SHALL use threading macros (`->`, `->>`) for pipelines.

THE script SHALL use destructuring for complex data.

THE script SHALL NOT use mutable state (`atom`, `ref`, `agent`).

## Error Handling

THE script SHALL use explicit checks and `(System/exit 1)` on failure.

THE script SHALL log errors with `(log/error ...)` before exiting.
