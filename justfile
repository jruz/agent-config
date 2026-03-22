fix:
    just ts-fix

check:
    just ts-check

link:
    ln -sfn {{justfile_directory()}}/agents ~/.claude/agents
    ln -sfn {{justfile_directory()}}/commands ~/.claude/commands
    ln -sfn {{justfile_directory()}}/hooks ~/.claude/hooks
    ln -sfn {{justfile_directory()}}/skills ~/.claude/skills
    ln -sfn {{justfile_directory()}}/settings.json ~/.claude/settings.json
    ln -sfn {{justfile_directory()}}/CLAUDE.md ~/.claude/CLAUDE.md
    ln -sfn {{justfile_directory()}}/output-styles ~/.claude/output-styles

# TypeScript
ts-check:
    npx prettier --check .
    npx tsc --noEmit
    bun run eslint .

ts-fix:
    npx prettier --write .
    bun run eslint . --fix
