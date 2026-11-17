# Codeberg to GitHub migration

A migration request is the approval. Do not ask questions, including confirmations required by the referenced skills, except before overwriting an existing destination, rewriting history, or when a missing value cannot be read from the repository.

Preserve application data and never print credentials, raw webhook responses, or webhook URLs: Woodpecker hook URLs can contain tokens.

## Prepare

1. Inspect `git status --short --branch`, `git remote -v`, local branches, tags, CI configuration, deployment settings, and forge-specific references.
2. Read the repository name, visibility, description, and topics from `codeberg-settings.toml`. Ask only when it is missing.
3. Fetch the source remote. The destination default branch is the source default branch, not the local one: local commits missing from `codeberg/main`, such as work from open pull requests, stay off it.
4. Preserve uncommitted work. Migrate the default branch, all tags, and the branches of open pull requests.
5. For private repositories, check whether the GitHub plan supports branch protection. Report any limitation before cutover.

## Migrate

1. Rename the old remote with `git remote rename origin codeberg`, then create the destination with `gh repo create jruz/REPO --private --source . --remote origin`. `github-settings.json` sets the real visibility.
2. Activate the repository in Woodpecker and apply the settings file for the project type following the [Woodpecker skill](../woodpecker/SKILL.md).
3. Port release scripts through the [release skill](../release/SKILL.md); its templates win over existing configuration. Bump the version unless the current version may be published from the new forge; a push to the release branch runs the tag pipeline.
4. Verify the commit list and diff, then push the default branch, tags, and open pull request branches. A push may deploy to production.
5. Apply `github-settings.json` and Renovate following the [GitHub skill](SKILL.md), using the values from `codeberg-settings.toml`.

## Verify

1. Verify the pipeline for the pushed commit succeeds. The first push webhook to an empty repository can arrive minutes late; check `gh api repos/jruz/REPO/hooks/HOOK_ID/deliveries` before assuming CI is broken.
2. Verify production deployment and its revision match the pushed commit where applicable.
3. Open GitHub pull requests for the migrated open pull request branches. Verify PR checks, preview revisions, and cleanup where applicable.
4. Confirm `github-settings plan` reports the settings are up to date and Renovate PR pipelines pass.

## Clean Up

1. Set `private = true` and `archived = true` for the Codeberg repository with `codeberg-settings` following the [Codeberg skill](../codeberg/SKILL.md). Make it private before archiving; archiving alone does not change visibility.
2. Remove the `codeberg` remote after both settings are verified.
3. Report anything not migrated or verified, including issues, releases, and other forge-only data.
