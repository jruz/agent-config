---
description: Create atomic commits following the commit skill, ensuring each commit passes just check
---

Create commits for the current changes following `Skill(commit)` conventions.

## Critical Rule

**Each commit MUST pass `just check` before creating the next commit.**

## Workflow

1. Analyze changes and plan commit strategy per `Skill(commit)`
2. Present the commits for confirmation

## Notes

- Follow all commit structure, message format, and atomic commit principles from `Skill(commit)`
- Never leave a commit that breaks checks or wont build
- If a logical change can't be split without breaking checks, keep it as one commit
- Report final commit history and check status when complete
