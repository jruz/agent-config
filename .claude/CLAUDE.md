# Global Claude Code Configuration

This repository (`~/dev/.claude/`) contains shared configuration for Claude Code, symlinked into `~/.claude/`.

## Main files

- `CLAUDE.md`
- `settings.json`
- `commands/`
- `hooks/`
- `skills/`
- `output-styles/`
- `agents/`

## Main recipes

- `just link`
- `just check`
- `just fix`

## Notes

- Hook logs are written to `$TMPDIR/claude/hooks.log`
- When creating commits, scope each commit to a single area (e.g., one commit per skill, one per hook, one for settings)
