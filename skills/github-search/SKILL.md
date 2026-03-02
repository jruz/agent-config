---
name: github-search
description: Search GitHub code with gh CLI. Use when finding code examples or implementations.
---

# GitHub Code Search with gh CLI

Search code across GitHub repositories using `gh search code`.

## Basic Usage

```bash
gh search code "pattern"
gh search code "pattern" --repo owner/repo
gh search code "pattern" --language rust
```

## Flags

| Flag          | Purpose                             |
| ------------- | ----------------------------------- |
| `--repo`      | Limit to specific repo (owner/repo) |
| `--owner`     | Limit to repos owned by user/org    |
| `--language`  | Filter by programming language      |
| `--filename`  | Match specific filename             |
| `--extension` | Filter by file extension            |
| `--path`      | Search within specific path         |
| `--limit`     | Max results (default 30, max 1000)  |

## Search Patterns

Find function definitions:

```bash
gh search code "fn function_name" --language rust
gh search code "def function_name" --language python
gh search code "function functionName" --language javascript
gh search code "func functionName" --language go
```

Find struct/class definitions:

```bash
gh search code "struct MyStruct" --language rust
gh search code "class MyClass" --language python
```

Search specific files:

```bash
gh search code "keyword" --filename Cargo.toml
gh search code "keyword" --filename package.json
gh search code "keyword" --extension toml
```

Search within paths:

```bash
gh search code "pattern" --path src/
gh search code "pattern" --path .github/workflows
```

Search within organization:

```bash
gh search code "pattern" --owner anthropics
gh search code "pattern" --owner rust-lang --language rust
```

## Output Formats

| Flag      | Output                     |
| --------- | -------------------------- |
| (default) | Human-readable table       |
| `--json`  | JSON with specified fields |
| `--jq`    | Apply jq filter to JSON    |

```bash
gh search code "fn main" --json repository,path,textMatches
gh search code "pattern" --json path --jq '.[].path'
```

Available JSON fields: `path`, `repository`, `sha`, `textMatches`, `url`

## Key Rules

- Requires authentication via `gh auth login`
- Quote queries containing spaces or special characters
- Combine flags for precise filtering
- Use `--limit` to get more results
- Use JSON output with `--jq` for scripting
