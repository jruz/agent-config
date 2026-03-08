---
name: rust
description: Write Rust code. Use when writing Rust.
---

# Rust Specification

## Overview

This specification defines Rust-specific patterns and requirements for writing robust, maintainable Rust code.

## Project Initialization

THE system SHALL create a `flake.nix` from the template at `skills/rust/flake.nix`.

THE system SHALL create a `.envrc` file from `skills/rust/envrc` for direnv integration.

THE `.gitignore` SHALL include direnv entries from `skills/rust/gitignore-additions.txt`.

AFTER creating files THE system SHALL run `git add flake.nix flake.lock rust-toolchain.toml` so the nix flake can read them.

AFTER staging flake files THE system SHALL run `direnv allow` to activate the devshell.

## Code Paradigm: Functional Only

THE system SHALL use pure functions for ALL logic.

THE system SHALL NEVER define traits.

THE system SHALL NEVER implement traits (except for required derives).

THE system SHALL NEVER use `impl` blocks for custom methods on structs or enums.

THE system SHALL NEVER use object-oriented patterns (inheritance, polymorphism via traits, method chaining on custom types).

THE system SHALL pass data explicitly through function parameters.

THE system SHALL return data explicitly from functions.

THE system SHALL use structs and enums ONLY as data containers, NEVER with associated methods.

WHERE behavior is needed THE system SHALL write a free function that takes the data as a parameter.

WHERE multiple related functions exist THE system SHALL organize them in a module, NOT as methods on a type.

THE system SHALL treat all types as plain data structures.

Example (correct - functional style):

```rust
pub struct User {
    pub id: i64,
    pub name: String,
    pub email: String,
}

pub fn create_user(name: String, email: String) -> User {
    User { id: 0, name, email }
}

pub fn validate_email(user: &User) -> bool {
    user.email.contains('@')
}

pub fn format_display_name(user: &User) -> String {
    format!("{} <{}>", user.name, user.email)
}
```

Example (incorrect - object-oriented style, NEVER do this):

```rust
pub struct User {
    id: i64,
    name: String,
    email: String,
}

impl User {
    pub fn new(name: String, email: String) -> Self {
        Self { id: 0, name, email }
    }

    pub fn validate_email(&self) -> bool {
        self.email.contains('@')
    }

    pub fn display_name(&self) -> String {
        format!("{} <{}>", self.name, self.email)
    }
}
```

## Rust Version Configuration

THE project SHALL contain a `rust-toolchain.toml` file in the project root.

THE `rust-toolchain.toml` file SHALL specify the exact Rust version channel.

THE toolchain configuration SHALL use a pinned version number, not channel names like "stable" or "nightly".

WHERE the project targets unconventional platforms THE `rust-toolchain.toml` SHALL declare explicit targets.

THE toolchain configuration template is available at `skills/rust/rust-toolchain.toml`.

WHERE the project targets unconventional platforms THE toolchain SHALL declare explicit targets:

```toml
[toolchain]
channel = "1.93.0"
targets = ["wasm32-wasip1"]
```

## Error Handling

All errors must be raised, never hidden. Never provide defaults or failsafes.

### What NOT to Do

THE system SHALL NOT use `.unwrap()`, `.expect()`, or `panic!()`.

THE system SHALL NOT use `.ok()` to discard error information.

THE system SHALL NOT use `.unwrap_or()`, `.unwrap_or_default()`, or `.unwrap_or_else()` to provide defaults.

THE system SHALL NOT use indexing operations that may panic.

THE system SHALL NOT provide default values when a Result is Err.

THE system SHALL NOT implement methods on error types for business logic.

### What to Do

THE system SHALL add `thiserror` crate to `Cargo.toml` dependencies.

THE system SHALL use `Result<T, E>` for all fallible operations where E is a module-specific Error enum.

THE system SHALL propagate errors using the `?` operator.

THE system SHALL define one `Error` enum per module.

THE error enum SHALL use `#[derive(Error, Debug)]`.

THE error enum SHALL ALWAYS be named `Error`, never `DatabaseError`, `ParserError`, etc.

THE module path SHALL disambiguate error types (e.g., `parser::Error`, `database::Error`).

WHERE defining custom errors THE system SHALL use `#[error("message")]`.

WHERE error messages need data THE system SHALL use field interpolation with `{0}` or `{field_name}`.

WHERE wrapping external errors THE system SHALL NOT use `{0}` interpolation for the wrapped error.

WHERE external errors have a 1:1 mapping to error variants THE system SHALL use `#[from]` for automatic conversion.

THE `#[from]` attribute implies `#[source]`, so both attributes SHALL NOT be used together.

WHERE external errors need categorization THE system SHALL use `#[source]` alone (without `#[from]`) and match statements to inspect and categorize errors.

THE system SHALL NOT use `.map_err()` for error conversion.

WHERE a variant is a 1:1 wrapper with `#[from]` THE system SHALL use `#[error(transparent)]` to avoid redundant error messages.

WHERE a variant adds context (file path, operation name, etc.) THE system SHALL NOT use `#[error(transparent)]`.

### Error Handling Examples

Example (1:1 mapping - automatic conversion with transparent):

```rust
#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Database(#[from] sqlx::Error),

    #[error(transparent)]
    TimeConversion(#[from] time_conversion::Error),
}

// Usage: ? operator automatically converts
let result = sqlx_call().await?;  // Converts sqlx::Error to Error::Database
```

Example (categorization with match):

```rust
#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("API error")]
    Api(#[source] external::Error),

    #[error("Rate limit exceeded")]
    RateLimit(#[source] external::Error),

    #[error("Not found")]
    NotFound(#[source] external::Error),
}

// Usage: inspect and categorize with match
let value = match external_call().await {
    Ok(v) => v,
    Err(e) if e.is_rate_limit() => return Err(Error::RateLimit(e)),
    Err(e) if e.is_not_found() => return Err(Error::NotFound(e)),
    Err(e) => return Err(Error::Api(e)),
};
```

## Option Type Handling

THE system SHALL NOT use `unwrap_or()`, `unwrap_or_default()`, or `unwrap_or_else()`.

THE system SHALL NOT provide default values for None cases.

THE system SHALL use pattern matching with `if let` or `match` for explicit handling.

THE system SHALL use `.ok_or_else()` to convert `Option` to `Result` with descriptive errors.

THE system SHALL use `let Some(value) = option else { return Err(...) }` for early returns.

THE system SHALL use `.and_then()` for chaining optional operations.

WHERE an Option is None THE system SHALL return an error, never provide a default value.

## Environment Variables

THE system SHALL NEVER provide default values for environment variables.

WHERE an environment variable is missing THE application SHALL fail with an error naming the missing variable.

## Ownership and Borrowing

THE system SHALL prefer borrowing over cloning for function parameters.

THE system SHALL use `&` for immutable references where possible.

THE system SHALL use `&mut` only when mutation is necessary.

WHERE ownership transfer is needed THE system SHALL document the rationale.

WHERE expensive clones occur THE system SHALL justify their necessity.

THE system SHALL NOT use `.clone()` as a quick fix for borrow checker errors.

## Type System

THE system SHALL use enum types for states and variants.

THE system SHALL derive `Debug`, `Clone`, `Copy` where appropriate.

THE system SHALL use `#[derive(Serialize, Deserialize)]` for API types.

WHERE enums represent database values THE system SHALL use `sqlx::Type` derivation.

WHERE enums need string conversion THE system SHALL use `strum` crate with `Display` and `EnumString`.

THE system SHALL use newtype patterns for domain types with validation.

Example (derive syntax):

```rust
#[derive(
    Debug,
    Clone,
    Copy,
    PartialEq,
    Eq,
    serde::Serialize,
    serde::Deserialize,
    strum::Display,
    strum::EnumString,
    sqlx::Type,
)]
#[sqlx(type_name = "TEXT")]
#[strum(serialize_all = "SCREAMING_SNAKE_CASE")]
pub enum Timeframe {
    #[strum(serialize = "1m")]
    OneMinute,
    #[strum(serialize = "5m")]
    FiveMinutes,
}
```

## Type Annotations

THE system SHALL use explicit type annotations instead of type suffixes on literals.

```rust
let count: u64 = 0;
let price: f64 = 100.0;
```

THE system SHALL NOT use type suffixes on literals.

```rust
let count = 0u64;
let price = 100.0f64;
```

## Pattern Matching

THE system SHALL use exhaustive pattern matching with `match`.

THE system SHALL handle all enum variants explicitly.

THE system SHALL use guards in match arms for conditional logic.

THE system SHALL prefer `if let` for single-variant matching.

WHERE early returns simplify logic THE system SHALL use guard clauses.

## Async/Await

THE system SHALL use `async fn` for all I/O operations.

THE system SHALL use `tokio` runtime for async execution.

THE system SHALL use `.await?` for error propagation in async contexts.

THE system SHALL NOT block the async runtime with synchronous operations.

WHERE concurrent operations are needed THE system SHALL use `tokio::spawn`.

WHERE shared state is needed THE system SHALL use `Arc<RwLock<T>>` or `Arc<Mutex<T>>`.

THE system SHALL prefer `RwLock` for read-heavy workloads.

WHERE multiple consumers need the same events THE system SHALL use `tokio::sync::broadcast`.

WHERE broadcast channels are used THE system SHALL track active subscriber count.

WHERE subscriber count reaches zero THE system SHALL stop the producer task and clean up the channel.

THE system SHALL NOT silently drop messages when consumers lag behind.

WHERE consumers lag behind THE system SHALL either log the dropped messages or notify the consumer.

## Tracing

THE system SHALL use `#[tracing::instrument]` for observability on public async I/O functions.

For span naming, fields, skip parameters, and log format conventions see the `tracing` skill.

## Import Statements

THE system SHALL NOT use wildcard imports (`*`) under any circumstances.

THE system SHALL NOT import `prelude::*` from any crate.

THE developer SHALL NOT use convenience preludes that obscure the origin of types and functions.

WHERE a crate provides a prelude THE system SHALL import specific items from their source modules instead.

THE system SHALL use namespace prefixes for all function calls and types from external modules.

THE system SHALL NOT use bare functions or types unless declared in the same file.

THE system SHALL import module namespaces, not individual items.

THE namespace SHALL be 1-2 levels deep for readability.

THE system SHALL use fully qualified paths in derive attributes.

WHERE traits must be in scope THE system SHALL import them directly.

WHERE a project has core domain types used throughout the application THE system SHALL define them in a dedicated types module.

THE core domain types module SHALL contain fundamental types that form the application's domain model.

THE system MAY import types directly from the core types module as an exception to the namespace import rule.

Example (namespace-prefixed imports):

```rust
use chrono;
use std::str::FromStr;
use tokio::time;
use tracing;

use crate::models::bar;
use crate::models::types::{Source, Ticker, Timeframe};
use crate::services::connector;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("Failed to fetch data: {0}")]
    FetchFailed(connector::Error),
}

#[tracing::instrument(name = "example")]
pub async fn run() -> chrono::DateTime<chrono::Utc> {
    tracing::info!("Starting");
    time::sleep(std::time::Duration::from_secs(1)).await;
    connector::fetch_data().await
}
```

THE system SHALL NOT import individual functions or types:

```rust
use chrono::{DateTime, Utc};
use tokio::time::sleep;
use tracing::info;
use crate::services::connector::Error;
```

## Module Organization

THE system SHALL organize modules by feature in `src/` directory.

THE system SHALL create a `mod.rs` file that contains only module declarations.

THE `mod.rs` files SHALL contain only `pub mod` and `mod` declarations.

THE `mod.rs` files SHALL NOT contain any implementation code.

WHERE module implementation is needed THE system SHALL create separate files for the implementation.

THE system SHALL keep private implementation details unexported.

WHERE modules grow large THE system SHALL split by feature boundaries.

THE system SHALL co-locate tests with implementation in `#[cfg(test)]` modules.

Example (mod.rs structure):

```rust
mod controllers;
mod views;

pub mod main;
pub mod state;
```

WHERE a module folder contains only one implementation file THE system SHALL place all code directly in `mod.rs`.

WHERE a module folder contains multiple implementation files THE system SHALL use descriptive names for each file and declare them in `mod.rs`.

THE system SHALL NOT create a submodule with the same name as its containing module to avoid `module_inception` Clippy warnings.

Example of single file module (correct):

```
calendar/
├── mod.rs              # Contains all implementation code
└── calendar.scss       # Styles
```

Example of module inception (incorrect - triggers Clippy warning):

```
calendar/
├── mod.rs              # Just declares: mod calendar;
├── calendar.rs         # Implementation
└── calendar.scss
```

Example of multi-file module (correct):

```
chart/
├── mod.rs              # Declares: pub mod renderer; pub mod state;
├── renderer.rs         # Rendering logic
├── state.rs            # State management
└── chart.scss
```

## Testing

THE system SHALL write unit tests in `#[cfg(test)]` modules.

THE system SHALL use `#[tokio::test]` for async tests.

WHERE time-dependent async logic is tested THE system SHALL use `#[tokio::test(start_paused = true)]` to enable time mocking.

THE system SHALL use in-memory SQLite (`:memory:`) for database tests.

THE system SHALL use guard clauses with `if let` chains for test setup.

WHERE floating-point comparisons are needed THE system SHALL use epsilon comparison.

WHEN `expect_used` is needed in test code, THE developer MAY use `#[allow(clippy::expect_used)]` within `#[cfg(test)]` modules only.

### Imports in Tests

THE system SHALL use fully qualified paths for external crate traits in derive attributes.

THE system SHALL write `#[derive(sqlx::Type)]` not `#[derive(Type)]`.

THE system SHALL write `#[derive(serde::Serialize)]` not `#[derive(Serialize)]` etc.

WHERE traits are from std THE system SHALL use short form (Debug, Clone, Copy, PartialEq, Eq).

THE fully qualified path requirement SHALL make it immediately clear which crate each derive trait comes from.

## Linting Configuration

THE project SHALL enforce strict linting using the `[lints]` table in `Cargo.toml`.

THE linting configuration template is available at `skills/rust/Cargo.toml`.

WHERE a project requires additional allows THE developer SHALL add them with a comment explaining the reason.

THE developer SHALL NOT use `#[allow(...)]` attributes in code to bypass linting.

WHERE linting errors occur THE developer SHALL refactor code to satisfy the linter.

THE system SHALL integrate linting into CI pipeline.

WHERE the project uses sqlx THE `rust-check` recipe SHALL also run `db-check` before clippy.

## Just Recipes

THE project SHALL contain a `justfile` with Rust development recipes.

THE justfile template is available at `skills/rust/justfile`.

This template contains all Rust recipes: build, check, clippy, fmt-check, fmt-fix, fix, test, install, outdated, upgrade.

## Serialization

THE system SHALL use `serde` for JSON serialization.

THE system SHALL derive `Serialize` and `Deserialize` for API types.

THE system SHALL use `#[serde(skip)]` for fields not in JSON output.

THE system SHALL use `#[serde(rename = "...")]` for field name mapping.

THE system SHALL use `#[serde(tag = "type")]` for tagged enum serialization.

## Type Conversions

THE system SHALL use `TryFrom` for fallible conversions.

THE system SHALL use `From` for infallible conversions.

THE system SHALL use `.parse()` with error handling for string parsing.

THE system SHALL NOT use `as` casting for numeric types without justification.

WHERE precision loss is possible THE system SHALL use `try_from` and handle errors.

## Conditional Compilation

THE system SHALL use `#[cfg(test)]` for test modules.

WHERE dead code is intentional THE system SHALL use `#[allow(dead_code)]` at module level only.

WHERE items are unused during development THE developer SHALL remove them or justify their presence.

## Dependencies

THE system SHALL use the latest stable version of crates when adding dependencies.

WHERE new dependencies are added THE developer SHALL check crates.io for the current version.

THE system SHALL pin dependency versions in `Cargo.toml`.

WHERE new dependencies are added THE developer SHALL verify they are necessary.

THE system SHALL prefer pure Rust crates over FFI bindings where possible.

THE system SHALL use feature flags to minimize compilation time.
