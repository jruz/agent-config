---
name: plan-md
description: Use when creating a plan with PLAN.md.
---

# Plan

How to work with PLAN.md for planning and tracking implementation work. PLAN.md provides resumable context for complex tasks across sessions.

## File Location

THE `PLAN.md` file SHALL be created at the workspace root.

THE `PLAN.md` file SHALL be added to `.gitignore` as a local planning artifact.

THE `PLAN.md` file SHALL NOT be committed to version control.

## Format

```markdown
---
active_loop: true
iteration: 1
max_iterations: 20
---

# Plan: [Brief title]

- What we're doing
- Why or approach details
- Mark todos complete as work is done
- Review: after each phase | at the end

## Specs

- [Spec name](path/to/spec.md)

---

## Phase 1: [Component/Feature Name]

[One-line description of what this phase accomplishes.]

### Specs

- [component-spec.md](specs/components/component-spec.md)

### Files

- `path/to/file.rs`
- `path/to/other.rs`

### Todolist

- [ ] Step 1
- [ ] Step 2
- [ ] Step 3

### Acceptance Criteria

- [ ] `just check` passes
- [ ] [Phase-specific criteria]

---

## Phase 2: [Next Component]

...

---

## Blocker

---

## Loop Log

- **Loop 1**: [What was tried] → [Outcome]
```

## Frontmatter Fields

| Field            | Purpose                                                          |
| ---------------- | ---------------------------------------------------------------- |
| `active_loop`    | `true` = auto-loop until done, `false` = user confirms each step |
| `iteration`      | Current iteration count (incremented by stop hook)               |
| `max_iterations` | Safety limit - loop stops even if acceptance criteria not met    |

THE frontmatter SHALL always be present in PLAN.md.

THE `active_loop` field determines the workflow mode:

- `true`: Stop hook blocks exit and loops until acceptance criteria met or max_iterations reached
- `false`: User confirms after each step, no automatic looping

## Review Checkpoints

THE plan description SHALL include a bullet stating that todos are marked complete immediately after each item is done (not batched at the end of a phase).

THE plan description SHALL include a bullet specifying the review strategy: review after each phase, or review at the end of the plan.

WHEN creating a new plan, ASK the user whether they want review after each phase or at the end of the plan.

WHEN the review strategy is per-phase, STOP after completing each phase and wait for user review before moving to the next phase.

WHEN the review strategy is end-of-plan, proceed through all phases and wait for user review at the end.

## Core Principle

**Each checkmark = One atomic commit with `just check` passing**

## File Structure

THE `PLAN.md` file SHALL contain a level-1 heading with a brief title.

THE `PLAN.md` file SHALL contain a bullet list describing what we're doing and why.

THE `PLAN.md` file SHALL include a "Specs" section listing non-component specifications with markdown links.

THE `PLAN.md` file SHALL contain phases, each as a level-2 heading separated by horizontal rules.

THE `PLAN.md` file SHALL include a "Blocker" section for signaling unresolvable issues.

THE `PLAN.md` file SHALL include a "Loop Log" section tracking what was tried each iteration.

## Phases

THE plan SHALL organize work into phases, one phase per component or feature.

EACH phase SHALL contain:

- A level-2 heading with the phase number and name
- A one-line description of what the phase accomplishes
- A "Specs" subsection listing component-specific specifications
- A "Files" subsection listing affected files
- A "Todolist" subsection with implementation steps as checkboxes
- An "Acceptance Criteria" subsection defining phase completion

THE phases SHALL be separated by horizontal rules (`---`).

THE phase todolist items SHALL be concise (one line each).

THE phase acceptance criteria SHALL always include `just check` passes and `just test` passes.

## Acceptance Criteria

THE phase acceptance criteria SHALL define concrete, verifiable conditions for phase completion.

THE acceptance criteria SHALL always include that `just check` passes and `just test` passes.

THE acceptance criteria SHALL be testable and specific to the phase.

THE acceptance criteria SHALL NOT be vague (avoid "working properly", "looks good").

WHERE a phase has specific verification needs THE acceptance criteria SHALL list them explicitly.

## Loop Log

THE "Loop Log" section SHALL track what was attempted each iteration.

THE loop log entries SHALL follow the format: `- **Loop N**: [What was tried] → [Outcome]`

THE loop log entries SHALL be concise, one line per iteration.

THE loop log SHALL be updated at the end of each iteration before stopping.

## Blocker

THE `PLAN.md` file SHALL contain a "Blocker" section after the last phase and before the Loop Log.

THE Blocker section SHALL be empty by default.

WHEN encountering a problem that cannot be resolved, Claude SHALL write the reason to the Blocker section and stop immediately.

THE blocker text SHALL be concise and actionable - describe what failed and what the user needs to resolve.

WHEN the Blocker section has content, automated execution (planner) SHALL stop and display the blocker.

THE user SHALL clear the Blocker section content manually to resume.

## Todolist Format

THE todolist items SHALL use markdown checkboxes (`- [ ]` or `- [x]`).

THE todolist items SHALL represent atomic, committable units of work.

THE todolist items SHALL be designed such that `just check` passes after each item is completed and committed.

THE completed items SHALL be marked with `[x]`.

THE incomplete items SHALL be marked with `[ ]`.

THE current work SHALL be the first unchecked item in the current phase.

WHERE investigation reveals new information THE todolist MAY be updated to reflect findings.

## Working with PLAN.md

**During implementation:**

1. Work on the current phase (first phase with unchecked items)
2. Complete first unchecked todolist item
3. Verify `just check` passes
4. Mark item `[x]`
5. Commit
6. Repeat until phase acceptance criteria met
7. Move to next phase

**Keep it updated:**

- Mark items `[x]` immediately when done
- Add/modify todolist items as you learn
- Update description bullets if approach changes
- Add Loop Log entry before each loop ends: `- **Loop N**: [What tried] → [Outcome]`
- Keep it concise - no verbose text
- Update plan before stopping work

**Resuming after restart:**

- First phase with unchecked items = current phase
- First unchecked item in current phase = current work
- Checked items = what's done
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
