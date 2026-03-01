# Global Agent Configuration

This repository (`~/dev/.claude/`) contains shared configuration for AI coding agents (Claude Code, OpenCode, Codex, etc.). Each agent has its own config directory but shares the same base instructions and skills through symlinking.

## Structure

- `AGENTS_BASE.md` - Shared instructions loaded by all agents (Claude Code, OpenCode, Codex)
- `AGENTS_CLAUDE.md` - Claude Code-specific instructions (appended to CLAUDE.md)
- `settings.json` - Claude Code settings (permissions, model preferences)
- `agents/` - Custom agent definitions
- `commands/` - Custom slash commands
- `hooks/` - Event hooks for automation
- `skills/` - Custom skills

## Symlinking

The justfile provides two recipes that symlink this repo's contents into the agent-specific config directories.

### `just link-claude`

Links into `~/.claude/` for Claude Code:
- Symlinks `commands/`, `hooks/`, `skills/`, and `settings.json`
- Generates `~/.claude/CLAUDE.md` by concatenating `AGENTS_BASE.md` + `AGENTS_CLAUDE.md`

### `just link-agents`

Links into `~/.agents/` for other agents (OpenCode, Codex):
- Symlinks `agents/`, `commands/`, `hooks/`, and `skills/`
- Copies `AGENTS_BASE.md` as `~/.agents/AGENTS.md`

## Other Recipes

- `just nu-check` - Lint all `.nu` files with `nu-check` and `nu-lint`
- `just nu-fix` - Auto-fix nu-lint issues
- `just check` - Run fix then lint
- `just lint` - Alias for `nu-check`

## TypeScript Coding Style

- Use `type` instead of `interface`
- Never use `??` or `||` to silently provide default values; check explicitly and handle the missing case
- Never return `undefined` silently; log the error using the shared logger (`hooks/logger.ts`) before returning
- Import the logger with `import { log } from "./logger"` and call `await log("ERROR", "hook_name", { reason: "..." })`
- Use `console.error` instead of `process.stderr.write`

## Notes

- When editing settings.json, keep all allow and deny lists sorted alphabetically
- Hook logs are written to `$TMPDIR/claude/hooks.log`
