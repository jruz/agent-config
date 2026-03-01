---
description: Stash changes, rebase on main, and pop stash
allowed-tools: Bash
---

Run the following git commands in sequence, stopping on any error:

1. `git stash --include-untracked`
2. `git fetch origin main`
3. `git rebase origin/main`
4. `git stash pop`

WHEN a rebase conflict occurs THE agent SHALL stop and report the conflicting files.
