# rules

- be concise. avoid long-winded explanations.
- don't ask questions you can answer yourself. research first, ask only when stuck.
- don't ask the user to run commands, run them
- when asking the user to make decisions, present one point at a time. wait for feedback, apply it, then proceed to the next
- prefer bullet points over paragraphs

## environment and secrets

- never read env vars from the shell, assume they are already set
- never read .env files, you can read sops encrypted .env.\*.yaml files
- never read ~/.ssh/ (keys, config, or any other similar file)
- never read, print, or extract secrets from any source (containers, vaults, APIs, config files, logs, memory, or anywhere else)

## execution safety

- Run package managers and code that may execute third-party dependencies through `sandbox`. This includes npm, pnpm, yarn, bun, Python package tooling, Cargo, and similar tools.
- Trusted system, infrastructure, and inspection commands may run directly, including `nomad`, `nix`, `git`, `ssh`, `journalctl`, `systemctl`, `rg`, `fd`, `chrome-cli`, and `slop-detector`.
- If a required package manager is unavailable inside `sandbox`, report the blocker rather than running it unsandboxed.

## coding style

- focus on the happy path first
- if in doubt ask the user how to handle edege cases
- don't write defensive code, use the type system for that
- never provide defaults, if it's not there it should fail clearly
- never hide errors
- use a functional style
- never write comments, instead make sure code is easy to follow
- never bypass the linter or playwright, look for ways to solve the problem either refactoring or following the recommendations
- if you find a pre-existing issue/bug, tell the user even if unrelated
- avoid complecting code, one function per action
- connect small functions in a pipeline style
- early return edge cases
- last part of the function should return coherently with the name of the function

## rust

- bubble errors up with `?`
- every module should have a thiserror enum
- never write code on a mod.rs only exports
- if something can fail, use Result. never convert a Result to Option

## typescript

- if something can fail, always use try/catch and log the error
- use type not interface

## justfiles

- recipe names should follow format <area>-<action> e.g: `rust-check`
- use long version of command flags (e.g., --session instead of -s)
- long commands should be split into multiple lines
- inline recipe scripts should be written in nushell
- if an inline script exceeds 10 lines, extract it to scripts/<recipe-name>.ts and execute with bun

## skills

- always use the Skill(commit) when creating commits
- always follow the Skill(plan-md) format when writing PLAN.md
- when user writes p: issue, means add that topic to PLAN.md using Skill(plan-md) format

## tools

- use ripgrep (rg) instead of grep for searching
- use fd instead of find for finding files
- when adding dependencies, use the package manager add command (e.g., cargo add, npm install) to get the latest version instead of manually editing manifest files
- never run multiple Bash commands in a single line, execute them one at a time so each can be reviewed

## paths

- Global Skills: ~/dev/projects/agent-config/skills/
- Global Settings: ~/dev/projects/agent-config/codex/config.shared.toml
- Global Hooks: ~/dev/projects/agent-config/hooks/
- Personal Projects: ~/dev/projects/
- Dotfiles: ~/dev/dotfiles/
