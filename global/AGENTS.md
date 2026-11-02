# rules

- be concise. avoid long explanations.
- don't ask questions you can answer yourself. research first, ask only when stuck.
- don't ask the user to run commands, run them yourself
- when asking the user to make decisions, present one point at a time. wait for feedback, apply it, then proceed to the next
- prefer bullet points over paragraphs
- after making changes make sure `just check; slop-detector` passes

## environment and secrets

- Never inspect or expose plaintext secrets or dump environment variables.
- Run project recipes/scripts that use SOPS. They may handle secrets internally, but must not expose the values.
- Ask before changing secrets.
- You may inspect encrypted files, key names, `.envrc`, public keys, and `~/.ssh/config`.

## execution safety

- Run package managers and code that may execute third-party dependencies through `sandbox`. This includes npm, pnpm, yarn, bun, Python package tooling, Cargo, and similar tools.
- only code that has no external dependencies might be allowed to run unsanboxed.
- regular cli tools either from the system or from the flake can be run directly.
- If a required package manager is unavailable inside `sandbox`, report the blocker rather than running it unsandboxed.

## coding style

- focus on the happy path first
- if in doubt ask the user how to handle edge cases
- don't write defensive code, use the type system for that
- never provide defaults, if it's not there it should fail clearly
- never hide errors
- handle expected failures using the conventions defined in the relevant language skill
- use a functional style
- always use an event-driven architecture with unidirectional data flow
- never write comments, instead make sure code is easy to follow
- never bypass the linter or playwright, look for ways to solve the problem
- if you find a pre-existing issue/bug, tell the user even if unrelated
- avoid complecting code, single responsibility modules
- connect small functions in a pipeline style
- early return edge cases
- last part of the function should return coherently with the name of the function

## rust

- bubble errors up with `?`
- every module should have a thiserror enum
- when a module has multiple Rust implementation files, keep mod.rs limited to module declarations and re-exports
- when a module folder has only one Rust implementation file, put the implementation in mod.rs; companion assets such as SCSS do not count as Rust implementation files
- if something can fail, use Result. never convert a Result to Option

## ui

- always verify visually what you did either with chrome-cli or vhs/tmux

## typescript

- use type not interface
- validate with zod

## python

- is not globally available use `sandbox bun -e` or `nu -c` for inline script execution

## markdown

- keep them short and focused
- use references to files for context avoid mentioning information that can grow stale
- one item per bullet, don't put multiple items separated by commas

## justfiles

- recipe names should follow format <area>-<action> e.g: `rust-check`
- use long version of command flags when possible (e.g., --session instead of -s)
- long commands should be split into multiple lines
- recipes without scripts should use regular just shell
- inline recipe scripts should be written in nushell
- if an inline script exceeds 10 lines, extract it to scripts/<recipe-name>.ts (bun)

## scripts

- write them using bun
- if they need tests use bun test

## commits

- always use the Skill(commit) when creating commits
- if you made a commit and your next commit is the same topic or a fix amend the previous
- confirm before rewriting history but prefer that over making multiple commits
- when working on a branch/worktree outside of main you can rewrite history and force push without confirmation

## plan

- PLAN.md is git ignored
- always follow the Skill(plan-md) format when writing PLAN.md
- when user writes p: <issue>, means add that topic to the plan

## tools

- if there's a flake it's probably loaded already with .envrc and the tools you have access to are defined there
- if you make changes to the flake confirm the flake builds then ask the user to reload the shell or you won't have access to them
- use ripgrep (rg) instead of grep for searching
- use fd instead of find for finding files
- when adding dependencies, use the package manager add command (e.g., cargo add, pnpm/bun install) to get the latest version instead of manually editing manifest files
- never run multiple Bash commands in a single line, execute them one at a time so each can be easily reviewed

## problems

- if you run into issues with a dependency ask the user before trying to patch them

## paths

- Global Skills: ~/dev/projects/agent-config/skills/
- Global Hooks: ~/dev/projects/agent-config/hooks/
- Global AGENTS.md: ~/dev/projects/agent-config/global/AGENTS.md
- Pi Settings: ~/dev/projects/agent-config/pi/settings.json
- Personal Projects: ~/dev/projects/
- Dotfiles: ~/dev/dotfiles/
