---
name: notify
description: Send macOS system notifications to alert the user. Use when notifying, alerting, or pinging the user about completed tasks, errors, or important events.
---

# System Notifications

Send macOS desktop notifications via `terminal-notifier`.

## Command

```bash
bun run ~/.claude/skills/notify/notify.ts "Your message here"
```

- Title is auto-resolved from the git worktree name
- Icon and sound are built-in

## Key Rules

- Keep messages short and actionable
- Use this to alert the user of completed tasks, errors, or anything that needs attention
