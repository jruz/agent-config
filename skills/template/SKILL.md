---
name: template
description: Sync a repository with its template using template-sync. Use when initializing from template-rs or template-ts, checking template drift, updating synced files, or resolving REVIEW diffs.
---

# Template Sync

## Sync usage

| Command                                            | Purpose                                           |
| -------------------------------------------------- | ------------------------------------------------- |
| `template-sync init`                               | Initialize a project without `template-sync.json` |
| `template-sync check`                              | Report drift                                      |
| `template-sync update --dry-run`                   | Preview changes                                   |
| `template-sync update`                             | Apply changes                                     |
| `template-sync update-repositories --account jruz` | Open sync PRs across an account                   |

- Review reported diffs before updating.
- Apply relevant `REVIEW` changes manually.
- Run `template-sync check` again and confirm `in sync`.

## New projects

| Language   | Repository                                              |
| ---------- | ------------------------------------------------------- |
| Rust       | [jruz/template-rs](https://github.com/jruz/template-rs) |
| TypeScript | [jruz/template-ts](https://github.com/jruz/template-ts) |

Rust:

```sh
gh repo create jruz/PROJECT --template jruz/template-rs --private --clone
```

TypeScript:

```sh
gh repo create jruz/PROJECT --template jruz/template-ts --private --clone
```

`--template` creates the new repository from the template on GitHub.
`--clone` clones the new project into the current directory.
Enter the new project directory and run `template-sync init`.
