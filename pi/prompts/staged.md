---
description: Check staged changes before committing
---

Check the currently staged changes as a coherent commit.

I intentionally staged some files. Understand what the staged snapshot is trying to accomplish, then check:

- Whether I missed any files required for this change
- Whether I accidentally staged files belonging to another change
- Whether the staged files form a complete, coherent commit

Use `git status --short` and inspect `git diff --cached`. There may be many unrelated changes in the repository; treat them as unrelated unless they are required for the staged change.

This is not a general code review. Do not recommend unrelated improvements or changes.

If the staged snapshot is incomplete or incorrectly scoped, explain exactly what is missing or extra. Do not modify, stage, unstage, reset, or commit anything yet.

If it is correct, use the commit skill to propose an appropriate commit message and wait for my approval. Only create the commit after I explicitly approve it. Then repeat this same process for the next staged snapshot.
