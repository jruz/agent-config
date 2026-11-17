# Woodpecker Setup

Copy [files/.woodpecker/](files/.woodpecker/) into the repository root.

For deployment or release pipelines, use the [nomad](../nomad/SETUP.md) or [release](../release/SKILL.md) skill instead.

## Repo Settings

| Project type | Settings file                                                                  | Secret         |
| ------------ | ------------------------------------------------------------------------------ | -------------- |
| JavaScript   | [files/woodpecker-settings.js.yaml](files/woodpecker-settings.js.yaml)         | None           |
| Rust CLI     | [files/woodpecker-settings.rust.yaml](files/woodpecker-settings.rust.yaml)     | `GITHUB_TOKEN` |
| Next.js      | [files/woodpecker-settings.nextjs.yaml](files/woodpecker-settings.nextjs.yaml) | `SOPS_AGE_KEY` |

1. Copy the settings file for the project type to `woodpecker-settings.yaml` and replace `REPO_NAME`.
2. `woodpecker-settings plan`
3. `woodpecker-settings apply`

## Required Checks

Require the relevant `ci/woodpecker/pr/*` checks through the [github skill](../github/SKILL.md).

## Linting

THE project SHALL add `unstable.woodpecker-cli` to the flake devshell packages, with `unstable = import nixpkgs-unstable { inherit system; };`.

THE project SHALL lint woodpecker config using `woodpecker-cli lint`.

THE linter recipe SHALL be set up according to the checks skill.
