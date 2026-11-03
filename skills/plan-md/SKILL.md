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
- Commits: after each phase | once at the end

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

ASK planning decisions one at a time. Do not ask when the user has already stated their preference.

BEFORE requesting user review THE developer SHALL stage only the changes being reviewed so the user can inspect the staged diff.

THE developer SHALL keep unrelated files and unrelated hunks in shared files unstaged.

WHEN the review strategy is per-phase, STOP after completing each phase and wait for user review before moving to the next phase.

WHEN the review strategy is end-of-plan, proceed through all phases and wait for user review at the end.

## Commit Strategy

THE plan description SHALL include one commit strategy:

- `after each phase`: commit after all phase acceptance criteria pass
- `once at the end`: create one commit after every phase's acceptance criteria pass

WHEN creating a new plan, ASK the user which commit strategy they want.

THE selected commit strategy SHALL control when commits are created during implementation.

THE plan SHALL NOT assume that todos, phases, and commits have the same boundaries.

## Core Principles

- Each phase = One independently verifiable outcome
- Each completed phase = Its implementation has passed its acceptance criteria

## File Structure

THE `PLAN.md` file SHALL contain a level-1 heading with a brief title.

THE `PLAN.md` file SHALL contain a bullet list describing what we're doing and why.

THE `PLAN.md` file SHALL include a "Specs" section listing non-component specifications with markdown links.

THE `PLAN.md` file SHALL contain phases, each as a level-2 heading separated by horizontal rules.

THE `PLAN.md` file SHALL include a "Blocker" section for signaling unresolvable issues.

THE `PLAN.md` file SHALL include a "Loop Log" section tracking what was tried each iteration.

## Phases

THE plan SHALL organize work into phases based on independently verifiable outcomes.

EACH phase SHALL leave the project in a coherent state that can be verified before starting the next phase.

DEFINE the phase acceptance criteria before finalizing the phase boundary.

WHEN a phase cannot be verified until work in a later phase exists, merge the phases or move the dependent work and its acceptance criteria to the later phase.

DO NOT split phases solely by file, repository, technology, or implementation layer when those pieces cannot be verified independently.

EACH phase SHALL contain:

- A level-2 heading with the phase number and name
- A one-line description of what the phase accomplishes
- A "Specs" subsection listing component-specific specifications
- A "Files" subsection listing affected files
- A "Todolist" subsection with implementation steps as checkboxes
- An "Acceptance Criteria" subsection defining phase completion

THE phases SHALL be separated by horizontal rules (`---`).

### File Lists

THE "Files" subsection SHALL list one explicit file path per bullet, with one bullet per line.

THE file lists SHALL NOT combine multiple files on one line or abbreviate them with brace expansions, globs or directory paths.

THE phase todolist items SHALL be concise (one line each).

THE phase acceptance criteria SHALL include the project's applicable check and test commands.

## Acceptance Criteria

THE phase acceptance criteria SHALL define concrete, verifiable conditions for phase completion.

THE acceptance criteria SHALL validate that the phase's intended outcome works, not merely that implementation steps were performed or configuration exists.

WHERE the phase changes runtime behavior, THE acceptance criteria SHALL exercise and observe that runtime behavior.

STATIC validation alone SHALL NOT be used to accept a phase whose intended outcome is runtime behavior.

EACH acceptance criterion SHALL be satisfiable by the end of its phase without depending on unfinished later phases.

THE acceptance criteria SHALL name the command, probe, test, or observable evidence used for verification where practical.

THE acceptance criteria SHALL include `just check` and `just test` when those executable recipes exist.

WHEN an aggregate check or test recipe does not exist, THE acceptance criteria SHALL list the applicable verification commands instead of treating the missing recipe as evidence of correctness.

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

THE todolist items SHALL represent atomic units of work.

THE todolist items SHALL be designed so the project remains valid after each item is completed.

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
5. Repeat until all phase acceptance criteria pass
6. Commit if the selected strategy is `after each phase`
7. Move to the next phase
8. After the final phase, commit if the selected strategy is `once at the end`

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
