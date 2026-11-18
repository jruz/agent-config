@~/dev/projects/agent-config/global/AGENTS.md

# claude tools

- never use AskUserQuestion tool, ask in plain text
- never use EnterPlanMode tool, just do the work directly
- never read or write to auto memory directories (~/.claude/projects/\*/memory/)
- always use the Edit and Write tools to change files, never sed, nu, or other shell text manipulation
- use the Bash tool only to run commands, checks, and git
- `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR` is set, so every Bash call starts in the project directory and `cd` does not persist
