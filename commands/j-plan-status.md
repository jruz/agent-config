---
description: Report progress on PLAN.md vs actual branch changes
---

Analyze the current state of work against the plan.

## Process

THE command SHALL read `PLAN.md` from the workspace root.

WHERE specs are referenced in the plan THE command SHALL read those spec files.

THE command SHALL review files listed in the plan's "Files" section.

THE command SHALL run `git diff origin/main...HEAD` to see branch changes.

THE command SHALL compare completed steps against actual code changes.

THE command SHALL identify gaps or discrepancies.

## Report Format

THE report SHALL include:

### Progress Summary
- Steps completed: X/Y
- Key changes made (from git diff)
- Alignment between plan and actual work

### Gaps or Issues
- Steps marked done but not reflected in code
- Code changes not captured in plan
- Blockers or concerns

### Recommended Next Steps
- What to do next based on current state
- Any plan updates needed
