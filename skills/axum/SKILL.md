---
name: axum
description: Build web applications with Axum framework. Use when creating HTTP servers, API endpoints, middleware, or request handlers in Rust.
---

# Axum Web Framework

## Application State

THE system SHALL define `AppState` as a `Clone` struct containing shared resources.

THE shared resources SHALL be wrapped in `Arc` for thread-safe reference counting.

WHERE mutable shared state is needed THE system SHALL wrap it in `Arc<RwLock<T>>` or `Arc<Mutex<T>>`.

THE application state SHALL be provided to the router using `.with_state()`.

Example:

```rust
#[derive(Clone)]
struct AppState {
    db_pool: SqlitePool,
    config: Arc<Config>,
}

let state = AppState {
    db_pool: pool.clone(),
    config: Arc::new(config),
};

let app = Router::new()
    .route("/", get(handler))
    .with_state(state);
```

## Error Handling

THE system SHALL implement custom error types that implement `IntoResponse`.

THE error types SHALL convert to appropriate HTTP responses.

WHERE errors need different status codes THE error type SHALL map variants to status codes.

Example:

```rust
#[derive(Debug)]
enum AppError {
    NotFound,
    DatabaseError(sqlx::Error),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            AppError::NotFound => (StatusCode::NOT_FOUND, "Not found"),
            AppError::DatabaseError(_) => (StatusCode::INTERNAL_SERVER_ERROR, "Database error"),
        };
        (status, message).into_response()
    }
}
```

## Middleware

THE system SHALL use tower middleware layers for cross-cutting concerns.

THE middleware SHALL be added using `.layer()` method.

WHERE middleware should apply to all routes THE system SHALL add it at the router level.

WHERE middleware should apply to specific routes THE system SHALL use `Router::layer()` on nested routers.

Common middleware patterns:

- Request logging
- CORS
- Compression
- Timeout
- Request ID tracking

Example:

```rust
use tower_http::{trace::TraceLayer, cors::CorsLayer};

let app = Router::new()
    .route("/", get(handler))
    .layer(TraceLayer::new_for_http())
    .layer(CorsLayer::permissive());
```

## Static File Serving

THE system SHALL serve static files using `tower_http::services::ServeDir`.

THE `ServeDir` service SHALL be mounted at appropriate routes.

THE system SHALL configure fallback handling for single-page applications if needed.

Example:

```rust
use tower_http::services::ServeDir;

let app = Router::new()
    .route("/api/users", get(list_users))
    .nest_service("/static", ServeDir::new("static"));
```

## CORS Configuration

WHERE CORS is needed THE system SHALL use `tower_http::cors::CorsLayer`.

THE CORS configuration SHALL specify allowed origins explicitly.

THE CORS configuration SHALL specify allowed methods.

THE CORS configuration SHALL specify allowed headers.

WHERE credentials are needed THE CORS SHALL enable credentials.

Example:

```rust
use tower_http::cors::{CorsLayer, Any};

let cors = CorsLayer::new()
    .allow_origin("http://localhost:3000".parse::<HeaderValue>().unwrap())
    .allow_methods([Method::GET, Method::POST])
    .allow_headers([CONTENT_TYPE, ACCEPT]);
```

## Content Security Policy

WHERE CSP is needed THE system SHALL set appropriate headers.

THE CSP SHALL restrict script sources to prevent XSS.

THE CSP SHALL restrict connection sources appropriately.

THE CSP SHALL be set as a middleware layer or in individual handlers.

Example:

```rust
let csp = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'";

// As middleware
use tower_http::set_header::SetResponseHeaderLayer;
let app = Router::new()
    .layer(SetResponseHeaderLayer::if_not_present(
        header::CONTENT_SECURITY_POLICY,
        HeaderValue::from_static(csp),
    ));
```

## Request Logging

THE system SHALL log HTTP requests using tracing middleware.

THE logs SHALL include method, path, status code, and duration.

WHERE custom logging is needed THE system SHALL use `TraceLayer` with custom configuration.

Example:

```rust
use tower_http::trace::TraceLayer;

let app = Router::new()
    .route("/", get(handler))
    .layer(TraceLayer::new_for_http());
```

## Server Binding

THE system SHALL bind the server to all network interfaces (0.0.0.0).

THE port SHALL be configurable via environment variables or configuration.

Example:

```rust
let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
let listener = tokio::net::TcpListener::bind(addr).await?;
axum::serve(listener, app).await?;
```

## Graceful Shutdown

WHERE graceful shutdown is needed THE system SHALL use `with_graceful_shutdown()`.

THE shutdown signal SHALL be handled appropriately (e.g., SIGTERM, SIGINT).

Example:

```rust
use tokio::signal;

async fn shutdown_signal() -> Result<(), std::io::Error> {
    signal::ctrl_c().await
}

axum::serve(listener, app)
    .with_graceful_shutdown(async {
        shutdown_signal().await.ok();
    })
    .await?;
```

## Server-Sent Events (SSE)

WHERE real-time streaming is needed THE system SHALL use Server-Sent Events.

THE SSE handlers SHALL return `Sse<impl Stream<Item = Result<Event, E>>>`.

THE stream SHALL send events to connected clients.

Example:

```rust
use axum::response::sse::{Event, Sse};
use futures::stream::{self, Stream};

async fn sse_handler() -> Sse<impl Stream<Item = Result<Event, Infallible>>> {
    let stream = stream::repeat_with(|| Event::default().data("hello"))
        .map(Ok);
    Sse::new(stream)
}
```

## WebSocket Support

WHERE WebSocket connections are needed THE system SHALL use `axum::extract::ws::WebSocket`.

THE WebSocket handlers SHALL upgrade HTTP connections using `WebSocketUpgrade` extractor.

Example:

```rust
use axum::extract::ws::{WebSocketUpgrade, WebSocket};

async fn ws_handler(ws: WebSocketUpgrade) -> impl IntoResponse {
    ws.on_upgrade(handle_socket)
}

async fn handle_socket(mut socket: WebSocket) {
    while let Some(msg) = socket.recv().await {
        // Handle message
    }
}
```

## Testing

THE handlers SHALL be testable without starting a server.

THE tests SHALL use `Router::into_make_service()` or direct handler invocation.

WHERE integration testing is needed THE tests SHALL start a test server.

Example:

```rust
#[tokio::test]
async fn test_handler() {
    let app = Router::new().route("/", get(handler));

    let response = app
        .oneshot(Request::builder().uri("/").body(Body::empty()).unwrap())
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
}
```

## Fallback Routes

THE system SHALL define a fallback handler.

THE fallback handler SHALL be added using `.fallback()`.

Example:

```rust
async fn not_found() -> (StatusCode, &'static str) {
    (StatusCode::NOT_FOUND, "Not found")
}

let app = Router::new()
    .route("/", get(handler))
    .fallback(not_found);
```
