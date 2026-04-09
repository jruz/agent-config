---
name: nushell
description: Write nushell scripts. Use when writing nu scripts or converting bash to nu.
---

# Nushell

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
echo $env.PATH
echo $env.HOME
let oauth = $env.CLAUDE_CODE_OAUTH_TOKEN
```

## Multiline Commands

THE nushell scripts SHALL use parentheses `( )` to group multiline commands.

THE nushell scripts SHALL put each pipe stage on its own line for multi-step pipelines.

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

### Choosing Between `each` and `for`

THE nushell scripts SHALL use `each` when transforming data and returning results.

THE nushell scripts SHALL use `for` when performing side effects with no return value.

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

### Error Handling with log and exit

THE nushell scripts SHALL use `use log.nu` and call `log err` followed by `exit 1` for user-facing errors.

THE project SHALL contain `scripts/log.nu` from the template at `skills/nushell/scripts/log.nu`.

```nushell
use log.nu

if ($env.PORT? | is-empty) {
    log err "PORT environment variable is not set"
    exit 1
}

if not ($path | path exists) {
    log err $"Path does not exist: ($path)"
    exit 1
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

THE nushell scripts SHALL use `each`, `where`, `reduce` when transforming data.

THE nushell scripts SHALL use `for` loops for side effects with no return value.

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

THE nushell scripts SHALL use bracketed prefixes with only the label colored:

- `[INFO]` in blue for informational messages
- `[WARN]` in yellow for warnings
- `[ERROR]` in red for errors
- `[OK]` in green for success messages

THE nushell scripts SHALL use the `ansi` command for colored output.

```nushell
print $"[(ansi blue)INFO(ansi reset)] ($msg)"
print $"[(ansi yellow)WARN(ansi reset)] ($msg)"
print $"[(ansi red)ERROR(ansi reset)] ($msg)"
print $"[(ansi green)OK(ansi reset)] ($msg)"
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

## Forbidden Patterns

THE nushell scripts SHALL NOT use `| default` to silently handle missing data.

THE nushell scripts SHALL NOT use `| ignore` to silence errors.

THE nushell scripts SHALL NOT use `try/catch` to swallow errors.

Errors SHALL propagate and be handled explicitly. When uncertain how to handle an error, ask the user.

## Pitfalls to Avoid

THE nushell scripts SHALL NOT use bash syntax:

- ❌ `$(command)` → use `(command)`
- ❌ `$VAR` → use `$env.VAR` for environment variables
- ❌ Backslash `\` for line continuation → use parentheses `( )`
- ❌ Unquoted external commands → use `^command`

## Logging

THE nushell scripts SHALL use OTEL-aligned structured JSON logging.

THE nushell scripts SHALL log at the beginning of every impure function.

THE `Body` SHALL be the EXACT function name.

THE `Attributes` field names SHALL match parameter names EXACTLY.

Pure functions SHALL NOT log.

THE severity constant SHALL be used as a pseudo-enum to avoid magic strings.

Severity levels (per OTEL spec):

- **TRACE** (1): Fine-grained debugging, typically disabled in default configurations
- **DEBUG** (5): Debugging event
- **INFO** (9): Informational event, indicates that an event happened
- **WARN** (13): Not an error but likely more important than informational
- **ERROR** (17): Something went wrong
- **FATAL** (21): Fatal error such as application or system crash

```nushell
const severity = {
    TRACE: {text: "TRACE", number: 1}
    DEBUG: {text: "DEBUG", number: 5}
    INFO: {text: "INFO", number: 9}
    WARN: {text: "WARN", number: 13}
    ERROR: {text: "ERROR", number: 17}
    FATAL: {text: "FATAL", number: 21}
}

def log [level: record, body: string, attributes?: record] {
    let entry = {
        Timestamp: (date now | format date "%Y-%m-%dT%H:%M:%S%.3fZ")
        SeverityText: $level.text
        SeverityNumber: $level.number
        Body: $body
        Attributes: ($attributes | default {})
    }

    print ($entry | to json --raw)
}

log $severity.INFO "fetch_data" {url: "http://example.com"}
```

Output:

```json
{
  "Timestamp": "2026-01-13T12:33:23.918Z",
  "SeverityText": "INFO",
  "SeverityNumber": 9,
  "Body": "fetch_data",
  "Attributes": { "url": "http://example.com" }
}
```

## Linting

Every repository with nushell scripts SHALL have a `nu-check` recipe in the justfile.

THE `nu-check` recipe SHALL use both `nu-check --debug` (syntax) and `nu-lint` (style/best practices).

THE `nu-check` recipe SHALL be included in the `check` recipe.

### Justfile Recipes

```just
nu-check:
    #!/usr/bin/env nu
    fd --absolute-path --extension nu --exec nu --commands 'nu-check --debug {}'
    nu-lint --config nu-lint.toml

nu-fix:
    nu-lint \
        --config nu-lint.toml \
        --fix
```

The `--absolute-path` flag is required because `nu-check` runs inside a `nu --commands` context and needs the full path to find the file.

### nu-lint

[nu-lint](https://codeberg.org/wvhulle/nu-lint) performs static analysis beyond syntax checking:

- Dead code detection
- Type safety issues
- Performance anti-patterns
- Naming conventions
- Idiomatic nushell patterns

### nu-lint.toml

The `nu-lint.toml` template is in this skill folder.

### Devenv Setup

THE `devenv.nix` SHALL include `nushell` and `nu-lint` in packages.

THE `nu-lint` package SHALL be defined in a separate `nu-lint.nix` file and imported.

nu-lint has no macOS binaries, so:

- Linux: pre-built binary from releases
- macOS: build from source (first build slow, then cached)

#### nu-lint.nix

```nix
{ pkgs }:

let version = "0.0.142";
in if pkgs.stdenv.isLinux then
  let
    arch = if pkgs.stdenv.hostPlatform.isAarch64 then "aarch64" else "x86_64";
    sha256 = if pkgs.stdenv.hostPlatform.isAarch64 then
      "6d6239e28ac67067b15c92ede1a103da20cd7bae9cd4da716c9109a35a8d9ad4"
    else
      "e4ba5bccbfb511494033b2d7dceba09a2ee72807d3426112426521de46a4233b";
  in pkgs.stdenv.mkDerivation {
    pname = "nu-lint";
    inherit version;
    src = pkgs.fetchurl {
      url =
        "https://codeberg.org/wvhulle/nu-lint/releases/download/v${version}/nu-lint-${arch}-unknown-linux-musl.tar.gz";
      inherit sha256;
    };
    nativeBuildInputs = [ pkgs.gnutar ];
    phases = [ "unpackPhase" "installPhase" ];
    unpackPhase = ''
      tar -xzf $src
    '';
    installPhase = ''
      mkdir -p $out/bin
      cp nu-lint $out/bin/
      chmod +x $out/bin/nu-lint
    '';
  }
else
  pkgs.rustPlatform.buildRustPackage {
    pname = "nu-lint";
    inherit version;
    src = pkgs.fetchgit {
      url = "https://codeberg.org/wvhulle/nu-lint.git";
      rev = "v${version}";
      sha256 = "sha256-Hdm1JtChg5dSnPKO8q2EVVGUL4978ZK97trvi9J1rIc=";
    };
    cargoHash = "sha256-yqF+jDaQ7DwLRUZvvwsTRDmeB70Qsw0ywO4RzcGrXRo=";
  }
```

#### devenv.nix usage

```nix
{ pkgs, ... }:

let nu-lint = import ./nu-lint.nix { inherit pkgs; };
in {
  packages = [
    nu-lint
    pkgs.nushell
  ];
}
```

#### devenv.yaml input

```yaml
inputs:
  nixpkgs:
    url: github:nixos/nixpkgs/nixos-25.11
```

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
