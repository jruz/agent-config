# claude base

- be concise. avoid long-winded explanations.
- never give opinions or recommendations unless the user asks for them
- when asking the user to make decisions, present one point at a time. wait for feedback, apply it, then proceed to the next
- prefer bullet points over paragraphs

## environment and secrets

- never read env vars from the shell, assume they are already set
- never read .env files
- never read ~/.ssh/ (keys, config, or any other file)
- never read, print, or extract secrets from any source (containers, vaults, APIs, config files, logs, memory, or anywhere else)

## coding style

- never provide defaults
- never hide errors
- in doubt ask the user how to handle errors
- functional style
- never write comments instead make sure code is easy to follow
- never bypass the linter or playwright, look for ways to solve the problem either refactoring or following the recommendations
- if you find a pre-existing issue/bug, tell the user even if unrelated
- avoid complecting code, one function per action
- connect small functions in a pipeline style
- early return edge cases
- last part of the function should return coherent with the name

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

- Global Skills: ~/dev/.claude/skills/
- Global Settings: ~/dev/.claude/settings.json
- Global Hooks: ~/dev/.claude/hooks/
- Personal Projects: ~/dev/projects/
- Dotfiles: ~/dev/dotfiles/

# claude tools

- never use AskUserQuestion tool, ask in plain text
- never use EnterPlanMode tool, just do the work directly
- never read or write to auto memory directories (~/.claude/projects/\*/memory/)
