---
description: Add git pre-commit hook to the current project
---

Set up a git pre-commit hook that runs `just check` before commits.

## Steps

1. Create `.githooks/` directory
2. Create `.githooks/pre-commit` with:
   ```nu
   #!/usr/bin/env nu

   if "SKIP_HOOKS" not-in $env {
       just check
   }
   ```
3. Make it executable: `chmod +x .githooks/pre-commit`
4. Configure git: `git config core.hooksPath .githooks`

## Report

Confirm setup succeeded and explain:
- Commits now run `just check` automatically
- Skip with `SKIP_HOOKS=1 git commit`
