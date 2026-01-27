---
description: Create PLAN.md to break down work into atomic, committable steps
---

Follow this process and use the plan skill's guidance to construct PLAN.md.

**IMPORTANT**:

- DO NOT use the EnterPlanMode tool - work directly in this conversation
- DO NOT use the AskUserQuestion tool - make reasonable assumptions and state them in the plan

## Workflow Mode Decision

Decide whether this plan needs `active_loop: true` or `active_loop: false`:

**Use `active_loop: true` (auto-loop) when:**
- Task is well-defined with clear acceptance criteria
- Steps are mechanical/straightforward
- No design decisions needed during execution
- Examples: bug fixes, refactoring, adding tests, implementing from spec

**Use `active_loop: false` (user confirmation) when:**
- Task requires design decisions at each step
- User feedback needed on intermediate results
- Exploratory or research-heavy work
- Examples: UI design, architecture decisions, unclear requirements

## Process

- [ ] User will tell you what to plan - do not ask, wait for their input
- [ ] Ask user: "How many loop iterations before stopping?" (default: 20)
- [ ] Explore codebase to understand current implementation
- [ ] Identify relevant specs in `specs/`
- [ ] List all affected files
- [ ] Break down work into atomic, committable steps where `just check` passes after each
- [ ] Define acceptance criteria (always include `just check` passes)
- [ ] Decide workflow mode (active_loop true or false) based on task nature
- [ ] Write PLAN.md at workspace root with frontmatter using plan skill guidance
- [ ] Present the plan to the user (they will provide feedback if needed)
- [ ] Update plan based on user feedback if they provide any
- [ ] If active_loop is true, begin execution immediately after plan is finalized
