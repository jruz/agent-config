---
name: mermaid
description: Validate Mermaid diagrams. Use when adding mermaid checks or linting mermaid files.
---

# Mermaid Diagrams

Validate Mermaid diagram files using `mmdc` (Mermaid CLI).

## File Convention

| Extension | Purpose                          |
| --------- | -------------------------------- |
| `.mmd`    | Standalone Mermaid diagram files |

## Templates

| File         | Purpose                      |
| ------------ | ---------------------------- |
| `justfile`   | Recipe for `mermaid-check`   |
| `devenv.nix` | Devenv packages and env vars |

## Dependencies

| Tool     | Nix Package                       | Purpose                        |
| -------- | --------------------------------- | ------------------------------ |
| `mmdc`   | `pkgs.mermaid-cli`                | Mermaid CLI renderer/validator |
| Chromium | `pkgs.playwright-driver.browsers` | Headless browser for rendering |

## Rules

THE recipe SHALL use Playwright's bundled Chromium via `PUPPETEER_EXECUTABLE_PATH`.

THE recipe SHALL use nushell for cross-platform compatibility.

THE glob pattern SHALL match the project's diagram directory (e.g., `specs/**/*.mmd`).
