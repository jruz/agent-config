---
name: plan-md
description: Work with PLAN.md to track progress through atomic, committable steps.
---

# Plan

How to work with PLAN.md for planning and tracking implementation work. PLAN.md provides resumable context for complex tasks across sessions.

## File Location

THE `PLAN.md` file SHALL be created at the workspace root.

THE `PLAN.md` file SHALL be added to `.gitignore` as a local planning artifact.

THE `PLAN.md` file SHALL NOT be committed to version control.

## Format

```markdown
# Plan: [Brief title]

- What we're doing
- Why or approach details

## Specs

- [Spec name](path/to/spec.md)

## Files

- `path/to/file.rs`
- `path/to/other.rs`

## Steps

- [ ] Step 1
- [ ] Step 2
- [ ] Step 3

## Acceptance Criteria

- [ ] `just check` passes
- [ ] [Other specific criteria for this task]
```

## Core Principle

**Each checkmark = One atomic commit with `just check` passing**

## File Structure

THE `PLAN.md` file SHALL contain a level-1 heading with a brief title.

THE `PLAN.md` file SHALL contain a bullet list describing what we're doing and why.

THE `PLAN.md` file SHALL include a "Specs" section listing relevant specifications with markdown links.

THE `PLAN.md` file SHALL include a "Files" section listing affected files.

THE `PLAN.md` file SHALL contain a "Steps" section with implementation steps as a checklist.

THE `PLAN.md` file SHALL include an "Acceptance Criteria" section defining what "done" means.

## Acceptance Criteria

THE "Acceptance Criteria" section SHALL define concrete, verifiable conditions for completion.

THE acceptance criteria SHALL always include that `just check` passes.

THE acceptance criteria SHALL be testable and specific to the task.

THE acceptance criteria SHALL NOT be vague (avoid "working properly", "looks good").

WHERE a task has specific verification needs THE acceptance criteria SHALL list them explicitly.

## Steps Format

THE steps SHALL use markdown checkboxes (`- [ ]` or `- [x]`).

THE steps SHALL represent atomic, committable units of work.

THE steps SHALL be designed such that `just check` passes after each step is completed and committed.

THE completed steps SHALL be marked with `[x]`.

THE incomplete steps SHALL be marked with `[ ]`.

THE current step SHALL be the first unchecked item.

WHERE investigation reveals new information THE steps MAY be updated to reflect findings.

## Working with PLAN.md

**During implementation:**
1. Complete first unchecked step
2. Verify `just check` passes
3. Mark step `[x]`
4. Commit
5. Repeat

**Keep it updated:**
- Mark steps `[x]` immediately when done
- Add/modify steps as you learn
- Update description bullets if approach changes
- Keep it concise - no verbose text
- Update plan before stopping work

**Resuming after restart:**
- First unchecked step = current work
- Checked steps = what's done
- Description = why we're doing this

## Resumability

THE `PLAN.md` file SHALL provide complete context for resuming work after restart.

THE plan SHALL be readable by a fresh Claude instance without prior conversation history.

THE plan SHALL include enough detail to understand what was tried and what worked.

## Updates

THE plan SHALL be concise - update description bullets or add/modify steps, not verbose text.

THE plan SHALL be updated before stopping work.

WHERE steps are completed THE plan SHALL mark them checked immediately.

WHERE new information changes the approach THE plan SHALL be revised.
