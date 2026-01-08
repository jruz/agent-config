---
description: Review code using project skills (justfile, rust, sqlx)
---

Spin up the code-reviewer agent to review code files against project skills.

**IMPORTANT**:
- DO NOT use the AskUserQuestion tool - let the agent handle user interaction
- Use the Task tool with subagent_type='code-reviewer' to spawn the review agent

## Process

- [ ] Spawn the code-reviewer agent using Task tool with this prompt:

```
Review all code files in the current project against the justfile, rust, and sqlx skills. Report all violations found.
```

- [ ] Wait for agent to complete review and report findings
- [ ] Agent will ask if violations should be added to PLAN.md
- [ ] Follow agent's guidance
