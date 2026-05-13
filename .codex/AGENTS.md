# Global Agents Configuration

This repository contains shared configuration files for Claude Code and Codex symlinked to their respective ~/.codex and ~/.claude

## Main recipes

- `just link`
- `just check`
- `just claude-migrate <OLD_PATH> <NEW_PATH>` — when a project dir is moved, renames matching dirs in `~/.claude/projects/` and rewrites path references in session `.jsonl`, subagent logs, and `history.jsonl`

## Notes

- Hook logs are written to `$TMPDIR/claude/hooks.log`
- When creating commits, scope each commit to a single area (e.g., one commit per skill, one per hook, one for settings)
