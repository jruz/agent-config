---
name: template
description: Sync a repository with its template using template-sync. Use when initializing from template-rs or template-ts, checking template drift, pulling synced files, or resolving REVIEW diffs.
---

# Template Sync

## File modes

The template's `template.json` assigns synced paths to these modes:

| Mode      | How it works                                                                    |
| --------- | ------------------------------------------------------------------------------- |
| `replace` | `pull` overwrites the file with the template version.                           |
| `merge`   | `pull` combines template content with project content. See merged files.        |
| `review`  | You apply relevant template changes manually. `pull` leaves the file untouched. |

## Merged files

### package.json

- The template manages `scripts`, `dependencies`, `devDependencies`, `engines`, `private`, and `type`.
- Inside those sections, packages and scripts the template defines get the template's version.
- Packages and scripts you added yourself are kept.
- Packages and scripts the template stops defining are removed.
- Everything else, such as `name` and `version`, is yours.

### Cargo.toml

- The template manages `[build-dependencies]`, `[lints]`, and `[profile]`.
- Inside those sections, entries the template defines get the template's value.
- Entries you added yourself are kept.
- Entries the template stops defining are removed.
- `[package]` and `[dependencies]` are yours.

### justfile

- Template recipes get the template's changes.
- Recipes you added yourself are kept.
- Lines you added inside template recipes are kept.
- When your edit and the template's edit collide, `pull` stops without changing anything.
- Resolve the reported recipe against the template before retrying.

### github-settings.json

- `branch_protection`, `actions`, `security`, and `labels` are replaced by the template.
- `settings` gets the template's values, except `description`, `private`, and `is_template`.

### woodpecker-settings.yaml

- Everything is replaced by the template, except `repo`.

### Other files

- Lines above `# project entries below, everything above is managed by template-sync` come from the template.
- Lines below it are yours.

## Project overrides

To manage a synced file manually, add its path to the project's `review` array in `template-sync.json`:

```json
{
  "review": ["Dockerfile.rust", "renovate.json"]
}
```

- Entries override the template's mode for those paths.
- File paths match exactly.
- A trailing `/` covers synced files beneath that directory.
- Entries must match files already synced by the template.
- Remove a path to restore the template's mode.

## Sync workflow

`template-sync.json` records the template revision used as the project's baseline.

1. Run `template-sync check` to see pending changes.
2. Inspect `REVIEW` diffs and apply relevant changes manually.
3. Run `template-sync pull --dry-run` to preview automatic changes.
4. Run `template-sync pull` to apply automatic changes and advance the recorded revision.
5. Run `template-sync check` and confirm `in sync`.

| Command                        | Review-file comparison                                   |
| ------------------------------ | -------------------------------------------------------- |
| `template-sync check`          | Recorded template revision → current template.           |
| `template-sync check --review` | Local files → current template, including after pulling. |

- Advancing the revision acknowledges review changes, including changes you chose to skip.
- Review differences do not fail `check`.
- Automatic sync drift fails `check`.
- `pull` preserves review files when the template deletes them.

## Apply repository settings

- After pulling changes to `github-settings.json`, run `github-settings plan` and review the changes before running `github-settings push`.
- After pulling changes to `woodpecker-settings.yaml`, run `woodpecker-settings plan` and review the changes before running `woodpecker-settings apply`.
- Run the corresponding plan command again to confirm no drift.

## Missing GitHub settings

- Run `github-settings pull` to create a missing `github-settings.json` from the repository's live settings.
- Commit `github-settings.json` before running `template-sync pull`.
- Run `template-sync pull` to merge the template's shared policy while preserving repository identity.

## New projects

| Language   | TEMPLATE      | Repository                                              |
| ---------- | ------------- | ------------------------------------------------------- |
| Rust       | `template-rs` | [jruz/template-rs](https://github.com/jruz/template-rs) |
| TypeScript | `template-ts` | [jruz/template-ts](https://github.com/jruz/template-ts) |

### Inputs

Confirm these with the user before creating anything:

- `PROJECT`: the repository name
- Description
- Topics
- Visibility: public or private

When the project rewrites an existing one, propose the description, README tagline, and topics from that project's README and manifest.

### Steps

1. Create the repository with `gh repo create jruz/PROJECT --template jruz/TEMPLATE --public`. Use `--private` for private projects.
2. Clone it with `git clone git@github.com:jruz/PROJECT.git`. Clone into `.` when the current directory is the empty project directory.
3. Run `template-sync init` in the project directory.
4. Run `direnv allow`.
5. Run `just setup` to install the git hooks.
6. Find template names with `rg --hidden --glob '!.git' --glob '!*.lock' --glob '!template-sync.json' TEMPLATE`.
7. Replace every match with `PROJECT`.
8. Replace the template description in `github-settings.json`.
9. Replace the template description in the CLI `about` text in `src/main.rs` or the `description` in `package.json`.
10. Replace the README title and tagline.
11. Replace the project summary on the first line of `AGENTS.md`.
12. Set `is_template` to `false` in `github-settings.json`.
13. Replace the `template` topic in `github-settings.json` with the project topics.
14. Set `private` in `github-settings.json` to match the visibility.
15. For private projects, set `branch_protection` to `null` and add `github-settings.json` to the `review` array in `template-sync.json`. GitHub returns 403 for branch protection on private repositories.
16. Delete `release.json`. The first release generates it, and `release.nu publish` skips a version that `release.json` already records.
17. Run `just fix`.
18. Run `just check`, `just test`, and `slop-detector all`.
19. Run `github-settings plan`, review it, then `github-settings push`.
20. Confirm a second `github-settings plan` reports no drift.
21. Run `woodpecker-cli repo sync` and note the `forgeRemoteID` of `jruz/PROJECT`.
22. Run `woodpecker-cli repo add <forgeRemoteID>`.
23. Run `woodpecker-settings plan`, then `woodpecker-settings apply`. The template's encrypted secrets work unchanged.
24. Confirm a second `woodpecker-settings plan` reports no changes.
25. Stage all changes and run `git reset --soft` to the template's initial commit.
26. Run `git commit --amend --reset-author` with the title `[tool] Project: Initialize from TEMPLATE`.
27. Force-push to `main`. CI publishes the template's starting version `0.0.1`.
28. Confirm the pipeline in `woodpecker-cli pipeline ls jruz/PROJECT --limit 1` succeeds.
