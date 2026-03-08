---
name: swift
description: Write Swift code for macOS apps. Use when writing Swift, SwiftUI, macOS menu bar apps, or Apple platform code.
---

# Swift Specification

## Project Initialization

THE system SHALL create a `flake.nix` from the template at `skills/swift/flake.nix`.

THE system SHALL create a `justfile` from the template at `skills/swift/justfile`, replacing `APP_NAME` with the project name.

## SwiftUI

| Pattern              | Required                                                | Forbidden                     |
| -------------------- | ------------------------------------------------------- | ----------------------------- |
| `MenuBarExtra` style | `.menu` with native items (`Button`, `Divider`, `Link`) | `.window` with custom layouts |
| Settings / Forms     | Separate `Window` scene                                 | Inline in menu                |
| Activation policy    | `.accessory` for menu bar apps                          |                               |
| State management     | `@Observable`                                           |                               |
| UI-bound classes     | `@MainActor`                                            |                               |

## Keychain

| Pattern       | Required                                                 | Forbidden                                 |
| ------------- | -------------------------------------------------------- | ----------------------------------------- |
| Keychain type | `kSecUseDataProtectionKeychain: true` (modern, Touch ID) | Legacy keychain (no data protection flag) |

## Concurrency

- Swift 6.0 strict concurrency
- All model types must be `Sendable`

## Error Handling

- Typed throws per module
- One error enum per module
- Never silently discard errors in guard returns

## Dependencies

- No external dependencies unless explicitly approved
