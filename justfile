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
    #!/usr/bin/env nu
    let results = [
        (do { ^npx prettier --check . } | complete)
        (do { ^npx tsc --noEmit } | complete)
        (do { ^bun run eslint . } | complete)
    ]
    $results | each { |r|
        if ($r.stdout | str trim) != "" { print $r.stdout }
        if ($r.stderr | str trim) != "" { print --stderr $r.stderr }
    }
    if ($results | any { |r| $r.exit_code != 0 }) { exit 1 }

ts-fix:
    npx prettier --write .
    bun run eslint . --fix
