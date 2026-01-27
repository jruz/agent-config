---
name: hooks
description: Create Claude hooks. Use when adding Claude hooks.
---

# Writing Hooks

Claude hooks execute shell commands in response to events like tool usage or session stop.

## Structure

| File | Purpose |
|------|---------|
| `.claude/settings.json` | Hook configuration |
| `.claude/hooks/<name>` | Executable shell scripts |

## Hook Configuration

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/on_edit.sh",
            "timeout": 300,
            "blocking": true
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/on_stop.sh",
            "timeout": 300,
            "blocking": true
          }
        ]
      }
    ]
  }
}
```

## Events

| Event | Trigger |
|-------|---------|
| `PostToolUse` | After Claude uses a tool |
| `Stop` | When Claude attempts to stop |

## Blocking Hooks

Return JSON to block Claude from continuing:

```json
{"decision": "block", "reason": "Tests failed"}
```

## Key Rules

- Scripts must be executable (`chmod +x`)
- Use `matcher` regex to filter which tools trigger the hook
- Set appropriate `timeout` in seconds
- Use `blocking: true` to prevent Claude from continuing on failure
- Return JSON with `decision: "block"` to stop execution
- Return JSON with `decision: "allow"` to continue (default if no output)
