---
name: sqlx
description: Write SQLx database queries and manage database operations. Use when writing database queries, working with SQLite/PostgreSQL/MySQL, handling migrations, or managing database connections.
---

# SQLx Specification

## Overview

This specification defines patterns for using SQLx for compile-time verified database queries in Rust.

## Query Macros

THE system SHALL use compile-time checked query macros for all database operations.

THE system SHALL use `query!()` macro for queries that don't return typed results.

THE system SHALL use `query_as!()` macro for queries returning typed results.

THE system SHALL NOT use runtime-only methods without the macro (runtime `query()` or `query_as()`).

Example:

```rust
let records = query_as!(
    Record,
    "SELECT id, name, created_at
     FROM records
     WHERE name = ? AND created_at >= ?
     ORDER BY created_at ASC",
    name,
    start_date
)
.fetch_all(pool)
.await?;
```

## Parameter Binding

THE system SHALL use parameter binding for all dynamic values.

THE system SHALL NOT construct SQL with string interpolation.

THE queries SHALL bind parameters using the database-specific placeholder syntax.

THE system SHALL rely on SQLx's compile-time verification to prevent SQL injection.

## Connection Management

THE system SHALL use connection pools for production code.

THE system SHALL pass pool references (`&Pool`) as parameters to database functions.

THE system SHALL NOT create individual connections except in tests.

THE connection pool SHALL be configured with appropriate `max_connections` limit.

## Offline Mode and Compile-Time Verification

THE system SHALL use offline mode for compile-time query verification without requiring a live database connection.

WHERE queries are modified THE developer SHALL run prepare commands to update offline query data.

THE system SHALL version control the offline query data directory for CI/CD compatibility.

WHERE test queries need verification THE developer SHALL include test code in prepare operations.

## Migrations

THE system SHALL use SQLx migrations for database schema changes.

WHERE database schema changes are required THE developer SHALL create a new migration file.

THE migration files SHALL be named with timestamp prefixes in the format `<YYYYMMDDHHMMSS>_<description>.sql`.

THE migrations SHALL be applied automatically on application startup or via migration commands.

## Transaction Management

THE system SHALL use transactions for operations requiring multiple database modifications.

THE transaction pattern SHALL follow: BEGIN transaction, execute operations, COMMIT on success, ROLLBACK on error.

### Transaction Lifecycle

THE transactions SHALL be started with `let mut transaction = pool.begin().await?`.

THE transactions SHALL be committed explicitly with `transaction.commit().await?` to persist changes.

THE transactions SHALL automatically rollback when dropped without explicit commit.

WHERE explicit rollback is needed THE system SHALL call `transaction.rollback().await?`.

### Transaction Execution

THE queries within transactions SHALL be executed using the transaction object as executor.

WHERE queries need the transaction as executor THE system SHALL dereference appropriately (e.g., `&mut *transaction`).

THE changes within uncommitted transactions SHALL remain invisible to other connections.

### Transaction Error Handling

WHERE an error occurs during transaction operations THE transaction SHALL be allowed to drop for automatic rollback.

THE functions using transactions SHALL return errors immediately using `?` operator for automatic rollback.

WHERE cleanup is needed before rollback THE system SHALL explicitly call `rollback().await?` in error paths.

## Batch Operations

WHERE inserting multiple records THE system SHALL use batch insertion patterns.

WHERE batches exceed parameter limits THE system SHALL chunk large batches appropriately.

THE batch insertion SHALL handle conflicts gracefully using conflict resolution clauses.

THE batch insertion SHALL return the number of affected rows.

WHERE dynamic SQL is required for variable-length inserts THE system SHALL use `QueryBuilder` for type-safe dynamic query construction.

## SQL Injection Prevention

THE queries SHALL use only string literals or concatenation of string literals.

THE queries SHALL NOT use dynamic SQL or string interpolation to construct query text.

WHERE parameters are needed THE query SHALL use bind syntax rather than string concatenation.

## Query Functions

THE models SHALL define database operations as standalone functions taking pool reference as first parameter.

THE models SHALL NOT use `impl` blocks for database operations.

THE query functions SHALL be async and return `Result<T, sqlx::Error>`.

Example:

```rust
pub async fn find_by_id(pool: &SqlitePool, id: i64) -> Result<Record, sqlx::Error> {
    query_as!(
        Record,
        "SELECT id, name, created_at FROM records WHERE id = ?",
        id
    )
    .fetch_one(pool)
    .await
}
```

## NULL Handling

WHERE nullable values are needed THE query function SHALL accept `Option<T>` parameters.

THE queries SHALL use `IS NULL` or `IS NOT NULL` for null comparisons in WHERE clauses.

THE queries SHALL NOT use equality operators (equals or not-equals) to compare with NULL values.

WHERE a field might be NULL in results THE model field SHALL use `Option<T>` type.

## Type Mapping

THE system SHALL use appropriate database type mappings for Rust types.

WHERE database column names differ from Rust field names THE system SHALL use appropriate attribute syntax for mapping.

THE system SHALL use UTC timestamps for all time fields.

## Error Handling

THE database functions SHALL return `Result<T, sqlx::Error>` for all database operations.

THE system SHALL NOT unwrap or expect database operation results.

WHERE specific error types need handling THE system SHALL match on `sqlx::Error` variants.

THE system SHALL propagate errors using the `?` operator.

THE domain models SHALL use `Result<T, sqlx::Error>` for database operations.

## Operation Verification

WHERE UPDATE or DELETE operations need verification THE system SHALL check `rows_affected()` on the query result.

THE functions SHALL return appropriate status based on `rows_affected()` value.

WHERE no rows are affected by an UPDATE or DELETE THE function SHALL handle it as a valid case.

## Insert ID Retrieval

WHERE the generated ID is needed after insert THE system SHALL query the last insert ID.

THE insert query SHALL execute and then query last insert ID within the same transaction or connection.

## Prepared Statements

THE system SHALL rely on SQLx's automatic statement preparation and caching.

THE prepared statements SHALL provide performance benefits through query plan caching.

WHERE prepared statements are not suitable THE system SHALL use unprepared query methods.

## Testing

THE tests SHALL use in-memory databases for integration testing.

THE tests SHALL run migrations before executing test queries.

THE tests SHALL clean up test data after each test to prevent test pollution.

## Database-Specific Features

### SQLite

WHERE SQLite extensions are needed THE system SHALL load them at runtime.

THE system SHALL configure SQLite-specific settings using PRAGMA statements where needed.

THE PRAGMA statements SHALL use unprepared query methods.

### PostgreSQL

WHERE PostgreSQL-specific features are needed THE system SHALL use appropriate syntax and types.

#### Connection

THE connection string SHALL use format: `postgresql://[user[:password]@][host][:port]/database`.

THE system SHALL use `sqlx database create` and `sqlx database drop` for database lifecycle management.

#### Query Syntax

THE system SHALL use positional parameter syntax (`$1`, `$2`, `$3`) for query placeholders.

THE system SHALL use `INSERT ... ON CONFLICT DO NOTHING` for upsert operations.

THE system SHALL use `floor(extract(epoch from now()))` for Unix timestamp generation.

THE queries SHALL use double-quoted identifiers (`"column_name"`) for type overrides in SQLx macros.

#### Type Mappings

THE system SHALL use the following type mappings:
- `i64` for `BIGSERIAL` and `BIGINT` (primary keys, timestamps)
- `f64` for `DOUBLE PRECISION` (prices, volumes)
- `TEXT` for `String` and string-based enums

#### Parameter Limits

THE system SHALL respect PostgreSQL's parameter limit of 65,535 parameters per query.

WHERE batch inserts are needed THE system SHALL chunk data to stay within reasonable parameter counts (recommended: 5,000 parameters).

THE system SHALL calculate batch size as `MAX_PARAMS / PARAMS_PER_ROW` to respect limits.

#### Offline Mode

THE system SHALL set `SQLX_OFFLINE=true` environment variable to enable offline compilation.

THE system SHALL run `cargo sqlx prepare -- --all-targets` to generate `.sqlx/` metadata after query changes.

THE `.sqlx/` directory SHALL be committed to version control for CI/CD compatibility.

THE `.sqlx/` JSON files SHALL be formatted before committing.

### MySQL

WHERE MySQL-specific features are needed THE system SHALL use appropriate syntax and types.

THE system SHALL use MySQL parameter syntax (`?`) for bindings.

## Environment Variables

THE system SHALL use environment variables for database connection configuration.

WHERE compile-time verification is needed THE developer SHALL ensure environment variables point to valid databases with current schema.

THE system SHALL use different configuration values for different environments.
