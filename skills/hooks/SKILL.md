---
name: hooks
description: Create Claude hooks. Use when adding Claude hooks.
---

# Writing Hooks

- Hooks execute shell commands in response to Claude Code lifecycle events
- Configuration lives in `settings.json` under the `hooks` key
- Scripts go in `.claude/hooks/` (or `~/.claude/hooks/` for global)

## Events

| Event                | Trigger                    | Can block?        | Matcher                                            |
| -------------------- | -------------------------- | ----------------- | -------------------------------------------------- |
| `SessionStart`       | Session begins/resumes     | No                | `startup`, `resume`, `clear`, `compact`            |
| `UserPromptSubmit`   | Prompt submitted           | Yes               | None                                               |
| `PreToolUse`         | Before tool executes       | Yes               | Tool name regex                                    |
| `PermissionRequest`  | Permission dialog shown    | Yes               | Tool name regex                                    |
| `PostToolUse`        | After tool succeeds        | No                | Tool name regex                                    |
| `PostToolUseFailure` | After tool fails           | No                | Tool name regex                                    |
| `Notification`       | Notification sent          | No                | `permission_prompt`, `idle_prompt`, `auth_success` |
| `SubagentStart`      | Subagent spawned           | No                | Agent type                                         |
| `SubagentStop`       | Subagent finishes          | Yes               | Agent type                                         |
| `Stop`               | Claude finishes responding | Yes               | None                                               |
| `TaskCompleted`      | Task marked completed      | Yes (exit 2 only) | None                                               |
| `TeammateIdle`       | Teammate going idle        | Yes (exit 2 only) | None                                               |
| `PreCompact`         | Before context compaction  | No                | `manual`, `auto`                                   |
| `SessionEnd`         | Session terminates         | No                | `clear`, `logout`, `other`                         |

## Configuration

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/my-hook.nu",
            "timeout": 300
          }
        ]
      }
    ]
  }
}
```

## Hook Types

- `command`: Shell command, receives JSON on stdin, default timeout 600s
- `prompt`: Single-turn LLM eval, use `$ARGUMENTS` for input, default timeout 30s
- `agent`: Multi-turn subagent with Read/Grep/Glob tools, default timeout 60s

## Stdin Input

- All events receive: `session_id`, `transcript_path`, `cwd`, `permission_mode`, `hook_event_name`
- `PreToolUse` / `PostToolUse` / `PostToolUseFailure`: adds `tool_name`, `tool_input`, `tool_use_id`
- `PostToolUse`: adds `tool_response`
- `PostToolUseFailure`: adds `error`, `is_interrupt`
- `UserPromptSubmit`: adds `prompt`
- `Stop` / `SubagentStop`: adds `stop_hook_active` (check to avoid infinite loops)
- `SessionStart`: adds `source`, `model`
- `Notification`: adds `message`, `title`, `notification_type`
- `SubagentStart` / `SubagentStop`: adds `agent_id`, `agent_type`
- `TaskCompleted`: adds `task_id`, `task_subject`, `task_description`

## Tool Input Fields

- `Bash`: `command`, `description`, `timeout`
- `Write`: `file_path`, `content`
- `Edit`: `file_path`, `old_string`, `new_string`
- `Read`: `file_path`, `offset`, `limit`
- `Glob`: `pattern`, `path`
- `Grep`: `pattern`, `path`, `glob`
- `WebFetch`: `url`, `prompt`
- `Task`: `prompt`, `description`, `subagent_type`

## Exit Codes

- `0`: Success, parse stdout JSON for decisions
- `2`: Blocking error, stderr fed back to Claude
- Other: Non-blocking error, stderr shown in verbose only

## Blocking Output (JSON to stdout)

```json
{ "decision": "block", "reason": "Explain why" }
```

## PreToolUse Output (JSON to stdout)

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow|deny|ask",
    "permissionDecisionReason": "reason",
    "updatedInput": { "command": "modified command" },
    "additionalContext": "extra context for Claude"
  }
}
```

## Universal Output Fields

- `continue`: `false` stops Claude entirely (overrides event decisions)
- `stopReason`: message shown when `continue` is `false`
- `suppressOutput`: `true` hides stdout from verbose mode
- `systemMessage`: warning shown to user

## Environment Variables

- `$CLAUDE_PROJECT_DIR`: project root
- `$CLAUDE_ENV_FILE`: path to write persistent env vars (SessionStart only)

## Key Rules

- Scripts must be executable (`chmod +x`)
- `matcher` is a regex against tool names (e.g., `Edit|Write`, `mcp__.*`)
- Check `stop_hook_active` in Stop hooks to prevent infinite loops
- Set `"async": true` to run hooks in background
- Hooks captured at startup; edits need `/hooks` menu review
- Identical hooks are deduplicated and run in parallel
