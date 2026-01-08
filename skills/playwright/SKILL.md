---
name: playwright
description: Write and debug E2E tests with Playwright. Use when creating integration tests, debugging test failures, updating screenshot baselines, or working with test selectors.
---

# Playwright Testing

## Justfile Template

WHERE a project needs Playwright recipes THE developer SHALL copy [justfile](justfile) recipes to the project justfile.

The template provides:
- `playwright-install` - Install Chromium browser
- `playwright-build` - Build and prepare test environment
- `playwright *ARGS` - Run tests (depends on playwright-build)
- `playwright-update-snapshots` - Update visual snapshots
- `mcp-install-playwright` / `mcp-remove-playwright` - MCP management

THE `playwright-build` recipe SHALL be customized per project to:
1. Source the test environment (`scripts/load-test-env.nu`)
2. Call the project's build recipe

## Common Commands

```bash
just playwright                    # Run all E2E tests
just playwright -g "pattern"       # Run specific tests
just playwright-update-snapshots   # Update snapshots (ONLY after intentional UI changes)
```

## MCP Tools

For debugging tests interactively with MCP, see [mcp.md](mcp.md).

## Test Isolation

THE system SHALL use a dedicated test environment (`.env.test`).

THE test environment SHALL use a different port than development.

THE system SHALL use a separate test database.

THE tests SHALL NOT share state between test files.

THE system SHALL reset the test database before running tests.

THE system SHALL start a fresh server for each test run.

## Test Categories

THE system SHALL organize tests by what they verify:

- **Server tests** verify server responses and inline JSON data consumed by JavaScript
- **Client tests** verify page rendering and user interactions
- **Visual tests** verify appearance through screenshot comparison

WHERE tests verify response content or embedded data THE system SHALL place them in `server/`.

WHERE tests verify rendering or interaction THE system SHALL place them in `client/`.

## File Organization

THE test files SHALL reside in `playwright/` directory.

THE test files SHALL use `.spec.ts` suffix.

THE helper functions SHALL reside in `playwright/helpers/`.

THE screenshot baselines SHALL reside in `playwright/screenshots/`.

## Subdirectory Organization

THE server tests SHALL be organized by route, mirroring the handler structure.

THE server test file SHALL be named after the route (e.g., `historical.spec.ts`).

THE client tests SHALL be organized by view.

WHERE a view has a single test file THE client test file SHALL be named after the route (e.g., `historical.spec.ts`).

WHERE a view has multiple test files THE client tests SHALL reside in a folder named after the route.

THE client test file for the main view SHALL be named after the route (e.g., `historical.spec.ts`).

THE client test file for a module SHALL be named after the module (e.g., `chart_day.spec.ts`).

WHERE a module is used across multiple views THE module tests SHALL reside in the view folder where they are primarily used.

Example structure:
```
playwright/
├── server/
│   └── historical.spec.ts       # Tests: GET /historical/:ticker
└── client/
    └── historical/              # View with multiple tests
        ├── historical.spec.ts   # Tests: historical view
        ├── chart_day.spec.ts    # Tests: chart_day module
        ├── calendar.spec.ts     # Tests: calendar module
        └── message.spec.ts      # Tests: message module
```

## Test Data

THE system SHALL use fixture files for deterministic test data.

THE fixture files SHALL reside in `fixtures/` directory.

THE system SHALL seed test data once per file, not per test.

Each test file SHALL be responsible for seeding its own data.

## What to Test - Server

THE tests SHALL verify HTTP status codes.

THE tests SHALL verify response headers.

THE tests SHALL verify inline JSON data embedded in responses.

WHERE testing HTMX partial responses THE tests SHALL verify absence of full page layout.

WHERE testing full page responses THE tests SHALL verify presence of layout wrapper.

## What to Test - Client

THE tests SHALL verify elements are visible when expected.

THE tests SHALL verify navigation produces correct URLs.

THE tests SHALL verify keyboard interactions work correctly.

## What to Test - Visual Regression

THE system SHALL compare screenshots against baselines.

THE system SHALL allow small pixel differences for rendering variance.

WHERE new features are added that intentionally change the UI THE developer MAY update snapshots using `just playwright-update-snapshots`.

THE developer SHALL NOT update snapshots when tests fail without intentional UI changes.

WHERE snapshot tests fail THE developer SHALL investigate the cause before updating snapshots.

THE developer SHALL only update snapshots when:
- A new UI feature was added
- An existing UI component was intentionally modified
- Layout or styling was intentionally changed

THE developer SHALL NOT update snapshots when:
- Tests fail due to bugs or regressions
- No code changes were made to the UI
- The failure is unexpected or unexplained

## What to Test - Error Handling

THE tests SHALL verify error states display appropriate messages.

THE tests SHALL verify error responses use correct HTTP status codes.

## Test Execution

THE system SHALL run tests against Chromium browser.

THE system SHALL run tests sequentially.

THE system SHALL retry failed tests in CI only.

THE system SHALL capture screenshots only on failure.

THE system SHALL capture traces only on failure.

## Test Structure

THE tests SHALL group related tests together.

THE tests SHALL use descriptive names explaining expected behavior.

WHERE shared setup is needed THE system SHALL run it once per suite.

## Test Selectors

THE tests SHALL use `data-test` attributes to select elements.

THE tests SHALL NOT select elements by CSS classes or tag names.

THE tests SHALL verify success responses contain `data-test="success"`.

THE tests SHALL verify error responses contain `data-test="error"`.

WHERE specific elements need verification THE tests SHALL use descriptive `data-test` values.

## Helpers

WHERE shared logic is needed across tests THE system SHALL create helper functions.

THE helpers SHALL be pure functions.

THE helpers SHALL NOT access the database directly.
