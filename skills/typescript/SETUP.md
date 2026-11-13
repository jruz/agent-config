# TypeScript Setup

For Next.js projects, use the [Next.js skill's setup](../nextjs/SKILL.md) instead. The coding guidance in [SKILL.md](SKILL.md) still applies.

From the project root, check for uncommitted changes and untracked files:

```sh
git status --porcelain=v1 --untracked-files=all
```

Stop if there is any output. Otherwise, copy every template in [files/](files/), including hidden files, without deleting project-only files:

```sh
cp --recursive --dereference "$HOME/.pi/agent/skills/typescript/files/." .
```

Review `git diff` after copying and merge project-specific configuration before running commands that depend on it. Then run `just ts::skill-check`; do not copy a selected subset of templates.

Keep project-wide orchestration in the root justfile.
