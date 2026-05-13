Prepare and push PR automatically, then report what was created.

## Workflow

**For New PRs:**

1. Rebase onto main if needed
2. Analyze all changes and draft PR title, What, Why
3. Update specs if needed
4. Clean working directory (remove unrelated files)
5. Create one clean commit
6. Push to remote
7. Create PR with label
8. Monitor CI via woodpecker-channel
9. Report final status

**For Existing PRs:**

1. Rebase onto main if needed
2. Analyze what changed since last push
3. Update specs if needed
4. Clean working directory (remove unrelated files)
5. Create commit with new changes
6. Push to remote
7. Update PR title and description to reflect all changes
8. Monitor CI via woodpecker-channel
9. Report final status

## Instructions

### 1. Check Current State

Detect repo from git remote:

```bash
git remote get-url origin | sed -E 's|.*codeberg\.org[:/]||; s|\.git$||'
```

This gives `{owner}/{repo}` used in all API calls below.

Check current branch:

```bash
git rev-parse --abbrev-ref HEAD
```

Check if PR exists for current branch:

```bash
curl -s "https://codeberg.org/api/v1/repos/{owner}/{repo}/pulls?state=open&head={owner}:{branch}" \
  -H "Authorization: token $CODEBERG_TOKEN"
```

If the response array is non-empty, a PR already exists. Extract `number`, `title`, and `body` from the first element.

Check if branch exists on remote:

```bash
git ls-remote --heads origin $(git rev-parse --abbrev-ref HEAD)
```

### 2. Rebase Onto Main If Needed

Fetch latest main:

```bash
git fetch origin main
```

Check if branch is behind main:

```bash
git merge-base --is-ancestor origin/main HEAD
```

If the command exits with code 1, the branch is behind main and needs rebasing.

Rebase onto main:

```bash
git rebase origin/main
```

**If conflicts occur, resolve them automatically:**

1. Check rebase status to identify conflicted files:

```bash
git status
```

1. For each conflicted file:
   - Read the file to see conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
   - Understand what main changed (between `<<<<<<< HEAD` and `=======`)
   - Understand what PR changes (between `=======` and `>>>>>>>`)
   - Resolve by applying PR changes on top of main's changes:
     - Keep main's structural changes (new functions, imports, etc.)
     - Apply PR's changes on top
     - Ensure PR's intent is preserved
     - Remove conflict markers

2. Stage each resolved file:

```bash
git add <file>
```

1. Continue the rebase:

```bash
git rebase --continue
```

1. Track all conflicts and resolutions for final report:
   - File path
   - What main changed
   - What PR changed
   - How it was resolved

**Conflict Resolution Strategy:**

- **Main has priority** - accept main's changes as the new base
- If main added new code and PR modified different nearby code → keep both (main's changes + PR's changes)
- If main and PR modified the **same line** → understand PR's intent and apply that intent on top of main's new context
- If main deleted code that PR didn't modify → accept main's deletion
- If main deleted code that PR modified → keep main's deletion (PR was modifying code that no longer exists)
- If main added dependencies/imports that PR also added → keep main's version only (avoid duplicates)
- If main modified structure/signatures that PR depends on → update PR's code to work with main's new structure

**IMPORTANT:** Never modify the main branch. All resolution happens on the current PR branch during rebase.

If rebase succeeds (with or without conflicts), continue to next step.

### 3. Analyze Changes

**For New PRs (no remote branch or no PR):**

Analyze the complete changeset:

- Committed changes: `git diff origin/main...HEAD`
- Uncommitted changes: `git diff HEAD`
- Staged changes: `git diff --cached`

Understand:

- What functionality is being added/changed/fixed
- Which files are affected
- What the scope of changes is

**For Existing PRs:**

Analyze what changed since last push:

- New commits: `git log origin/$(git rev-parse --abbrev-ref HEAD)..HEAD --oneline`
- Uncommitted changes: `git diff HEAD`
- Staged changes: `git diff --cached`

Also review entire branch to ensure description covers everything:

- All branch changes: `git diff origin/main...HEAD`

### 4. Draft PR Title and Description

**For New PRs:**

Draft the PR title and description following the `github-pr` skill conventions (use `Skill(github-pr)`):

- **Title**: Follow the pattern `[Prefix] Area/Thing: Imperative Action`
- **What**: Bulleted imperatives covering ALL changes in the branch
- **Why**: Exactly ONE bullet explaining core motivation

Reference `Skill(github-pr)` for:

- Complete prefix list and selection criteria
- Title format rules and examples
- Description structure and formatting
- What to include vs exclude

**For Existing PRs:**

Get current title and description from the PR API response in step 1.

Analyze if title needs updating based on new changes (follow `Skill(github-pr)` for format).

Update "What" section to include new changes while keeping existing ones.

Keep "Why" section as-is unless core motivation changed.

### 5. Update Specs If Needed

**Note:** Only if project has a `specs/` directory.

Review all changed files: `git diff origin/main...HEAD --name-only`

Identify which specs should cover these changes.

Read relevant specs to verify they're current.

If specs need updates, categorize the changes:

**Additions (automatic, no approval needed):**

- Adding new sections to existing specs
- Adding new spec files
- Expanding existing descriptions with more details
- Adding new examples or clarifications

For additions:

- Update automatically
- Track what was added for final report

**Modifications or Removals (require approval):**

- Changing existing spec content
- Removing spec sections
- Renaming specs
- Contradicting existing specs

For modifications/removals:

- Show what will be changed (diff or description)
- Ask user: "Approve these spec changes?"
- Wait for approval
- Execute changes after approval
- Track what was changed for final report

### 6. Clean Working Directory

Identify unrelated files in uncommitted changes.

**Unrelated files typically include:**

- Lock files that changed from unrelated commands: `deno.lock`, `Cargo.lock`, `package-lock.json`, `bun.lock`
- Auto-generated configs unrelated to the PR
- Accidentally modified files

**For each file, determine:**

- Is it a direct consequence of the PR changes? → KEEP IT
  - Example: Added dependency → lock file updated → KEEP
- Is it unrelated? → REMOVE IT
  - Example: Ran unrelated command → lock file updated → REMOVE

**To remove unrelated files:**

- If staged: `git restore --staged <file>`
- If unstaged: leave it alone (don't commit it)

**Track unrelated files:**

- List them for final report
- Note hypothesis about why they changed

### 7. Create Commit

**For New PRs:**

Stage all related changes:

```bash
git add <files>
```

Create one commit using the PR title as the message:

```bash
git commit -m "[Prefix] Area/Thing: Imperative Action"
```

**For Existing PRs:**

Stage all related changes:

```bash
git add <files>
```

Create a commit describing the new changes:

```bash
git commit -m "Add <what changed>"
```

The commit message should be descriptive but doesn't need to follow the PR title format.

### 8. Push to Remote

**For New PRs (branch doesn't exist on remote):**

```bash
git push -u origin HEAD
```

**For Existing PRs (branch exists on remote):**

```bash
git push
```

Normal push, no force needed.

### 9. Create/Update PR with Label

**For New PRs:**

Create PR via Codeberg API:

```bash
curl -s -X POST "https://codeberg.org/api/v1/repos/{owner}/{repo}/pulls" \
  -H "Authorization: token $CODEBERG_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$(cat <<'EOF'
{
  "title": "TITLE",
  "head": "{branch}",
  "base": "main",
  "body": "DESCRIPTION",
  "labels": [LABEL_ID]
}
EOF
)"
```

Extract `number` and `html_url` from the response.

To find the label ID, list repo labels first:

```bash
curl -s "https://codeberg.org/api/v1/repos/{owner}/{repo}/labels" \
  -H "Authorization: token $CODEBERG_TOKEN"
```

Map prefix to label name:

- [feat] → feat
- [bugs] → bugs
- [refa] → refa
- [deps] → deps
- [tool] → tool

**For Existing PRs:**

Update PR title, description, and labels via PATCH:

```bash
curl -s -X PATCH "https://codeberg.org/api/v1/repos/{owner}/{repo}/pulls/{pr_number}" \
  -H "Authorization: token $CODEBERG_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$(cat <<'EOF'
{
  "title": "NEW_TITLE",
  "body": "DESCRIPTION"
}
EOF
)"
```

Update labels if prefix changed:

```bash
curl -s -X POST "https://codeberg.org/api/v1/repos/{owner}/{repo}/pulls/{pr_number}/labels" \
  -H "Authorization: token $CODEBERG_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"labels": [LABEL_ID]}'
```

### 10. Monitor CI

Start watching the branch for CI pipeline results using the woodpecker-channel MCP tool:

```
mcp__woodpecker-channel__watch(repo: "{owner}/{repo}", branch: "{branch}")
```

This will poll Woodpecker CI every 5s and notify on failure. The watch stays active until CI completes or is manually stopped with `mcp__woodpecker-channel__stop_watch(branch: "{branch}")`.

### 11. Report Final Status

Report everything together:

**PR URL:** `<url>`

**Title:** `<title>`

**What:**

- `<bullet 1>`
- `<bullet 2>`
- `<bullet 3>`

**Why:**

- `<single bullet>`

**Specs:** (if applicable)

- `<spec links>`

**Files Modified:** (from `git diff --name-only origin/main...HEAD`)

- `<file 1>`
- `<file 2>`

**Commits:** (from `git log origin/main..HEAD --oneline`)

- `<commit 1>`
- `<commit 2>`

**Stats:** `<additions> additions, <deletions> deletions` (from `git diff --shortstat origin/main...HEAD`)

**CI Status:**

- ⏳ Watching via woodpecker-channel (will notify on failure)

**Unrelated Files Left Unstaged:** (if any)

- `<file>` - `<hypothesis about why it changed>`

**Spec Updates:** (if any)

- `<what specs were updated>`

**Conflicts Resolved:** (if any)

- `<file>` - Main: `<what main changed>`, PR: `<what PR changed>`, Resolution: `<how resolved>`

## Reference Information

All PR conventions (title format, description structure, size guidelines, splitting strategies) are defined in the `pr` skill (use `Skill(pr)`).

When PR size exceeds 1000 lines, warn the user and suggest they may want to split the PR using strategies from the `github-pr` skill.
