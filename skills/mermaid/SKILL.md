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

| File                         | Purpose                         |
| ---------------------------- | ------------------------------- |
| `justfile`                   | Recipes                         |
| `flake.nix`                  | Nix flake packages and env vars |
| `scripts/mermaid-preview.ts` | Live preview server (Bun)       |
| `scripts/log.ts`             | Logging utility                 |
| `example.mmd`                | Example flowchart               |

## Flowchart Shapes (ISO 5807)

| Syntax     | Shape          | Use for              |
| ---------- | -------------- | -------------------- |
| `[text]`   | Rectangle      | Process / action     |
| `{text}`   | Diamond        | Decision / branching |
| `[/text/]` | Parallelogram  | Output to user       |
| `([text])` | Pill / stadium | Start / end          |
| `[(text)]` | Cylinder       | Data store           |
| `((text))` | Circle         | Connector            |

## Styling

Use `classDef` and `class` instead of per-node `style` lines.

| Class        | Color  | Hex       | Use for      |
| ------------ | ------ | --------- | ------------ |
| `ok`         | Green  | `#a6e3a1` | Ok / skip    |
| `action`     | Yellow | `#f9e2af` | Warnings     |
| `error`      | Red    | `#f38ba8` | Errors       |
| `sideEffect` | Mauve  | `#cba6f7` | Side effects |

Node text: `#1e1e2e`, node border: `#1e1e2e`.

## Rules

- Recipes use nushell
- Glob pattern matches the project's diagram directory (e.g., `specs/**/*.mmd`)
