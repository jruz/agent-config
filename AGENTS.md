# Agent Configuration

This repository is the source of truth for shared Pi, Claude Code, and Codex configuration.

## Shared

- `global/AGENTS.md` — shared agent instructions
- `skills/` — shared skills
- `hooks/` — centralized `on_input`, `on_tool`, and `on_stop` hooks used by all agents
- `justfile` — repository recipes
- Edit repository sources, then run the relevant `link-*` recipe.

## Pi

- `pi/settings.json` — global settings, including the selected theme
- `pi/keybindings.json` — global keybindings
- `pi/themes/agent-config-dark.json` — global Pi theme
- `pi/extensions/` — global extensions
- `~/.local/state/pi/log/pi-agent-hooks.log` — agent-hook extension logs
- `~/.local/state/pi/log/pi-status-line.log` — status-line extension logs
- `just link-pi` — link Pi configuration

### Status-line verification

Visually verify changes to `pi/extensions/status-line.ts` with Pi in tmux:

```bash
tmux new-session -d -s pi-check -c /tmp/test-project 'pi --no-session --offline --no-tools --extension /path/to/status-line.ts'
sleep 2
tmux capture-pane -p -t pi-check
tmux kill-session -t pi-check
```

Check the captured footer, not only unit tests.

## Codex

- `codex/config.shared.toml` — shared configuration merged into the local Codex config
- `codex/hooks.json` and `hooks/` — shared hooks
- `just link-codex` — link Codex configuration
- `just codex-config-sync` — sync shared configuration without replacing personal settings

## Claude Code

- `claude/settings.json` — global settings
- `agents/` — subagents
- `commands/` — slash commands
- `hooks/` — hooks
- `output-styles/` — output styles
- `just link-claude` — link Claude Code configuration
- `just claude-migrate <OLD_PATH> <NEW_PATH>` — migrate Claude project history after moving a project

## Testing

- Vitest is the only unit test runner.
- Bun is the package manager and runtime used to execute Vitest.
- Test files use `.test.ts` and import test APIs from `vitest`.
- Run the full test suite with `just test` or the focused TypeScript recipe `just ts-test`.
- Do not use `bun:test` or invoke `bun test` for repository tests.

## Recipes

- `just setup` — install dependencies
- `just test` — run the full test suite
- `just check` — run checks
- `just fix` — format and fix files
- `just link` — link all agent configuration

Keep commits scoped to one area, such as a skill, hook, or settings change.
