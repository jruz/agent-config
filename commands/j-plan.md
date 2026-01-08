---
description: Create PLAN.md to break down work into atomic, committable steps
---

Follow this process and use the plan skill's guidance to construct PLAN.md.

**IMPORTANT**:
- DO NOT use the EnterPlanMode tool - work directly in this conversation
- DO NOT use the AskUserQuestion tool - make reasonable assumptions and state them in the plan

## Process

- [ ] User will tell you what to plan - do not ask, wait for their input
- [ ] Explore codebase to understand current implementation
- [ ] Identify relevant specs in `specs/`
- [ ] List all affected files
- [ ] Break down work into atomic, committable steps where `just check` passes after each
- [ ] Define acceptance criteria (always include `just check` passes)
- [ ] Write PLAN.md at workspace root using plan skill guidance
- [ ] Present the plan to the user (they will provide feedback if needed)
- [ ] Update plan based on user feedback if they provide any
