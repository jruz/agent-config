---
description: Add git pre-commit hook to the current project
---

Set up a git pre-commit hook that runs `just check` before commits.

## Steps

1. Check if project has Playwright by looking for `playwright.config.ts` or `playwright` in package.json
2. Follow Skill(checks) "Git Hooks" section to create the hook
3. Use the "With Playwright" template if Playwright detected, otherwise use "Without Playwright"

## Report

Confirm setup succeeded and explain:

- Commits now run `just check` automatically
- If Playwright detected: commits also run `just playwright`
- Skip with `SKIP_HOOKS=1 git commit`
