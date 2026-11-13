mod ts '.just/ts.justfile'
mod bun '.just/bun.justfile'

root := justfile_directory()

parallel +RECIPES:
    #!/usr/bin/env nu
    let runs = ([{{ RECIPES }}] | par-each {|recipe|
        ^just $recipe o+e>| complete | insert recipe $recipe })
    for run in $runs {
        if $run.exit_code == 0 {
            print $"PASS ($run.recipe)"
        } else {
            print $"FAIL ($run.recipe)" $run.stdout
        }
    }
    if ($runs | any {|run| $run.exit_code != 0 }) { exit 1 }

setup:
    just ts::install

fix:
    just parallel nix-fix nu-fix ts::fix md-fix

check:
    just parallel \
        ci-check \
        nix-check \
        nu-check \
        ts::check \
        md-check

test:
    just ts::test
    just bun::test
    just hooks-test
    just skills-test

hooks-test:
    nu skills/nushell/files/scripts/nushell-test.nu hooks

skills-test:
    sandbox bun test \
        skills/typescript/skill-check \
        skills/typescript/skill-pull

ci-check:
    woodpecker-cli lint .woodpecker/

link:
    just link-codex
    just link-claude
    just link-pi

link-pi:
    mkdir --parents ~/.pi/agent/themes
    rm --force ~/.pi/agent/hooks
    ln -sfnT {{ root }}/pi/settings.json ~/.pi/agent/settings.json
    ln -sfnT {{ root }}/pi/keybindings.json ~/.pi/agent/keybindings.json
    ln -sfnT {{ root }}/pi/mcp.json ~/.pi/agent/mcp.json
    ln -sfnT {{ root }}/global/AGENTS.md ~/.pi/agent/AGENTS.md
    ln -sfnT {{ root }}/skills ~/.pi/agent/skills
    ln -sfnT {{ root }}/hooks ~/.pi/agent/agent-config-hooks
    ln -sfnT {{ root }}/pi/prompts ~/.pi/agent/prompts
    ln -sfnT \
        {{ root }}/pi/themes/agent-config-dark.json \
        ~/.pi/agent/themes/agent-config-dark.json

link-codex:
    mkdir --parents ~/.codex ~/.agents
    rm --force ~/.codex/hooks
    ln -sfnT {{ root }}/hooks ~/.codex/hooks
    ln -sfnT {{ root }}/codex/hooks.json ~/.codex/hooks.json
    ln -sfnT {{ root }}/skills ~/.codex/skills
    ln -sfnT {{ root }}/skills ~/.agents/skills
    ln -sfnT {{ root }}/global/AGENTS.md ~/.codex/AGENTS.md

link-claude:
    ln -sfnT {{ root }}/agents ~/.claude/agents
    ln -sfnT {{ root }}/commands ~/.claude/commands
    ln -sfnT {{ root }}/hooks ~/.claude/hooks
    ln -sfnT {{ root }}/skills ~/.claude/skills
    ln -sfnT {{ root }}/claude/settings.json ~/.claude/settings.json
    ln -sfnT {{ root }}/global/CLAUDE.md ~/.claude/CLAUDE.md
    ln -sfnT {{ root }}/output-styles ~/.claude/output-styles
    ln -sfnT {{ root }}/keybindings.json ~/.claude/keybindings.json

md-check:
    sandbox pnpm exec markdownlint-cli2 "**/*.md"

md-fix:
    sandbox pnpm exec markdownlint-cli2 --fix "**/*.md"

nix-check:
    just parallel nix-nixfmt-check nix-statix-check nix-deadnix-check

nix-nixfmt-check:
    fd \
        --extension nix \
        --exec nixfmt --check

nix-statix-check:
    statix check .

nix-deadnix-check:
    deadnix --fail .

nix-fix:
    fd \
        --extension nix \
        --exec nixfmt
    statix fix .
    deadnix --edit .

nu-check:
    #!/usr/bin/env nu
    (^fd --absolute-path --extension nu
        --exec nu --commands 'nu-check --debug {} | ignore')
    let hooks = (^rg --files-with-matches '^#!/usr/bin/env .*nu' hooks
        | lines
        | path expand)
    for hook in $hooks { nu-check --debug $hook | ignore }
    ^nu-lint --config nu-lint.toml
    ^nu-lint --config nu-lint.toml ...$hooks

nu-fix:
    nu-lint \
        --config nu-lint.toml \
        --fix

claude-migrate OLD_PATH NEW_PATH:
    bun scripts/migrate-project.ts {{ OLD_PATH }} {{ NEW_PATH }}

codex-config-sync:
    bun scripts/codex-config-sync.ts
