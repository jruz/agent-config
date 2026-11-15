---
name: worktrees
description: Clone remote Git repositories as bare repos with nested worktrees. Use when setting up repo/.git and repo/main, cloning a bare repository from a URL, or creating Git worktrees.
---

# Worktrees

## Clone from a URL

- Resolve the remote URL and destination before cloning.
- If an existing checkout is available, read its origin URL with `git remote get-url origin`.
- Clone from the remote URL rather than the local checkout so origin points directly to the remote.
- Keep existing checkouts untouched unless deletion is explicitly requested.
- Confirm before replacing an existing destination.
- Local-only branches and commits are not included in a remote clone.
- Run each command separately and stop on errors.

Replace `<repo-url>` and `<repo-dir>` with the resolved values. These commands use the requested `main` branch; use the requested branch name throughout if different. If that branch is missing, stop rather than choosing another.

```bash
git clone --bare <repo-url> <repo-dir>/.git
git -C <repo-dir> config remote.origin.fetch '+refs/heads/*:refs/remotes/origin/*'
git -C <repo-dir> fetch origin
git -C <repo-dir> worktree add main main
git -C <repo-dir>/main branch --set-upstream-to=origin/main main
```

The fetch refspec creates remote-tracking branches, which bare clones do not configure automatically.

## Verify

```bash
git -C <repo-dir> rev-parse --is-bare-repository
git -C <repo-dir> remote get-url origin
git -C <repo-dir> worktree list
git -C <repo-dir>/main status --short --branch
```

- Confirm the repository is bare.
- Confirm origin matches the remote URL.
- Confirm the worktree is at `<repo-dir>/main`.
- Confirm `main` tracks `origin/main` with a clean working tree.

## Add a feature worktree

Replace `<branch>` with the requested new branch name.

```bash
git -C <repo-dir> worktree add -b <branch> <branch> main
```

Keep dependency installation and secrets setup separate from Git setup. Follow the target project's instructions for those actions.
