# Claude Code Configuration

Personal Claude Code configuration with skills, commands, hooks, and agents.

## Structure

```
.claude/
├── skills/          # Domain-specific knowledge
├── commands/        # Slash commands (/j-pr, /j-plan, etc.)
├── hooks/           # Event hooks (on_prompt_submit, on_stop)
├── agents/          # Agent configurations
└── settings.json    # Claude Code settings
```

## Skills

| Skill | Description |
|-------|-------------|
| axum | Axum web framework |
| checks | Linters and formatters |
| chrome | Chrome DevTools MCP |
| code-quality | Code review guidelines |
| commands | Slash command creation |
| database | Database lifecycle |
| ears | EARS requirements syntax |
| git-commits | Commit structuring |
| github-search | GitHub code search |
| gleam | Gleam language |
| hooks | Claude hooks creation |
| justfile | Justfile recipes |
| maud | Maud HTML templates |
| nushell | Nushell scripting |
| plan-md | PLAN.md format |
| playwright | Playwright E2E tests |
| pr | PR title formatting |
| problem-modeling | Problem analysis |
| rust | Rust development |
| scss | SCSS stylesheets |
| skills | Skill creation |
| specs | Spec file organization |
| sqlx | SQLx queries |
| tracing | Rust tracing |
| typescript | TypeScript |
| woodpecker | Woodpecker CI |

## Commands

| Command | Description |
|---------|-------------|
| /j-add-git-hook | Add git pre-commit hook |
| /j-checks | Audit linting setup |
| /j-code-review | Review code quality |
| /j-plan | Create PLAN.md |
| /j-plan-status | Report plan progress |
| /j-pr | Prepare and push PR |

## Hooks

- **on_prompt_submit** - Runs before processing user input
- **on_stop** - Runs when Claude stops (notifications)

## License

[0BSD](LICENSE)
