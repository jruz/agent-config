---
name: database
description: Manage database connections, migrations, and lifecycle. Use when working with database setup, migrations, connection pools, or database naming conventions.
---

# Database Management

## Connection Management

THE system SHALL create a connection pool once at application startup.

THE connection pool SHALL be stored in application state and reused across all requests.

THE connection pool SHALL be passed as a parameter to database functions.

THE database functions SHALL NOT create or store their own connection pools.

## Environment Variables

THE system SHALL require `DATABASE_URL` environment variable for database connections.

THE system SHALL use different `DATABASE_URL` values for different environments (dev, test, production).

## Schema Migrations

THE system SHALL use migration files for database schema changes.

WHERE database schema changes are required THE developer SHALL create a new migration file in `migrations/`.

THE system SHALL apply migrations automatically on server startup.

THE system SHALL name migration files with timestamp prefixes in the format `<YYYYMMDDHHMMSS>_<description>.sql`.

THE migration files SHALL contain SQL DDL statements for schema changes.

THE system SHALL track which migrations have been applied to prevent duplicate execution.

## Fixtures

WHERE test data or seed data is required THE system SHALL define fixtures.

THE system SHALL keep fixtures separate from migrations.

THE system SHALL NOT use migrations to insert test or seed data.

## Database Naming Convention

THE system SHALL use a database-per-worktree pattern for development isolation.

THE database names SHALL follow the pattern `PROJECT_BRANCH_NAME` for development databases.

THE database names SHALL follow the pattern `PROJECT_BRANCH_NAME_test` for test databases.

THE branch names SHALL be sanitized: lowercase with hyphens converted to underscores.

WHERE a worktree is on branch `feature-foo-bar` THE databases SHALL be named `myapp_feature_foo_bar` and `myapp_feature_foo_bar_test`.

THE system SHALL NOT version control database contents.

## Database Lifecycle Management

THE system SHALL create databases automatically when worktrees are created.

THE system SHALL drop databases automatically when worktrees are deleted.

THE system SHALL provide a `just db-create` recipe for manual database creation.

THE system SHALL provide a `just db-drop` recipe for manual database deletion.

THE system SHALL provide a `just db-migrate` recipe for running migrations.

THE system SHALL provide a `just db-reset` recipe for resetting migrations.

## Tracing and Instrumentation

THE system SHALL instrument all database operations for observability.

THE database model functions SHALL use `#[tracing::instrument]` attribute.

THE `#[instrument]` attribute SHALL skip database pools and connections using the `skip` parameter.

WHERE database operations have countable results THE system SHALL record relevant metrics as span fields.

THE common database span fields SHALL include:
- `count` - number of items in collection parameters (e.g., `users.len()`)
- `inserted` - number of rows inserted
- `updated` - number of rows updated
- `deleted` - number of rows deleted
- `skipped` - number of rows skipped (e.g., due to conflicts)
- `rows_affected` - total rows affected by operation

WHERE batch operations are performed THE system SHALL record both attempted and successful counts.

THE span naming SHALL follow the pattern `models::entity::operation`.

THE instrumentation patterns SHALL follow the tracing skill for general tracing guidance.

## Error Handling

THE database functions SHALL return result types indicating success or failure for all database operations.
