---
name: nushell
description: Write nushell scripts. Use when writing nu scripts or converting bash to nu.
---

# Nushell

For project setup, follow [SETUP.md](SETUP.md).

## Key Syntax Differences from Bash

| Bash                  | Nushell         | Purpose                         |
| --------------------- | --------------- | ------------------------------- |
| `command`             | `^command`      | Run external command explicitly |
| `$(command)`          | `(command)`     | Command substitution            |
| `$VAR`                | `$env.VAR`      | Environment variables           |
| `"${VAR}"`            | `$"($env.VAR)"` | String interpolation            |
| `$(pwd)`              | `(pwd)`         | Get current directory           |
| `\` line continuation | `( )` grouping  | Multiline commands              |

## External Commands

THE nushell scripts SHALL prefix external commands with `^` to distinguish from nushell built-ins.

THE nushell scripts SHALL use long flags (`--flag`) instead of short flags (`-f`) for readability.

```nushell
^git worktree list
^just frontend-install
^cargo build

^fd --absolute-path --extension nu
^podman ps --all --filter "label=foo"
```

## String Interpolation

THE nushell scripts SHALL use `$"(...)"` syntax for string interpolation.

```nushell
$"Current dir: (pwd)"
$"Home: ($env.HOME)"
$"Path: ($some_variable)"
```

## Environment Variables

THE nushell scripts SHALL access environment variables with `$env.VARNAME`.

```nushell
print $env.HOME
$"($env.HOME)/.config"
```

## Script Startup

- Do not pass `--no-config-file` to `nu script.nu`, `nu --commands`, or script shebangs; they skip startup configuration by default.
- Child processes inherit environment variables, not aliases or custom commands.
- `--no-config-file` does not clear inherited environment variables.

## Multiline Commands

THE nushell scripts SHALL use parentheses `( )` to group multiline commands.

THE nushell scripts SHALL put each pipe stage on its own line for multi-step pipelines.

```nushell
(ls
    | where type == "file"
    | sort-by size
    | get name)
```

WITHOUT parentheses, each line is treated as a separate statement.

## Common Patterns

### External Command Output

- Stream command output to the terminal by default.
- When an operation may take time without visible progress output, tell the user what is happening before it starts.
- Capture machine-readable output when needed.
- Stream progress and diagnostics.
- Ask before suppressing either.
- Do not discard stderr merely because a command succeeded.
- Let external-command failures propagate. Do not add exit-status checks that only rethrow the failure.
- Review output handling and failure handling together, one case at a time.

### Justfile Recipes with Nushell

```just
recipe:
  #!/usr/bin/env nu
  (^external-command arg1
    arg2
    arg3)
```

THE justfile recipes with nushell shebang SHALL wrap multiline external commands in parentheses.

## Functional Programming Patterns

### Choosing Between `each` and `for`

Use `each` for data transformations. Use `for` for external commands and other side effects.

### Function Definitions

THE nushell scripts SHALL define functions with typed parameters.

THE functions SHALL declare input and output types.

THE function names SHALL use kebab-case.

```nushell
def process-item [name: string]: nothing -> string {
    $"Processing ($name)"
}
```

#### CLI Help Comments

- Document `main` and `main` subcommands with help comments.
- Document their parameters and flags so `--help` explains their purpose.
- Do not add documentation comments to regular functions.

#### Optional Parameters

THE functions MAY use optional parameters with `?` suffix.

```nushell
def greet [name?: string]: nothing -> string {
    if ($name == null) {
        "Hello!"
    } else {
        $"Hello, ($name)!"
    }
}
```

#### Default Values

Only `main` and `main` subcommands may provide parameter defaults. Regular functions must require explicit values.

```nushell
def greet [name: string]: nothing -> string {
    $"Hello, ($name)!"
}

def main [name = "World"]: nothing -> string {
    greet $name
}
```

#### Flags

THE functions MAY accept named flags with `--` prefix.

```nushell
def process [path: string, --verbose]: nothing -> nothing {
    if $verbose {
        print $"Processing ($path)..."
    }
}

def convert [input: string, --format (-f): string]: nothing -> string {
    if $format != null {
        $"Converting ($input) to ($format)"
    } else {
        $input
    }
}
```

#### Rest Parameters

THE functions MAY collect variable arguments with `...` prefix.

```nushell
def greet-all [...names: string]: nothing -> list<string> {
    $names | each {|name| $"Hello, ($name)!" }
}
```

#### Subcommands

WHEN a script exposes several actions, THE script SHALL define each action as a `main` subcommand instead of matching on a positional argument.

THE subcommand names SHALL use double quotes.

```nushell
def "main open" [target: string]: nothing -> nothing {
    ^tmux select-window -t $target
}

def main []: nothing -> string {
    ^tmux list-windows
}
```

`script open @1` runs `main open`, and `script` alone runs `main`.

### Error Handling

- Before adding or changing error handling, report the failure cases and proposed behavior for user review.
- Discuss one case at a time and wait for approval before applying its handling.
- Agree whether each failure should recover, display its original diagnostic, or display a concise, actionable message.
- For agreed failure handling, include a friendly message explaining which operation failed and what the user can do next when known.
- Use concise messages for expected validation failures. Preserve original diagnostics for unexpected failures.
- Until a handling policy is agreed, let errors propagate unchanged.
- Do not use `error make`. Use `log error` or `log warning` with an actionable message.

```nushell
def "main build" [target: string]: nothing -> nothing {
    let targets = (select-targets $target)
    if ($targets | is-empty) {
        log error $"Unknown target: ($target). Choose a supported target."
        exit 1
    }
    run-build $targets
}
```

### Error Handling with Try/Catch

- Use `try/catch` only for agreed recovery, cleanup, or error translation.
- Preserve the original diagnostic when catching for cleanup.
- Never reduce arbitrary structured errors to `$err.msg` alone.
- When displaying a simplified error, preserve the full diagnostic in the agreed destination.
- When writing diagnostics to a file, tell the user where to inspect it.
- Never log secrets.
- Do not introduce diagnostic logging without agreement.
- Use `try/catch` for agreed handling of streaming command failures instead of reading `$env.LAST_EXIT_CODE`.
- Separate file reads from external build execution.

### Combining Functions and Each

THE nushell scripts SHALL combine function definitions with `each` for clean, reusable code.

```nushell
let lines = ["worktree /repo/main" "worktree /repo/feature"]

def worktree-path []: string -> string {
    parse "worktree {path}" | first | get path
}

$lines | each {|line| $line | worktree-path }
```

## List Operations

### Filtering with `where`

THE nushell scripts SHALL use `where` to filter lists by condition.

```nushell
let numbers = [1 2 3 4 5]
$numbers | where $it > 2  # [3 4 5]

let files = ls
$files | where type == "file"
```

### Accumulation

Do not use `reduce`. Use a dedicated aggregation command or a `for` loop.

### Indexing with `enumerate`

THE nushell scripts SHALL use `enumerate` to get both index and item.

```nushell
let names = ["Alice" "Bob" "Carol"]
$names | enumerate | each {|item|
    $"($item.index + 1). ($item.item)"
}
```

### Testing with `any` and `all`

THE nushell scripts SHALL use `any` to check if at least one item matches.

THE nushell scripts SHALL use `all` to check if every item matches.

```nushell
let numbers = [1 2 3 4 5]
$numbers | any {|n| $n > 3 }  # true
$numbers | all {|n| $n > 0 }  # true
```

## Pattern Matching

THE nushell scripts SHALL use `match` for value-based branching.

```nushell
def status-message [code: int]: nothing -> string {
    match $code {
        200 => "Success"
        404 => "Not Found"
        500 => "Server Error"
        _ => "Unknown"
    }
}
```

THE `match` expression MAY use guard conditions.

```nushell
match $value {
    $x if $x > 100 => "Large"
    $x if $x > 10 => "Medium"
    _ => "Small"
}
```

## Control Flow

### When to Use Loops vs Iteration

Use `each` and `where` for data transformations. Use `for` for external commands and other side effects.

### While Loops

THE nushell scripts SHALL use `while` for condition-based iteration.

```nushell
while not ("/tmp/ready" | path exists) {
    sleep 1sec
}
```

### Infinite Loops with `loop`

THE nushell scripts SHALL use `loop` with `break` for infinite loops.

```nushell
loop {
    let input = input "Enter command: "
    if $input == "quit" {
        break
    }
    print $"You entered: ($input)"
}
```

### Early Exit with `continue` and `break`

THE loops MAY use `continue` to skip to next iteration.

THE loops MAY use `break` to exit early.

```nushell
for item in $items {
    if $item == "" {
        continue
    }
    if $item == "STOP" {
        break
    }
    print $item
}
```

## External Command Signatures

THE nushell scripts MAY define external command signatures with `extern`.

THE `extern` definitions enable type checking and completions for external commands.

```nushell
extern ssh [
    destination?: string
    -p: int
    -i: string
]
```

THE `^` prefix SHALL be used to invoke external commands.

```nushell
^git worktree list
^just frontend-install
```

## Colored Output

THE nushell scripts SHALL use bracketed prefixes with only the label colored:

- `[INFO]` in blue for informational messages
- `[WARN]` in yellow for warnings
- `[ERROR]` in red for errors
- `[OK]` in green for success messages

Use [files/scripts/lib/log.nu](files/scripts/lib/log.nu), copied from this skill folder, for `log info`, `log warning`, `log error`, and `log ok`.

```nushell
use lib/log.nu

def kill-port [port: int]: nothing -> nothing {
    log ok $"Killed processes on port ($port)"
}
```

For self-contained scripts, use `std/log`.

THE nushell scripts SHALL NOT use emojis for status indication.

## JSON Output

THE nushell scripts SHALL use records and `to json` instead of JSON strings.

```nushell
# Don't do this
print '{"decision": "allow"}'

# Do this instead
{decision: "allow"} | to json
```

## Forbidden Patterns

THE nushell scripts SHALL NOT use `| default` to silently handle missing data.

THE nushell scripts SHALL NOT use `| ignore` to silence errors.

THE nushell scripts SHALL NOT use `try/catch` to swallow errors.

Errors SHALL propagate unchanged unless the user has agreed to a handling policy.

## Testing

- Run `just nushell::test`.
- Use `std/assert`.
- Co-locate tests as `<module>.test.nu`.
- Co-locate executable mocks as `<module>.mock.nu`.
- Test meaningful behavior and regressions, not implementation details.
- Test important failure paths alongside the happy path.
- Mock external executables through an isolated PATH.
- Use synthetic data and temporary directories; never real secrets.
- Distinguish mocked command-contract tests from real integration tests.

## Linting

- Run `just nushell::check`.

THE project-specific rule overrides SHALL go under `# this project` on `nu-lint.toml`
