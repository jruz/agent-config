---
name: commands
description: Create Claude Code slash commands. Use when adding a Claude Code slash command.
---

# Slash Commands

User-invocable prompts stored as Markdown files. [Full documentation](https://code.claude.com/docs/en/slash-commands)

## Location

| Scope | Path | Visibility |
|-------|------|------------|
| Project | `.claude/commands/<name>.md` | Team (project) |
| Personal | `~/.claude/commands/<name>.md` | All projects (user) |

## Format

```markdown
---
description: Brief description of what the command does
allowed-tools: Tool1, Tool2
argument-hint: [arg1] [arg2]
---

Command prompt using EARS syntax.
```

## Frontmatter Fields

| Field | Purpose |
|-------|---------|
| `description` | Brief description (required) |
| `allowed-tools` | Tools the command can use |
| `argument-hint` | Expected arguments shown in autocomplete |
| `model` | Specific model to use |

## Arguments

| Syntax | Purpose |
|--------|---------|
| `$ARGUMENTS` | All arguments as single string |
| `$1`, `$2` | Positional arguments |

## Dynamic Content

| Prefix | Purpose | Example |
|--------|---------|---------|
| `!` | Execute bash | `!git status` |
| `@` | Include file | `@src/main.rs` |

## Rules

THE command file SHALL have a `.md` extension.

THE command file SHALL include a `description` in frontmatter.

THE command prompt SHALL be written using EARS syntax.

WHEN a command is created THE command SHALL be added to `.claude/settings.json` allow list as `Skill(<command-name>)`.

WHERE a command uses tools THE `allowed-tools` field SHALL list them explicitly.
