---
name: github
description: Configure GitHub repositories with the github-settings CLI and Renovate. Use when creating GitHub projects or managing repository settings.
---

# GitHub

For Codeberg-to-GitHub migrations with Woodpecker, follow the [migration guide](migration.md).

Repository settings are declared in `github-settings.json` and applied with the `github-settings` CLI. It requires `GITHUB_TOKEN` with admin permission on the repository. Never change settings with `gh api` or the web UI.

| Project | Public                                                    | Private                                                     |
| ------- | --------------------------------------------------------- | ----------------------------------------------------------- |
| CLI     | [cli.public](files/github-settings.cli.public.json)       | [cli.private](files/github-settings.cli.private.json)       |
| Next.js | [nextjs.public](files/github-settings.nextjs.public.json) | [nextjs.private](files/github-settings.nextjs.private.json) |

1. Confirm visibility, description, and topics with the user.
2. Create the repository from the project root with `gh repo create jruz/REPO --private --source . --remote origin --push`. `gh` uses SSH remotes; never use HTTPS remotes.
3. Copy the template for the project type and visibility to `github-settings.json`. Set only `repository`, `description` and `topics`; keep every other value as in the template.
4. Run `github-settings plan`, review it with the user, then `github-settings push`. Confirm a second `github-settings plan` reports the settings are up to date.
5. Follow the [Renovate skill](../renovate/SKILL.md).
6. Commit `github-settings.json`.

Publish releases only when requested.
