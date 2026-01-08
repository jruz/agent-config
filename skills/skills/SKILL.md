---
name: skills
description: Create Claude skills that provide context-specific guidance. Use when creating a new skill, adding a skill, modifying skills, or asking about skill structure.
---

# Writing Skills

Claude skills provide context-specific guidance and workflows. Skills are automatically discovered when relevant to the conversation.

## Structure

| File                             | Purpose                                |
| -------------------------------- | -------------------------------------- |
| `.claude/skills/<name>/SKILL.md` | Skill definition with YAML frontmatter |

## SKILL.md Template

```markdown
---
name: lowercase-kebab-case
description: What it does. Use when <specific trigger terms>.
---

# Skill Name

Brief description of what this skill helps with.

## Section

| Column | Column |
| ------ | ------ |

## Key Rules

- Rule 1
- Rule 2
```

## Key Rules

- skills must have the main file named `SKILL.md` (all caps)
- Directory name: lowercase kebab-case, max 64 chars, alphanumeric with hyphens only
- `name` field must match directory name
- `description` must include what it does AND when to use it
- `description` must be 1024 characters or less
- Include domain-specific trigger terms users would say
- Use tables for quick reference
- Provide actionable guidance, not theory
- One skill = one focused capability
- After creating a skill, add `Skill(skill-name)` to the `allow` list in `.claude/settings.json` (keep alphabetically sorted)

## Description Best Practices

The description determines when Claude uses the skill. Make it discoverable:

**Good:**

- "Build backend features with Rust, Axum, SQLx. Use when creating API endpoints, controllers, services, models, database queries, or server-side logic."
- "Write and debug E2E tests with Playwright. Use when creating integration tests, debugging test failures, updating screenshot baselines, or working with test selectors."

**Bad:**

- "Backend development" (too vague)
- "Helps with Rust" (missing trigger terms)

## Organization Patterns

WHERE skills reference project specs THE skill SHALL link to source specs at the top.

WHERE skills provide quick reference THE skill SHALL use tables for scanability.

WHERE skills have multiple sections THE skill SHALL organize them logically (structure, patterns, rules).

## Supporting Files

Skills MAY contain additional files beyond `SKILL.md`:

- Reference documentation
- Examples
- Helper scripts

Claude loads supporting files only when needed, keeping context usage minimal.

## Tool Restrictions

Skills MAY specify an `allowed-tools` field in frontmatter to limit Claude's tool usage when the skill is active.

```markdown
---
name: my-skill
description: Description here
allowed-tools: ["Read", "Grep", "LSP"]
---
```

## Permissions

WHERE a skill requires web access for documentation:

- Add WebFetch permissions to `.claude/settings.json`
- Add to the allow list: `WebFetch(domain:example.com)`
- Keep permissions sorted alphabetically

Example for a Rust skill needing docs.rs access:

```json
{
  "permissions": {
    "allow": [
      "Skill(rust)",
      "WebFetch(domain:docs.rs)",
      "WebFetch(domain:doc.rust-lang.org)"
    ]
  }
}
```

## Global vs Project Skills

**Global skills** - Generic patterns applicable to any project:

- Language syntax (Rust, Nushell, etc.)
- Tool usage (justfile, git-commits, etc.)
- Document formats (PLAN.md, etc.)

**Project skills** - Project-specific workflows:

- Technology stack combinations
- Project-specific architecture patterns
- Domain-specific business logic
