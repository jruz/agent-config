---
name: chrome
description: Debug UI with chrome-cli via CDP. Use when visually verifying changes, taking screenshots, inspecting DOM, network capture, or browser automation.
---

# UI Debugging with chrome-cli

Use `chrome-cli` to control Chrome via CDP for visual verification during development.

## One-shot

For quick content retrieval without managing browser lifecycle:

- Text: `chrome-cli oneshot --url <url> --mode snapshot`
- Screenshot: `chrome-cli oneshot --url <url> --mode screenshot --path /tmp/page.png`
- Verbose text: `chrome-cli oneshot --url <url> --mode snapshot --verbose`

Defaults: timeout 30s, viewport 1366x768, png format, full-page screenshots.
Uses `networkidle0` wait strategy — works with SPAs.

## Multi-step Debug Workflow

1. Launch: `chrome-cli launch` (returns port)
2. Navigate: `chrome-cli navigate --port <port> --url <url> --timeout 10000`
3. Snapshot: `chrome-cli snapshot --port <port>` (get uids)
4. Screenshot: `chrome-cli screenshot --port <port> --format png --path /tmp/debug.png`
5. Interact using uids from snapshot
6. Kill: `chrome-cli kill --port <port>`

## Commands

| Command                 | Purpose                       | Key Flags                                                                                                       |
| ----------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `oneshot`               | One-shot page capture         | `--url --mode [--timeout] [--path] [--verbose] [--full-page] [--format] [--quality] [--width] [--height]`       |
| `launch`                | Start Chrome instance         | `--headed`                                                                                                      |
| `kill`                  | Stop Chrome instance          | `--port`                                                                                                        |
| `kill-all`              | Stop all instances            |                                                                                                                 |
| `navigate`              | Go to URL                     | `--port --url --timeout [--init-script]`                                                                        |
| `back`                  | Navigate back                 | `--port`                                                                                                        |
| `forward`               | Navigate forward              | `--port`                                                                                                        |
| `reload`                | Reload page                   | `--port [--ignore-cache]`                                                                                       |
| `snapshot`              | Accessibility tree (get uids) | `--port [--verbose] [--path]`                                                                                   |
| `screenshot`            | Capture image                 | `--port --format [--path] [--full-page] [--quality] [--uid]`                                                    |
| `click`                 | Click element                 | `--port --uid [--dbl-click]`                                                                                    |
| `hover`                 | Hover element                 | `--port --uid`                                                                                                  |
| `fill`                  | Type into input               | `--port --uid --value`                                                                                          |
| `type`                  | Type into focused element     | `--port --text [--submit-key]`                                                                                  |
| `press`                 | Press key                     | `--port --key`                                                                                                  |
| `drag`                  | Drag element                  | `--port --from --to`                                                                                            |
| `upload`                | Upload file                   | `--port --uid --file`                                                                                           |
| `fill-form`             | Batch fill inputs             | `--port --fields '[{"uid":"1","value":"x"}]'`                                                                   |
| `resize`                | Set viewport size             | `--port --width --height`                                                                                       |
| `eval`                  | Run JavaScript                | `--port --expression [--args]`                                                                                  |
| `pages`                 | List open pages               | `--port`                                                                                                        |
| `new-page`              | Open new tab                  | `--port --url [--background] [--isolated-context] [--timeout]`                                                  |
| `close-page`            | Close tab                     | `--port --page-id`                                                                                              |
| `select-page`           | Switch tab                    | `--port --page-id`                                                                                              |
| `emulate`               | Device emulation              | `--port [--viewport] [--color-scheme] [--cpu-throttling] [--network-conditions] [--user-agent] [--geolocation]` |
| `wait`                  | Wait for text                 | `--port --text --timeout`                                                                                       |
| `dialog`                | Handle dialog                 | `--port --action [--prompt-text]`                                                                               |
| `network-start`         | Start capture                 | `--port`                                                                                                        |
| `network-list`          | List requests                 | `--port [--type] [--page-size] [--page-idx]`                                                                    |
| `network-get`           | Get request detail            | `--port --reqid [--request-file] [--response-file]`                                                             |
| `network-stop`          | Stop capture                  | `--port`                                                                                                        |
| `console-start`         | Start capture                 | `--port`                                                                                                        |
| `console-list`          | List messages                 | `--port [--type] [--include-preserved] [--page-size] [--page-idx]`                                              |
| `console-get`           | Get message detail            | `--port --msgid`                                                                                                |
| `console-stop`          | Stop capture                  | `--port`                                                                                                        |
| `trace-start`           | Start perf trace              | `--port [--path] [--reload] [--auto-stop]`                                                                      |
| `trace-stop`            | Stop perf trace               | `--port [--path]`                                                                                               |
| `trace-analyze`         | Analyze trace file            | `--path`                                                                                                        |
| `trace-analyze-insight` | Drill into insight            | `--path --insight-set-id --insight-name`                                                                        |
| `heap-snapshot`         | Memory snapshot               | `--port --path`                                                                                                 |
| `daemon-start`          | Start daemon                  |                                                                                                                 |
| `daemon-status`         | Check daemon                  |                                                                                                                 |
| `daemon-stop`           | Stop daemon                   |                                                                                                                 |

## Key Rules

- Always pass `--timeout` on `navigate` (default: 10000)
- Get uids from `snapshot` before interacting — uids come from the accessibility tree
- Use `--port` on every command (except launch/daemon commands)
- `eval --args` takes JSON array of `{"uid":"<id>"}` objects to pass elements to the expression
- `fill-form --fields` takes a JSON string array of `{"uid":"<id>","value":"<text>"}` objects
- `wait --text` accepts comma-separated values, resolves when any appears
- `emulate --viewport` format is `WxH` (e.g., `375x812`)
- `emulate --geolocation` format is `lat,lng`
- Screenshots save to file with `--path`, otherwise return base64
- Network/console capture must be explicitly started before listing
