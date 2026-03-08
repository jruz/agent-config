---
name: chrome
description: Debug UI with Chrome Browser DevTools MCP.
---

# UI Debugging with chrome-cli

Use `chrome-cli` to control Chrome via CDP for visual verification during development.

## Quick Debug Workflow

1. Launch: `chrome-cli launch` (returns port)
2. Navigate: `chrome-cli navigate --port <port> --url <url> --timeout 10000`
3. Snapshot: `chrome-cli snapshot --port <port>` (get uids)
4. Screenshot: `chrome-cli screenshot --port <port> --path /tmp/debug.png`
5. Interact using uids from snapshot
6. Kill: `chrome-cli kill --port <port>`

## Commands

| Command                 | Purpose                       | Key Flags                                                                                                       |
| ----------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `launch`                | Start Chrome instance         | `--headed`                                                                                                      |
| `kill`                  | Stop Chrome instance          | `--port`                                                                                                        |
| `kill-all`              | Stop all instances            |                                                                                                                 |
| `navigate`              | Go to URL                     | `--port --url --timeout [--init-script] [--handle-before-unload]`                                               |
| `back`                  | Navigate back                 | `--port`                                                                                                        |
| `forward`               | Navigate forward              | `--port`                                                                                                        |
| `reload`                | Reload page                   | `--port [--ignore-cache]`                                                                                       |
| `snapshot`              | Accessibility tree (get uids) | `--port [--verbose] [--path]`                                                                                   |
| `screenshot`            | Capture image                 | `--port [--path] [--full-page] [--format] [--quality] [--uid]`                                                  |
| `click`                 | Click element                 | `--port --uid [--dbl-click] [--include-snapshot]`                                                               |
| `hover`                 | Hover element                 | `--port --uid [--include-snapshot]`                                                                             |
| `fill`                  | Type into input               | `--port --uid --value [--include-snapshot]`                                                                     |
| `type`                  | Type into focused element     | `--port --text [--submit-key] [--include-snapshot]`                                                             |
| `press`                 | Press key                     | `--port --key [--include-snapshot]`                                                                             |
| `drag`                  | Drag element                  | `--port --from --to [--include-snapshot]`                                                                       |
| `upload`                | Upload file                   | `--port --uid --file [--include-snapshot]`                                                                      |
| `fill-form`             | Batch fill inputs             | `--port --fields '[{"uid":"1","value":"x"}]' [--include-snapshot]`                                              |
| `resize`                | Set viewport size             | `--port --width --height`                                                                                       |
| `eval`                  | Run JavaScript                | `--port --expression [--args]`                                                                                  |
| `pages`                 | List open pages               | `--port`                                                                                                        |
| `new-page`              | Open new tab                  | `--port --url [--background] [--isolated-context] [--timeout]`                                                  |
| `close-page`            | Close tab                     | `--port --page-id`                                                                                              |
| `select-page`           | Switch tab                    | `--port --page-id [--no-bring-to-front]`                                                                        |
| `emulate`               | Device emulation              | `--port [--viewport] [--color-scheme] [--cpu-throttling] [--network-conditions] [--user-agent] [--geolocation]` |
| `wait`                  | Wait for text                 | `--port --text --timeout`                                                                                       |
| `dialog`                | Handle dialog                 | `--port --action [--prompt-text]`                                                                               |
| `network-start`         | Start capture                 | `--port`                                                                                                        |
| `network-list`          | List requests                 | `--port [--type] [--include-preserved] [--page-size] [--page-idx]`                                              |
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
- Use `--include-snapshot` on interactions to get updated uids in the response
- Use `--port` on every command (except launch/daemon commands)
- `eval --args` takes JSON array of `{"uid":"<id>"}` objects to pass elements to the expression
- `fill-form --fields` takes a JSON string array of `{"uid":"<id>","value":"<text>"}` objects
- `wait --text` accepts comma-separated values, resolves when any appears
- `emulate --viewport` format is `WxH` (e.g., `375x812`)
- `emulate --geolocation` format is `lat,lng`
- Screenshots save to file with `--path`, otherwise return base64
- Network/console capture must be explicitly started before listing
