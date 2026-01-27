---
description: Audit project linting setup against checks skill, reconcile differences
---

Audit the current project's linting and formatting setup against the `checks` skill standards.

Use `Skill(checks)` for reference.

## Process

1. **Scan current project** for:
   - File extensions present (detect which tools should apply)
   - Existing justfile and its lint/fmt recipes
   - Existing flake.nix and its packages
   - Existing config files (biome.json, nu-lint.toml, etc.)

2. **Compare against skill standards**:
   - Recipe naming: Does it follow `lang-lint`, `lang-lint-fix`, `lang-fmt`, `lang-fmt-fix`?
   - Aggregate recipes: Are `lint`, `fmt`, `fix`, `check` present and correct?
   - Flake packages: Are all required linters/formatters in buildInputs?
   - Config files: Do they exist? Are they aligned with templates?

3. **Report findings** in this format:

   ```
   ## File Types Detected
   - .rs, .toml, .nu, .nix, .md, ...

   ## Tools That Should Apply
   | Tool | Status | Notes |
   |------|--------|-------|
   | biome | ✅ Present | ... |
   | clippy | ⚠️ Missing recipe | ... |
   | nu-lint | ❌ Not installed | ... |

   ## Recipe Audit
   | Expected | Actual | Status |
   |----------|--------|--------|
   | rust-lint | rust-check | ⚠️ Different name |
   | rust-fmt | rust-fmt | ✅ Matches |
   | lint | lint | ✅ Present |

   ## Config Audit
   | File | Status | Differences |
   |------|--------|-------------|
   | biome.json | ⚠️ Differs | Missing CSS rules |
   | nu-lint.toml | ✅ Matches | - |

   ## Recommendations
   1. ...
   2. ...
   ```

4. **Discuss differences**:
   - If project uses different recipe names, ask: "Project uses `rust-check` instead of `rust-lint`. Keep project convention or align with skill?"
   - If project has extra rules/config, note: "Project has stricter biome rules - this is project-specific, keeping as-is"
   - If project is missing something, suggest: "Missing `nu-lint` - add it?"

5. **Identify skill improvements**:
   - If project has better patterns, note: "Project pattern X could improve the skill"
   - If project has useful config additions, suggest: "Consider adding rule Y to skill template"

## Rules

DO NOT automatically change anything - this is an audit command.

PRESENT findings and ASK before making changes.

RESPECT project-specific configurations that intentionally differ from skill.

IDENTIFY when the skill itself should be updated based on project learnings.

WHEN recipes exist with different names, propose a reconciliation strategy.

WHEN config files have extra rules, preserve them and note as project-specific.
