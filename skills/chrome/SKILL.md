---
name: chrome
description: Debug UI visually with Chrome DevTools MCP. Use when verifying UI changes, checking DOM structure, taking screenshots, or testing JavaScript in browser.
---

# UI Debugging

Use Chrome DevTools MCP to visually verify changes during development.

## MCP Tools

| Tool                                    | Purpose               |
| --------------------------------------- | --------------------- |
| `mcp__chrome-devtools__navigate_page`   | Navigate to URL       |
| `mcp__chrome-devtools__take_screenshot` | Capture current state |
| `mcp__chrome-devtools__take_snapshot`   | Get DOM snapshot      |
| `mcp__chrome-devtools__evaluate_script` | Run JavaScript        |
| `mcp__chrome-devtools__click`           | Click elements        |

## Quick Debug Workflow

1. Start server: `just run`
2. Determine the port by either:
   - Reading the `.env` file for the configured port
   - Waiting for the server startup message from `just run` output
3. Navigate to the page you're working on
4. Screenshot to verify UI looks correct
5. Snapshot to check DOM structure
6. Evaluate script to test JS in console
