---
name: justfile
description: Use when creating, editing, or adding recipes to a justfile, or writing task runner commands.
---

# Justfile Specification

### Overview

This specification defines how to write and organize justfiles (task runner configuration files) using `just` as the command runner. All project automation SHALL be defined in justfiles using nushell for script bodies.

### Core Requirements

THE system SHALL use `just` as the task runner for all commands.

THE system SHALL NOT use bash scripts for task automation.

WHERE a command does not exist in the justfile THE developer SHALL add it before using it.

### Script Language

THE justfile recipes with script bodies SHALL use nushell exclusively.

WHERE a recipe needs to execute a script THE recipe SHALL use the `#!/usr/bin/env nu` shebang.

### Recipe Length

WHERE a justfile recipe body exceeds 10 lines THE developer SHALL extract it to a script file.

WHERE a recipe is extracted THE recipe body SHALL call the script using `nu scripts/<name>.nu`.

### Recipe Structure

#### Simple Recipes

WHERE a recipe executes a single command THE recipe MAY omit the shebang.

```just
build:
  npm run build
```

#### Script Recipes

WHERE a recipe has multiple commands or logic THE recipe SHALL use a nushell script body.

```just
kill-server:
  #!/usr/bin/env nu
  if ($env.PORT? | is-empty) {
      error make {msg: "PORT environment variable is not set"}
  }
  try { ^lsof $"-ti:($env.PORT)" -sTCP:LISTEN | lines | each { |pid| try { ^kill -9 $pid } } }
```

#### Extracted Recipes

WHERE a recipe is extracted to a script THE recipe SHALL follow this pattern:

```just
check:
  nu scripts/check.nu
```

THE script name SHALL match the recipe name with `.nu` extension.

THE recipe SHALL call nu directly without a shebang.

### Output and Messaging

THE recipes SHALL use `print` for output, not `echo`.

THE recipes SHALL follow nushell output formatting conventions.

### Variable Expansion

WHERE justfile variables are used in nushell scripts THE developer SHALL use justfile's `{{VARIABLE}}` syntax.

WHERE nushell variables are needed THE developer SHALL assign justfile variables to nushell variables.

```just
tab-create BRANCH:
  #!/usr/bin/env nu
  let worktree_path = "{{REPO_ROOT}}/{{BRANCH}}"
  print $"Creating tab for ($worktree_path)"
```

### External Commands

WHERE nushell scripts call external commands THE developer SHALL prefix them with `^`.

### Error Handling

THE recipes SHALL follow nushell error handling patterns.

### Recipe Dependencies

WHERE a recipe depends on other recipes THE recipe SHALL list them as dependencies.

```just
dev: kill-server build
  sleep 1
  just start-server
```

THE recipes SHALL NOT duplicate logic that exists in other recipes.

WHERE common functionality is needed THE developer SHALL create a dedicated recipe and call it.

### Recipe Naming

THE recipe names SHALL use lowercase with hyphens.

THE recipe names SHALL be descriptive and action-oriented.

THE recipe names SHALL follow these patterns:

- `<area>-<action>` for specific actions (e.g., `backend-build`, `frontend-test`)
- `<area>-<noun>` for grouped operations (e.g., `backend-lint`, `frontend-check`)

WHERE recipes are related THE developer SHALL use consistent prefixes to group related operations (e.g., `db-*` for database operations, `tools-*` for tooling and version checks).

### Recipe Parameters

WHERE recipes accept parameters THE developer SHALL use meaningful parameter names.

WHERE parameters are optional THE developer SHALL provide sensible defaults.

```just
format *FILES='':
  #!/usr/bin/env nu
  if ("{{FILES}}" == "") {
    ^prettier --write .
  } else {
    ^prettier --write {{FILES}}
  }
```

THE parameter names SHALL use SCREAMING_SNAKE_CASE for constants.

THE parameter names SHALL use kebab-case for regular parameters.

### Environment Variables

WHERE environment variables are required THE recipe SHALL validate their presence.

### File Organization

THE main justfile SHALL be located at the repository root.

THE `scripts/` directory SHALL contain all extracted nushell scripts.

THE `scripts/` directory SHALL be located at the repository root alongside the justfile.

### Comments and Documentation

THE recipes SHOULD have descriptive names that make their purpose clear.

THE recipes SHALL NOT use comments to explain behavior.

THE recipes SHALL NOT have comments above individual recipes.

WHERE recipe purpose is unclear THE developer SHALL rename the recipe to be more descriptive.

### Recipe Groups

THE justfile SHOULD organize recipes into logical groups with section header comments.

THE section headers SHALL use the format `# ---------------- SECTION NAME`.

THE section headers SHALL be the ONLY comments allowed in justfiles.

```just
# ---------------- DATABASE
db-setup:
  #!/usr/bin/env nu
  nu scripts/db-setup.nu

# ---------------- BUILD
build:
  npm run build
```

### Testing and Validation

WHERE recipes are modified THE developer SHALL test them manually before committing.

THE nushell scripts SHALL pass nushell linting via `just nushell-lint`.

### Anti-Patterns

THE recipes SHALL NOT use bash syntax.

THE recipes SHALL NOT use `@echo` (use `print` instead).

THE recipes SHALL NOT use emojis for status indication.

THE recipes SHALL NOT duplicate recipe logic.

THE recipes SHALL NOT hard-code values that should be environment variables.

THE recipes SHALL NOT use `cd` without proper error handling.

## Nushell Specification

### Overview

This specification defines how nushell is used for scripting in the project, particularly in justfile recipes and standalone automation scripts.

### Usage

THE system SHALL use nushell for justfile recipe script bodies.

THE justfile recipes with script bodies SHALL begin with `#!/usr/bin/env nu` shebang.

THE standalone automation scripts SHALL use nushell with `.nu` file extension.

THE nushell scripts SHALL be stored in `scripts/` directory.

### Script Extraction

WHERE a justfile recipe body exceeds 10 lines THE developer SHALL extract it to a dedicated script file.

THE extracted scripts SHALL be placed in `scripts/` directory.

THE extracted scripts SHALL use the same name as the recipe with `.nu` extension.

### Validation

THE system SHALL validate nushell scripts for syntax errors.

THE developer SHALL run `just nushell-lint` to validate all nushell scripts.

THE validation SHALL verify scripts can be sourced without errors.

THE system SHALL integrate nushell validation into the CI pipeline.

THE `just check` command SHALL include nushell validation.

### Syntax Guidelines

THE developer SHALL reference `.claude/skills/nushell` for detailed syntax guidance.

THE nushell scripts SHALL prefer functional patterns (`each`, `where`, `reduce`) over imperative loops.

### Error Handling

WHERE external commands may fail THE developer SHALL handle errors explicitly.

THE nushell scripts SHALL use `error make` to create proper nushell errors.

THE nushell scripts SHALL use `try/catch` blocks to handle errors from external commands.

WHERE validation fails THE script SHALL use `error make` with descriptive messages:

```nushell
if ($env.PORT? | is-empty) {
    error make {msg: "PORT environment variable is not set"}
}
```

WHERE errors should be ignored THE script SHALL use `try` without catch or with empty catch block:

```nushell
try { ^lsof -ti:8080 | lines | each { |pid| ^kill -9 $pid } }
```

THE error messages SHALL be clear and actionable.

THE errors SHALL NOT use `print` followed by `exit 1` (use `error make` instead).

### Output Formatting

THE nushell scripts SHALL use text prefixes for message types:

- `OK: ` for success messages
- `WARN: ` for warnings
- `ERROR: ` for error messages (when using error make)

WHERE colored output is needed THE nushell scripts SHALL use the `ansi` command.

THE nushell scripts SHALL use green for success messages prefixed with `OK: `.

THE nushell scripts SHALL use yellow for warnings prefixed with `WARN: `.

THE nushell scripts SHALL use default color (white) for informational messages.

```nushell
print $"(ansi green)OK: Success message(ansi reset)"
print $"(ansi yellow)WARN: Warning message(ansi reset)"
print "Info message"
error make {msg: "ERROR: Error message"}
```

THE colored output SHALL always include `(ansi reset)` to restore default colors.

THE nushell scripts SHALL NOT use emojis for status indication.
