# Playwright MCP Tools

MCP (Model Context Protocol) tools allow interactive browser debugging during test development.

## Installation

```bash
just mcp-install-playwright
```

## Available Tools

| Tool | Purpose |
|------|---------|
| `mcp__playwright__browser_navigate` | Navigate to URL |
| `mcp__playwright__browser_snapshot` | Get page accessibility snapshot |
| `mcp__playwright__browser_click` | Click elements |
| `mcp__playwright__browser_type` | Type text |
| `mcp__playwright__browser_screenshot` | Take screenshot |

## Usage Patterns

### Debugging Test Failures

1. Use `browser_navigate` to load the page
2. Use `browser_snapshot` to get accessibility tree (preferred over screenshots)
3. Use `browser_click` and `browser_type` to interact with elements

### Test Development

THE developer SHALL prefer accessibility snapshots over screenshots for assertions.

THE developer SHALL use snapshots to understand page structure before writing selectors.

Snapshots reveal `data-test` attributes for reliable selectors.

## Management

```bash
just mcp-install-playwright    # Install playwright MCP
just mcp-remove-playwright     # Remove playwright MCP
```
