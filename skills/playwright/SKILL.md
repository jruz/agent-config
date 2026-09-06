---
name: playwright
description: Write Playwright E2E tests. Use when creating integration tests or debugging test failures.
---

# Playwright Testing

## Package Manager

THE system SHALL use `pnpm` for Playwright projects (available via the Nix devShell flake in dotfiles).

THE system SHALL NOT use `npm`, `yarn`, or `bun` for Playwright projects.

## Installation

Merge these files into the project:

- [flake.nix](flake.nix) — Nix provides browsers, npm provides `@playwright/test`
- [package.json](package.json) — `@playwright/test` version SHALL match `nix eval nixpkgs#playwright-driver.version --raw`
- [playwright.config.ts](playwright.config.ts)
- [fixtures.ts](fixtures.ts) → `playwright/fixtures.ts`
- [load-test-env.nu](load-test-env.nu)
- [justfile](justfile) — merge recipes into project justfile
- [gitignore-additions.txt](gitignore-additions.txt) — merge into `.gitignore`
- [scripts/log.ts](scripts/log.ts)

THE test environment SHALL use `.env.test` with a different port than development.

## HTTP Test Hostnames

WHEN Chromium tests use an HTTP service, THE service SHALL NOT use `app` as its hostname.

Chromium reads `app` as the HSTS-preloaded `.app` name. It changes `http://app` to `https://app`.

The Playwright error is `page.goto: net::ERR_SSL_PROTOCOL_ERROR`. A trace shows a `307 Internal Redirect` with `Non-Authoritative-Reason: HSTS`.

THE HTTP service SHOULD use a name such as `web`.

## Test Isolation

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

## Fixtures

THE test files SHALL import `test` from `./fixtures` or `../fixtures` instead of `@playwright/test`.

THE test files SHALL import `expect` from `@playwright/test`.

## File Organization

THE test files SHALL reside in `playwright/` directory with `.spec.ts` suffix.

THE helper functions SHALL reside in `playwright/helpers/`.

THE screenshot baselines SHALL reside in `playwright/screenshots/`.

## Subdirectory Organization

THE server tests SHALL be organized by route in `server/`, mirroring the handler structure.

THE client tests SHALL be organized by view in `client/`.

WHERE a view has multiple test files THE client tests SHALL reside in a folder named after the route.

WHERE a module is used across multiple views THE module tests SHALL reside in the view folder where they are primarily used.

## Test Data

THE system SHALL use fixture files for deterministic test data.

THE fixture files SHALL reside in `fixtures/` directory.

THE system SHALL seed test data once per file, not per test.

Each test file SHALL be responsible for seeding its own data.

## What to Test - Server

THE tests SHALL verify HTTP status codes.

THE tests SHALL verify response headers.

THE tests SHALL verify redirects return correct status codes and Location headers.

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

## Test Structure

THE tests SHALL group related tests together.

THE tests SHALL use descriptive names explaining expected behavior.

WHERE shared setup is needed THE system SHALL run it once per suite.

## Helpers

WHERE shared logic is needed across tests THE system SHALL create helper functions.

THE helpers SHALL be pure functions.

THE helpers SHALL NOT access the database directly.
