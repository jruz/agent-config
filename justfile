setup:
    sandbox bun install

fix:
    just nix-fix
    just ts-fix

check:
    just ci-check
    just nix-check
    just ts-check

ci-check:
    woodpecker-cli lint .woodpecker/

link:
  just link-codex
  just link-claude
  just link-pi

link-pi:
    #!/usr/bin/env nu
    let root = "{{ justfile_directory() }}"
    ^mkdir --parents ~/.pi/agent
    ^rm --force ~/.pi/agent/hooks
    ^ln -sfnT $"($root)/pi/settings.json" ~/.pi/agent/settings.json
    ^ln -sfnT $"($root)/pi/keybindings.json" ~/.pi/agent/keybindings.json
    ^ln -sfnT $"($root)/global/AGENTS.md" ~/.pi/agent/AGENTS.md
    ^ln -sfnT $"($root)/skills" ~/.pi/agent/skills
    ^ln -sfnT $"($root)/pi/extensions" ~/.pi/agent/extensions
    let theme = $"($root)/pi/themes/agent-config-dark.json"
    ^mkdir --parents ~/.pi/agent/themes
    ^ln -sfn $theme ~/.pi/agent/themes/agent-config-dark.json

link-codex:
    #!/usr/bin/env nu
    let root = "{{ justfile_directory() }}"
    ^mkdir --parents ~/.codex
    ^rm --force ~/.codex/hooks
    ^ln -sfnT $"($root)/hooks" ~/.codex/hooks
    ^ln -sfnT $"($root)/codex/hooks.json" ~/.codex/hooks.json
    ^ln -sfnT $"($root)/skills" ~/.codex/skills
    ^ln -sfnT $"($root)/global/AGENTS.md" ~/.codex/AGENTS.md

link-claude:
    ln -sfn {{justfile_directory()}}/agents ~/.claude/agents
    ln -sfn {{justfile_directory()}}/commands ~/.claude/commands
    ln -sfn {{justfile_directory()}}/hooks ~/.claude/hooks
    ln -sfn {{justfile_directory()}}/skills ~/.claude/skills
    ln -sfn \
        {{justfile_directory()}}/claude/settings.json \
        ~/.claude/settings.json
    ln -sfn {{justfile_directory()}}/global/CLAUDE.md ~/.claude/CLAUDE.md
    ln -sfn {{justfile_directory()}}/output-styles ~/.claude/output-styles

# TypeScript
ts-test:
    sandbox bun run vitest

test:
    just ts-test

ts-check:
    #!/usr/bin/env nu
    let results = [
        (do { ^sandbox bun run prettier --check . } | complete)
        (do { ^sandbox bun run tsc --noEmit } | complete)
        (do { ^sandbox bun run eslint . } | complete)
    ]
    $results | each { |r|
        if ($r.stdout | str trim) != "" { print $r.stdout }
        if ($r.stderr | str trim) != "" { print --stderr $r.stderr }
    }
    if ($results | any { |r| $r.exit_code != 0 }) { exit 1 }

ts-fix:
    sandbox bun run prettier --write .
    sandbox bun run eslint . --fix

nix-check:
    fd \
        --extension nix \
        --exec nixfmt --check
    statix check .
    deadnix --fail .

nix-fix:
    fd \
        --extension nix \
        --exec nixfmt
    statix fix .
    deadnix --edit .

sandbox-test:
    sandbox bun scripts/sandbox-test.ts

claude-migrate OLD_PATH NEW_PATH:
    bun scripts/migrate-project.ts {{OLD_PATH}} {{NEW_PATH}}

codex-config-sync:
    sandbox bun scripts/codex-config-sync.ts
