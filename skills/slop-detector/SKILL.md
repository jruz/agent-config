---
name: slop-detector
description: Run slop-detector to find anti-patterns. Use when linting code.
---

# slop-detector

Linter for detecting anti-patterns.

## Usage

| Command                                        | Purpose                                                        |
| ---------------------------------------------- | -------------------------------------------------------------- |
| `slop-detector`                                | Run all checks                                                 |
| `slop-detector <lang>`                         | Run checks for one language                                    |
| `slop-detector --create-config-for-violations` | Generate `slop-detector.toml` with current violations excluded |

## Config (`slop-detector.toml`)

```toml
[ignore]
rules = [] # globally ignore rules by name
files = [] # globally ignore files by path

[ignore.by-rule]
rule-name = ["file1.rs", "file2.rs"] # ignore rule for specific files
```

## Rules

WHEN slop-detector reports violations THE agent SHALL fix the code, not suppress the rule.

WHEN a violation cannot be fixed THE agent SHALL ask the user before adding it to `slop-detector.toml`.
