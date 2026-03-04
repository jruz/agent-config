---
name: tracing
description: Instrument Rust with tracing. Use when adding tracing.
---

# Tracing

Use this skill when working with Rust tracing instrumentation for logging and observability.

## Span Naming

THE system SHALL NOT specify the `name` parameter on `#[tracing::instrument]`.

THE `#[tracing::instrument]` attribute SHALL use the function name as the span name.

THE custom tracing layer SHALL automatically extract the module path from span metadata and combine it with the function name.

## Spans

THE system SHALL use the `#[tracing::instrument]` attribute on all public async functions that perform I/O.

THE system SHALL NOT use `#[tracing::instrument]` on view rendering functions.

THE system SHALL NOT use `#[tracing::instrument]` on private helper functions that only perform in-memory calculations.

WHERE a function performs multiple distinct I/O operations THE system SHALL extract each into a separate instrumented function with a descriptive function name.

## Instrument Attribute Parameters

### Skip Parameters

THE `#[tracing::instrument]` attribute SHALL use `skip` or `skip_all` for:

- Parameters that don't implement Display
- Database pools, connections, and clients
- Sensitive information (credentials, tokens, passwords, API keys)

Example:

```rust
#[tracing::instrument(skip(pool))]
async fn fetch_data(pool: &SqlitePool, id: i64) -> Result<Data, Error> {
    // id is automatically captured, pool is skipped
}
```

### Fields

THE `#[tracing::instrument]` attribute SHALL use `fields` for:

- Computed values that will be recorded during execution (e.g., `count`, `inserted`, `total`)
- Correlation IDs for grouping related spans (e.g., `run_id`, `request_id`)

THE system SHALL NOT manually add function parameters to `fields`.

THE system SHALL rely on automatic parameter capture for all function parameters.

WHERE a correlation ID is passed as a function parameter THE system SHALL include it in `fields` using `%` format (e.g., `run_id = %run_id`).

WHERE a computed value will be recorded later THE system SHALL declare it in `fields` without assignment (e.g., `total_bars`).

THE `fields` declarations SHALL use `%` to format correlation ID values from parameters.

THE `fields` declarations SHALL use bare names for computed values (no `%` or `=`).

Examples:

Function parameters auto-capture:

```rust
#[tracing::instrument(skip(db))]
async fn fetch_bars(
    db: &SqlitePool,
    ticker: String,
    start: DateTime<Utc>,
    end: DateTime<Utc>,
) -> Result<Vec<Bar>, Error> {
    // ticker, start, end are automatically captured
}
```

Correlation ID from parameter and computed value:

```rust
#[tracing::instrument(fields(run_id = %run_id, total_bars))]
pub async fn run(run_id: &str, ticker_arg: &str) -> Result<(), Error> {
    // ticker_arg is automatically captured
    // run_id is in fields for correlation
    let mut total: u64 = 0;
    // ... work ...
    tracing::Span::current().record("total_bars", total);
    Ok(())
}
```

## Span Messages

THE system SHALL NOT manually log span start messages.

THE `#[tracing::instrument]` macro SHALL automatically log span enter.

THE system SHALL NOT manually log span completion or "end" messages.

THE `#[tracing::instrument]` macro SHALL automatically log span close with duration and recorded fields.

WHERE final computed values need to be logged THE system SHALL record them on the span using `tracing::Span::current().record("field_name", value)`.

THE system SHALL NOT use `tracing::info!()` for final results that should appear in span close.

THE recorded fields SHALL appear in the span close message.

## Progress Messages

WHERE intermediate status updates are needed during long-running operations THE system SHALL use `tracing::info!` with fields and a message.

THE progress messages MUST include fields in the log event.

THE progress messages without fields SHALL NOT be logged.

Example:

```rust
#[tracing::instrument(fields(run_id = %run_id, total_bars))]
pub async fn run(run_id: &str) -> Result<(), Error> {
    for (i, chunk) in chunks.iter().enumerate() {
        let bars = fetch_chunk(chunk).await?;
        tracing::info!(chunk = i + 1, total = chunks.len(), bars = bars.len(), "progress");
        total += bars.len() as u64;
    }
    tracing::Span::current().record("total_bars", total);
    Ok(())
}
```

## Trace ID

WHERE spans need to be grouped together THE system SHALL include a `trace_id` field to correlate related spans.

THE tracing library does not provide trace IDs automatically.

THE system SHALL generate trace IDs using the first 8 characters of a UUID v4 (32 bits, 4 billion combinations).

THE trace ID generation function SHALL be in a shared utils module.

THE tasks and HTTP request handlers SHALL use the same `trace_id` field and generation mechanism.

THE trace ID SHALL be passed as a function parameter and included in `fields` with `%` format.

THE trace ID SHALL be stored in span extensions and automatically propagated to child spans by the custom tracing layer.

Example:

```rust
// In src/utils/tracing.rs
pub fn generate_trace_id() -> String {
    Uuid::new_v4().to_string()[..8].to_string()
}

// In task or HTTP handler
#[tracing::instrument(fields(trace_id = %trace_id, total_bars))]
pub async fn run(trace_id: &str, ticker: &str) -> Result<(), Error> {
    // trace_id appears in all spans and child spans
}
```

## Log Format

THE log output SHALL follow this format for events:

```
{timestamp}  {level} [{trace_id}] {module_path}::{function}: {message} [{fields}]
```

THE log output SHALL follow this format for span close:

```
{timestamp}  {level} [{trace_id}] {module_path}::{function}{arguments}[results]: close time.busy={duration}
```

THE timestamp SHALL use ISO 8601 format with microsecond precision: `%Y-%m-%dT%H:%M:%S%.6fZ`.

THE module path SHALL show the actual module where the function is defined.

THE trace ID SHALL appear in brackets before module path when present.

THE trace ID SHALL be omitted entirely when not available (no empty brackets).

THE arguments SHALL appear in curly braces `{}` after the function name.

THE arguments SHALL be omitted entirely (no empty braces) when no argument fields are present.

THE results SHALL appear in square brackets `[]` after arguments.

THE results SHALL be omitted entirely (no empty brackets) when no fields were recorded.

THE span close messages SHALL include duration formatted as:

- Microseconds with no decimals for durations < 1ms: `842µs`
- Milliseconds with 2 decimals for durations 1ms-1s: `6.84ms`
- Seconds with 2 decimals for durations ≥ 1s: `1.03s`

### Examples

Basic span with trace_id:

```
2025-12-31T09:50:08.331644Z  INFO [abc123de] models::bar::find_by_date: close time.busy=6.84ms
```

Basic span without trace_id:

```
2025-12-31T09:29:26.737313Z  INFO utils::db::connect: close time.busy=6.86ms
```

Span with arguments and recorded results:

```
2025-12-31T10:15:22.420789Z  INFO server::controllers::import_controller::create{ticker=SPY}[parsed_bars=7800 inserted=7800]: close time.busy=297ms
```

Event with fields (progress):

```
2025-12-31T11:30:48.234567Z  INFO [abc12345] tasks::databento_historical::run: progress [chunk=1 total=5 bars=1560]
```

## Custom Layer Implementation

THE custom tracing layer SHALL implement the following hooks:

- `on_new_span`: Store start time and capture trace_id field
- `on_record`: Capture trace_id when recorded after span creation
- `on_enter`: Format and output span enter with trace_id from ancestor spans
- `on_event`: Format and output log messages with trace_id from ancestor spans
- `on_close`: Format and output span close with duration and trace_id from ancestor spans

THE custom layer SHALL store trace_id in span extensions using a wrapper type.

THE custom layer SHALL store recorded fields in span extensions for inclusion in span close messages.

THE custom layer SHALL traverse parent spans to find trace_id when not present in current span.

THE custom layer SHALL extract module path from span metadata, not from the call hierarchy.

THE duration formatting function SHALL:

- Convert duration to microseconds
- Return microseconds with no decimals if < 1000µs
- Return milliseconds with 2 decimals if < 1,000,000µs
- Return seconds with 2 decimals if ≥ 1,000,000µs

## Configuration

These configuration principles apply across languages (Rust, TypeScript, Go, etc.).

### Log Level

THE log level SHALL be controlled via environment variable, not hardcoded.

THE environment variable SHALL be the language's standard (e.g., `RUST_LOG` for Rust, `LOG_LEVEL` for Node.js).

THE log level SHALL be set in the deployment configuration (e.g., systemd unit, Docker compose, Kubernetes manifest), not in application code.

THE application SHALL NOT provide a default log level - it SHALL require the environment variable to be set.

### Output Format

THE log output SHALL be single-line per event.

THE log output SHALL include the target/module path to identify the source.

THE log output SHALL NOT include file paths or line numbers.

THE log output SHALL include span/function close events with duration.

THE log output SHALL auto-detect TTY for colors (colors on for terminal, off for systemd/log aggregators).

### What to Show

| Element               | Show | Reason                       |
| --------------------- | ---- | ---------------------------- |
| Timestamp             | Yes  | When it happened             |
| Level                 | Yes  | Severity (INFO, WARN, ERROR) |
| Target/Module         | Yes  | Where it happened            |
| Message               | Yes  | What happened                |
| Fields                | Yes  | Structured context           |
| Span close + duration | Yes  | Performance visibility       |
| File path             | No   | Noise, use target instead    |
| Line number           | No   | Noise, changes frequently    |
| Thread ID             | No   | Unless debugging concurrency |

### Rust Example

```rust
tracing_subscriber::fmt()
    .with_span_events(tracing_subscriber::fmt::format::FmtSpan::CLOSE)
    .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
    .init();
```

Set log level in deployment (systemd, Docker, etc.):

```
RUST_LOG=info
```

## Log Levels

THE system SHALL log at appropriate levels based on the nature of the event.

WHERE operations begin or complete successfully THE system SHALL log at info level.

WHERE errors occur THE system SHALL log at error level with error details and context.

THE system SHALL include relevant domain context in log messages (identifiers, timestamps, operation details).

THE system SHALL log sufficient information for debugging and tracing execution flow.

THE system SHALL NOT log excessively verbose information that creates noise.

THE system SHALL NOT log sensitive information such as credentials, tokens, or personal data.

THE system SHALL NOT log private user data.
