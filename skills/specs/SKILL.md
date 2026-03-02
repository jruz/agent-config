---
name: specs
description: Organize spec files. Use when creating specs. For EARS syntax, use the ears skill.
---

# Writing Specs

Specifications provide the source of truth for system behavior and requirements. This skill covers how to organize and structure spec files.

**All requirements MUST use EARS (Easy Approach to Requirements Syntax).** For EARS syntax details, use the `ears` skill.

## Spec Types

| Type    | Location          | Purpose                                                 |
| ------- | ----------------- | ------------------------------------------------------- |
| System  | `specs/system/`   | Project-wide patterns inherited by all features         |
| Feature | `specs/features/` | Specific feature behavior, references system specs      |
| General | `specs/general/`  | Cross-cutting concerns (code quality, problem modeling) |
| Tools   | `specs/tools/`    | Development tooling and workflows                       |

## Creating a System Spec

1. Create file in `specs/system/`
2. Focus on patterns that apply across multiple features
3. Keep minimal - avoid examples unless critical
4. Define "how" things are done project-wide

## Creating a Feature Spec

1. Create file in `specs/features/`
2. Start with Overview (1-2 sentences)
3. Reference system specs with relative links
4. Focus on feature-specific behavior only
5. Define "what" this specific feature does

## File Structure

```markdown
# Title

## Overview

1-3 sentences describing what this spec covers.

## Related Specifications

- [Spec Name](../path/to/spec.md) - brief description

## Section Name

THE system SHALL do something.

WHEN event occurs THE system SHALL respond.

WHERE condition exists THE system SHALL behave.

## Examples

Code samples (optional, at end only)
```

## Rules

- Write spec BEFORE implementation (specs are source of truth)
- Use EARS format for all requirements (see `ears` skill)
- Only `#` and `##` headings (no `###` or deeper)
- Capitalize EARS keywords: THE, SHALL, WHEN, WHERE, WHILE, IF, THEN
- One requirement per statement (no "and"/"or")
- Reference other specs, don't duplicate
- Describe behavior, not implementation
- Keep specs concise, atomic, focused, current

## Anti-Patterns

**Don't:**

- Use deep heading nesting (`###`, `####`)
- Write implementation details (use "database" not "PostgreSQL 14")
- Duplicate requirements from other specs
- Use "should" or "must" (use SHALL)
- Mix multiple requirements in one statement
- Write vague requirements ("work properly", "be fast")

**Do:**

- Link to related specs instead of duplicating
- Keep requirements testable and verifiable
- Use present tense for actions
- Make requirements atomic (one thing per requirement)

## Before Writing

1. Review the `ears` skill to understand EARS syntax
2. Read an existing spec to understand the format
3. Match the flat 2-level structure (`#` and `##` only)
4. Stay in requirements mode, not documentation mode
5. Think: "How would I verify this requirement?"
