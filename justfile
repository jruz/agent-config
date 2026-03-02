fix:
    just ts-fix

check:
    just ts-check

link:
    just link-agents
    just link-claude

# TypeScript
ts-check:
    npx prettier --check .
    npx tsc --noEmit
    bun run eslint .

ts-fix:
    npx prettier --write .
    bun run eslint . --fix

# Agents
link-agents:
    mkdir -p ~/.agents
    ln -sfn {{justfile_directory()}}/agents ~/.agents/agents
    ln -sfn {{justfile_directory()}}/commands ~/.agents/commands
    ln -sfn {{justfile_directory()}}/hooks ~/.agents/hooks
    ln -sfn {{justfile_directory()}}/skills ~/.agents/skills
    cp {{justfile_directory()}}/AGENTS_BASE.md ~/.agents/AGENTS.md

link-claude:
    ln -sfn {{justfile_directory()}}/commands ~/.claude/commands
    ln -sfn {{justfile_directory()}}/hooks ~/.claude/hooks
    ln -sfn {{justfile_directory()}}/skills ~/.claude/skills
    ln -sfn {{justfile_directory()}}/settings.json ~/.claude/settings.json
    rm -f ~/.claude/CLAUDE.md
    cat {{justfile_directory()}}/AGENTS_BASE.md {{justfile_directory()}}/AGENTS_CLAUDE.md > ~/.claude/CLAUDE.md

