---
name: nushell
description: Write nushell scripts and commands. Use when writing nu scripts, converting bash to nushell, or working with justfile recipes that use nushell.
---

# Nushell

## Key Syntax Differences from Bash

| Bash | Nushell | Purpose |
|------|---------|---------|
| `command` | `^command` | Run external command explicitly |
| `$(command)` | `(command)` | Command substitution |
| `$VAR` | `$env.VAR` | Environment variables |
| `"${VAR}"` | `$"($env.VAR)"` | String interpolation |
| `$(pwd)` | `(pwd)` | Get current directory |
| `\` line continuation | `( )` grouping | Multiline commands |

## External Commands

THE nushell scripts SHALL prefix external commands with `^` to distinguish from nushell built-ins.

```nushell
^git worktree list
^just frontend-install
^cargo build
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
echo $env.PATH
echo $env.HOME
let oauth = $env.CLAUDE_CODE_OAUTH_TOKEN
```

## Multiline Commands

THE nushell scripts SHALL use parentheses `( )` to group multiline commands.

```nushell
(^git worktree list --porcelain
    | lines
    | where $it starts-with "worktree "
    | each { |line| $line | split row ' ' | get 1 })
```

WITHOUT parentheses, each line is treated as a separate statement.

## Common Patterns

### Working with Git Commands

```nushell
^git worktree list --porcelain
    | lines
    | where $it starts-with "worktree "
    | each { |line| $line | split row ' ' | get 1 }
```

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

### Using `each` Instead of For Loops

THE nushell scripts SHALL prefer `each` over `for` loops for functional style.

```nushell
let items = ["item1", "item2", "item3"]
$items | each { |item| process_item $item }
```

### Function Definitions

THE nushell scripts SHALL define functions with typed parameters.

```nushell
def process_item [name: string] {
    echo $"Processing ($name)"
}
```

#### Optional Parameters

THE functions MAY use optional parameters with `?` suffix.

```nushell
def greet [name?: string] {
    if ($name == null) {
        "Hello!"
    } else {
        $"Hello, ($name)!"
    }
}
```

#### Default Values

THE functions MAY provide default values for parameters.

```nushell
def greet [name = "World"] {
    $"Hello, ($name)!"
}
```

#### Flags

THE functions MAY accept named flags with `--` prefix.

```nushell
def process [path: string, --verbose] {
    if $verbose {
        print $"Processing ($path)..."
    }
}

def convert [input: string, --format (-f): string] {
    $"Converting ($input) to ($format)"
}
```

#### Rest Parameters

THE functions MAY collect variable arguments with `...` prefix.

```nushell
def greet_all [...names: string] {
    $names | each { |name| $"Hello, ($name)!" }
}
```

### Error Handling with error make

THE nushell scripts SHALL use `error make` to create proper nushell errors.

```nushell
if ($env.PORT? | is-empty) {
    error make {msg: "PORT environment variable is not set"}
}

if not ($path | path exists) {
    error make {msg: $"Path does not exist: ($path)"}
}
```

### Error Handling with Try/Catch

THE nushell scripts SHALL use `try/catch` blocks for error handling.

```nushell
try {
    ^git worktree remove $worktree_path
    ^git branch -D $branch_name
} catch {
    print $"Could not remove worktree: ($branch_name)"
}

# Ignore errors silently
try { ^lsof -ti:8080 | lines | each { |pid| ^kill -9 $pid } }
```

### Combining Functions and Each

THE nushell scripts SHALL combine function definitions with `each` for clean, reusable code.

```nushell
let worktrees = (^git worktree list --porcelain | lines | where $it starts-with "worktree ")

def process_worktree [line: string] {
    let path = ($line | split row ' ' | get 1)
    print $"Processing worktree at: ($path)"
}

$worktrees | each { |wt| process_worktree $wt }
```

## List Operations

### Filtering with `where`

THE nushell scripts SHALL use `where` to filter lists by condition.

```nushell
let numbers = [1, 2, 3, 4, 5]
$numbers | where $it > 2  # [3, 4, 5]

let files = ls
$files | where type == "file"
```

### Accumulation with `reduce`

THE nushell scripts SHALL use `reduce` to compute a single value from a list.

```nushell
let numbers = [1, 2, 3, 4, 5]
$numbers | reduce { |item, acc| $acc + $item }  # 15

let numbers = [1, 2, 3, 4, 5]
$numbers | reduce --fold 0 { |item, acc| $acc + $item }
```

### Indexing with `enumerate`

THE nushell scripts SHALL use `enumerate` to get both index and item.

```nushell
let names = ["Alice", "Bob", "Carol"]
$names | enumerate | each { |item|
    $"($item.index + 1). ($item.item)"
}
```

### Testing with `any` and `all`

THE nushell scripts SHALL use `any` to check if at least one item matches.

THE nushell scripts SHALL use `all` to check if every item matches.

```nushell
let numbers = [1, 2, 3, 4, 5]
$numbers | any { |n| $n > 3 }  # true
$numbers | all { |n| $n > 0 }  # true
```

## Pattern Matching

THE nushell scripts SHALL use `match` for value-based branching.

```nushell
def status_message [code: int] {
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

THE nushell scripts SHALL prefer `each`, `where`, `reduce` over loops when working with collections.

THE nushell scripts MAY use `for` loops when imperative control flow is needed.

```nushell
for item in [1, 2, 3] {
    print $item
}

for i in 0..10 {
    print $i
}
```

### While Loops

THE nushell scripts SHALL use `while` for condition-based iteration.

```nushell
mut count = 0
while $count < 5 {
    print $count
    $count = $count + 1
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

THE `^` prefix SHALL be used to invoke external commands directly without `extern` signatures.

```nushell
^git worktree list
^just frontend-install
```

## Colored Output

THE nushell scripts SHALL use text prefixes for all message types:
- `OK: ` for success messages (green)
- `WARN: ` for warnings (yellow)
- `ERROR: ` for errors (red, via error make)
- No prefix for informational messages (white)

THE nushell scripts SHALL use the `ansi` command for colored output.

```nushell
print $"(ansi green)OK: Success message(ansi reset)"
print $"(ansi yellow)WARN: Warning message(ansi reset)"
print "Info message"
error make {msg: "ERROR: Error message"}
```

THE colored output SHALL always end with `(ansi reset)` to restore default colors.

THE nushell scripts SHALL NOT use emojis for status indication.

## JSON Output

THE nushell scripts SHALL use records and `to json` instead of JSON strings.

```nushell
# ❌ Don't do this
print '{"decision": "allow"}'

# ✅ Do this instead
{decision: "allow"} | to json
```

## Pitfalls to Avoid

THE nushell scripts SHALL NOT use bash syntax:
- ❌ `$(command)` → use `(command)`
- ❌ `$VAR` → use `$env.VAR` for environment variables
- ❌ Backslash `\` for line continuation → use parentheses `( )`
- ❌ Unquoted external commands → use `^command`

## What We Learned

### External Command Execution
Nushell treats bare words as nushell commands/variables by default. To run external commands explicitly, prefix with `^`. This prevents confusion between nushell built-ins and system commands. The `extern` keyword can define signatures for external commands to enable type checking and completions.

### String Interpolation is Different
Bash uses `$()` for command substitution and `${}` for variable expansion within strings. Nushell unifies this with `$"(...)"` syntax where anything in parentheses is evaluated.

### Multiline Commands Need Grouping
Unlike bash where backslash continues lines, nushell treats each line as a complete statement unless grouped with parentheses. This is especially important in justfile recipes where the text is passed to the shell.

### Environment Variables are Explicit
Nushell separates environment variables (`$env.VAR`) from regular variables (`$var`). This makes it clearer what scope you're working with and prevents accidental shadowing.

### Functional Style is Preferred
Nushell encourages using `each`, `where`, `reduce`, `any`, and `all` over imperative loops when working with collections. This leads to more declarative, composable code. Use `for`, `while`, and `loop` only when imperative control flow is truly needed.

### Pattern Matching Simplifies Branching
The `match` expression provides a cleaner alternative to nested if/else chains when branching on values. Guard conditions enable sophisticated pattern matching logic.

### Advanced Function Features
Functions support optional parameters (`?`), default values, named flags (`--flag`), shorthand flags (`-f`), and rest parameters (`...`). These enable building sophisticated command-line interfaces within nushell scripts.

### Module Naming Matters
When using `use module.nu *`, the filename becomes the module name. If a module exports an external with the same name as the module, nushell will reject it. Use different names like `just-completions.nu` instead of `just.nu`.
