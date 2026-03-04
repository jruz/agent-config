# Global Claude Code Configuration

This repository (`~/dev/.claude/`) contains shared configuration for Claude Code, symlinked into `~/.claude/`.

## Structure

- `CLAUDE.md` - Global instructions (symlinked to `~/.claude/CLAUDE.md`)
- `settings.json` - Permissions and model preferences
- `commands/` - Custom slash commands
- `hooks/` - Event hooks for automation
- `skills/` - Custom skills

## Symlinking

### `just link-claude`

Symlinks `CLAUDE.md`, `commands/`, `hooks/`, `skills/`, and `settings.json` into `~/.claude/`.

## Other Recipes

- `just check` - Run fix then lint
- `just ts-check` - Run prettier, tsc, and eslint
- `just ts-fix` - Auto-fix with prettier and eslint

## TypeScript Coding Style

- Use `type` instead of `interface`
- Never use `??` or `||` to silently provide default values; check explicitly and handle the missing case
- Never return `undefined` silently; log the error using the shared logger (`hooks/logger.ts`) before returning
- Import the logger with `import { log } from "./logger"` and call `await log("ERROR", "hook_name", { reason: "..." })`
- Use `console.error` instead of `process.stderr.write`

## Notes

- When editing settings.json, keep all allow and deny lists sorted alphabetically
- Hook logs are written to `$TMPDIR/claude/hooks.log`
