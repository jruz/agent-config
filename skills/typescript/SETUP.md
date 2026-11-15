# TypeScript Setup

For Next.js projects, use the [Next.js skill's setup](../nextjs/SKILL.md) instead.

From the project root, check for uncommitted changes and untracked files:

```sh
git status --porcelain=v1 --untracked-files=all
```

Stop if there is any output. Otherwise, copy every template in [files/](files/), including hidden files, without deleting project-only files:

```sh
cp --recursive --dereference "$HOME/.pi/agent/skills/typescript/files/." .
```

Review `git diff` and merge project-specific configuration.

## Package Manager

- Use `sandbox pnpm` for dependencies, tooling, and running apps
- Use `sandbox bun` only for scripts and script tests
- Add libraries with `sandbox pnpm add --save-exact`
- Declare every imported package explicitly
- Pin versions in `engines`, never `packageManager`
- When pnpm reports ignored builds, add each package to `allowBuilds` in `pnpm-workspace.yaml` as `false`; use `true` only if the package fails without it

## Compare with the Skill

Run `just ts::skill-check` from the project after setup or tooling changes. The checker discovers every template under [files/](files/), including hidden files, and fails if any are missing.

Keep [skill-check/](skill-check/) and [skill-pull/](skill-pull/) in this skill repository; do not copy them into projects.

Report every failure and review item. Do not silently accept drift or modify the baseline to make checks pass.

Version pins in `package.json`, including `engines`, are expected to drift because every repository runs Renovate.
