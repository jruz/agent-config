---
name: gleam
description: Write Gleam code. Use when working with Gleam.
---

# Gleam

Gleam is a type-safe functional language targeting Erlang/BEAM and JavaScript.

## Project Structure

```
src/app/
├── app.gleam             # Entry point: starts actors, HTTP server
├── router.gleam          # Route dispatch
├── middlewares.gleam     # Middleware stack and Context type
├── config.gleam          # Environment configuration
├── actors/
│   ├── supervisor.gleam  # Starts all actors
│   ├── thing_cache.gleam # In-memory state actor
│   └── thing_poller.gleam# Periodic data fetching actor
├── models/
│   └── thing.gleam       # Domain types
├── pages/
│   ├── layout.gleam      # HTML layout wrapper
│   └── thing.gleam       # Page view functions
├── components/
│   └── thing.gleam       # Lustre components (TEA pattern)
├── routes/
│   └── thing.gleam       # Route handlers
├── services/
│   └── api.gleam         # External API clients
└── ws/
    └── handler.gleam     # WebSocket handlers
```

## Separation of Concerns

| Layer         | Responsibility                               | Imports                    |
| ------------- | -------------------------------------------- | -------------------------- |
| `actors/`     | OTP actors for state and background work     | Models, services, config   |
| `models/`     | Domain types only                            | Nothing app-specific       |
| `pages/`      | Pure view functions returning `Element(Nil)` | Models, components, lustre |
| `components/` | Lustre components with TEA pattern           | Models, lustre             |
| `routes/`     | HTTP handlers, orchestrate data + views      | Pages, actors, layout      |
| `services/`   | External API clients                         | Config, models             |
| `ws/`         | WebSocket handlers                           | Actors, components         |

## OTP Actor Patterns

### Cache Actor (holds state)

```gleam
import gleam/erlang/process.{type Subject}
import gleam/otp/actor

const call_timeout = 5000

pub opaque type Message {
  Set(List(Item))
  Get(Subject(List(Item)))
}

type State {
  State(config: Config, items: List(Item))
}

pub fn start(config: Config) -> Result(Subject(Message), actor.StartError) {
  actor.new(State(config: config, items: []))
  |> actor.on_message(handle_message)
  |> actor.start
  |> result.map(fn(started) { started.data })
}

pub fn set(cache: Subject(Message), items: List(Item)) {
  actor.send(cache, Set(items))
}

pub fn get(cache: Subject(Message)) -> List(Item) {
  case try_call(cache, Get, call_timeout) {
    Ok(items) -> items
    Error(_) -> []
  }
}

fn try_call(
  subject: Subject(Message),
  make_request: fn(Subject(reply)) -> Message,
  timeout: Int,
) -> Result(reply, Nil) {
  let reply_subject = process.new_subject()
  process.send(subject, make_request(reply_subject))
  let selector =
    process.new_selector()
    |> process.select(reply_subject)
  process.selector_receive(selector, timeout)
}

fn handle_message(state: State, msg: Message) -> actor.Next(State, Message) {
  case msg {
    Set(items) -> actor.continue(State(..state, items: items))
    Get(reply) -> {
      process.send(reply, state.items)
      actor.continue(state)
    }
  }
}
```

### Poller Actor (periodic fetching)

```gleam
import gleam/erlang/process.{type Subject}
import gleam/otp/actor

const poll_interval_ms = 10_000

pub type Message {
  Poll
  Stop
}

type State {
  State(config: Config, cache: Subject(CacheMessage), self: Subject(Message))
}

pub fn start(
  config: Config,
  cache: Subject(CacheMessage),
) -> Result(Subject(Message), actor.StartError) {
  actor.new_with_initialiser(10_000, fn(self) {
    process.send(self, Poll)
    actor.initialised(State(config: config, cache: cache, self: self))
    |> actor.returning(self)
    |> Ok
  })
  |> actor.on_message(handle_message)
  |> actor.start
  |> result.map(fn(started) { started.data })
}

fn handle_message(state: State, msg: Message) -> actor.Next(State, Message) {
  case msg {
    Poll -> {
      fetch_and_update(state)
      schedule_poll(state.self)
      actor.continue(state)
    }
    Stop -> actor.stop()
  }
}

fn schedule_poll(self: Subject(Message)) -> Nil {
  let _ = process.send_after(self, poll_interval_ms, Poll)
  Nil
}
```

### Supervisor (starts actors)

```gleam
pub type Actors {
  Actors(cache: Subject(cache.Message))
}

pub type Error {
  CacheStartError(actor.StartError)
  PollerStartError(actor.StartError)
}

pub fn start(config: Config) -> Result(Actors, Error) {
  use cache <- try_start(cache.start(config), CacheStartError, "cache")
  use _poller <- try_start(poller.start(config, cache), PollerStartError, "poller")
  Ok(Actors(cache: cache))
}

fn try_start(
  start_result: Result(a, actor.StartError),
  wrap_error: fn(actor.StartError) -> Error,
  name: String,
  next: fn(a) -> Result(Actors, Error),
) -> Result(Actors, Error) {
  start_result
  |> result.map_error(wrap_error)
  |> result.map(fn(value) {
    logging.log(logging.Info, "Started " <> name)
    value
  })
  |> result.try(next)
}
```

## Lustre Component with Effects (TEA)

```gleam
import lustre
import lustre/effect.{type Effect}
import lustre/element.{type Element}

pub type Model {
  Model(items: List(Item), loading: Bool)
}

pub type Msg {
  UserClicked(id: String)
  DataLoaded(Result(String, Error))
}

pub fn app(items: List(Item)) {
  lustre.component(init(items), update, view, [])
}

fn init(items: List(Item)) -> fn(Nil) -> #(Model, Effect(Msg)) {
  fn(_) { #(Model(items: items, loading: False), effect.none()) }
}

fn update(model: Model, msg: Msg) -> #(Model, Effect(Msg)) {
  case msg {
    UserClicked(id) -> {
      let fetch = fn() { api.fetch_item(id) }
      #(Model(..model, loading: True), fetch_effect(fetch))
    }
    DataLoaded(result) -> {
      #(Model(..model, loading: False), effect.none())
    }
  }
}

fn fetch_effect(fetch: fn() -> Result(String, Error)) -> Effect(Msg) {
  effect.from(fn(dispatch) {
    let result = fetch()
    dispatch(DataLoaded(result))
  })
}

pub fn view(model: Model) -> Element(Msg) {
  div([], [
    table([], list.map(model.items, item_row)),
  ])
}
```

## API Client Pattern

```gleam
import gleam/http/request
import gleam/httpc
import gleam/json
import gleam/dynamic/decode.{type Decoder}

pub type Error {
  RequestError(httpc.HttpError)
  JsonError(json.DecodeError)
}

pub fn list_items(cfg: Config) -> Result(List(Item), Error) {
  let url = cfg.api_url <> "/items"
  use resp <- result.try(fetch(url))
  use items <- result.try(
    json.parse(resp.body, decode.list(item_decoder()))
    |> result.map_error(JsonError),
  )
  Ok(items)
}

fn fetch(url: String) -> Result(Response(String), Error) {
  use req <- result.try(
    request.to(url)
    |> result.map_error(fn(_) { RequestError(httpc.InvalidUtf8Response) }),
  )
  httpc.send(req) |> result.map_error(RequestError)
}

fn item_decoder() -> Decoder(Item) {
  use id <- decode.field("id", decode.string)
  use name <- decode.field("name", decode.string)
  decode.success(Item(id: id, name: name))
}
```

## Entry Point Pattern

```gleam
import gleam/erlang/process
import mist
import wisp
import wisp/wisp_mist

pub fn main() {
  wisp.configure_logger()
  case start() {
    Ok(_) -> process.sleep_forever()
    Error(msg) -> {
      io.println_error("Error: " <> msg)
      halt(1)
    }
  }
}

fn start() -> Result(Nil, String) {
  use cfg <- result.try(config.from_env())
  use actors <- result.try(start_actors(cfg))

  let ctx = Context(config: cfg, cache: actors.cache)
  let secret_key_base = wisp.random_string(64)
  let wisp_handler = wisp_mist.handler(router.handle_request(_, ctx), secret_key_base)
  let handler = combined_handler(wisp_handler, ctx)

  mist.new(handler)
  |> mist.bind("0.0.0.0")
  |> mist.port(cfg.port)
  |> mist.start
  |> result.map(fn(_) { Nil })
  |> result.map_error(fn(_) { "Failed to start server" })
}

fn combined_handler(
  wisp_handler: fn(Request(Connection)) -> Response(ResponseData),
  ctx: Context,
) -> fn(Request(Connection)) -> Response(ResponseData) {
  fn(req: Request(Connection)) {
    case request.path_segments(req) {
      ["ws", "items"] -> ws_handler.handler(req, ctx)
      _ -> wisp_handler(req)
    }
  }
}

@external(erlang, "erlang", "halt")
fn halt(code: Int) -> Nil
```

## View Patterns

### Pure View Function

```gleam
pub fn render(items: List(Item)) -> Element(Nil) {
  div([class("page")], [
    h1([], [text("Title")]),
    table([], [
      thead([], [tr([], [th([], [text("Name")])])]),
      tbody([], list.map(items, item_row)),
    ]),
  ])
}
```

### Layout Wrapper

```gleam
pub fn wrap(content: Element(Nil), page_title: String) -> String {
  html([], [
    head([], [title([], page_title)]),
    body([], [main([], [content])]),
  ])
  |> element.to_document_string
}
```

## Common Patterns

| Pattern                             | Use                       |
| ----------------------------------- | ------------------------- |
| `use x <- result.try(...)`          | Chain fallible operations |
| `use <- bool.guard(cond, default)`  | Early return on condition |
| `option.unwrap(opt, default)`       | Extract with default      |
| `list.map(items, fn)`               | Transform lists           |
| `case x { ... }`                    | Pattern matching          |
| `process.send_after(subj, ms, msg)` | Schedule delayed message  |
| `actor.continue(state)`             | Continue actor loop       |
| `actor.stop()`                      | Stop actor                |
| `effect.from(fn(dispatch) { ... })` | Create side effect        |
| `effect.none()`                     | No side effect            |

## Dependencies

Pin all dependencies to exact versions using `==` in `gleam.toml`:

```toml
[dependencies]
gleam_stdlib = "== 0.68.1"
gleam_otp = "== 1.2.0"
lustre = "== 5.5.1"
wisp = "== 2.1.0"

[dev-dependencies]
gleeunit = "== 1.9.0"
```

Avoid version ranges (`>= x.y.z and < x.y.z`) and approximate versions (`~> x.y`).

## Linter Configuration

See the checks skill for Gleam linting recipes and configuration.

## Justfile Recipes

Reference: [justfile](mdc:justfile)

## Nix Flake

Reference: [flake.nix](mdc:flake.nix)
