---
name: Maud
description: Write Maud templates with semantic HTML, accessibility, and Rust integration
---

# Maud

Use this skill when writing Maud templates for HTML generation in Rust.

## Imports

THE view file SHALL import `Markup` and `html` from the `maud` crate.

WHERE raw HTML or JSON is embedded THE view file SHALL use `maud::PreEscaped`.

## Basic Syntax

THE view SHALL use the `html! { }` macro to generate markup.

THE view SHALL use element names directly without angle brackets.

THE view SHALL use attributes with the pattern `attribute="value"` or `attribute=(expression)`.

## HTML5 Standard

THE view SHALL always generate HTML5-compliant markup.

THE view SHALL use HTML5 semantic elements and attributes.

## Semantic HTML

THE view SHALL use semantic HTML5 tags that convey meaning.

THE view SHALL use the minimum number of tags needed to correctly separate concerns.

THE view SHALL NOT add elements solely to achieve styling outcomes.

WHERE styling requires structure THE view SHALL use CSS to achieve the desired layout and appearance.

## Content Interpolation

WHERE static text is rendered THE view SHALL use string literals in braces.

WHERE dynamic content is rendered THE view SHALL use parentheses to interpolate Rust expressions.

Example:
```rust
html! {
    h1 { "Static Title" }
    p { (user.name) }
    p { (format!("{} items", count)) }
}
```

## Attributes

WHERE attributes have static values THE view SHALL use quoted strings.

WHERE attributes have dynamic values THE view SHALL use parentheses without quotes.

WHERE class attributes combine static and dynamic values THE view SHALL use parentheses with Rust string operations.

Example:
```rust
html! {
    div class="card" {
        div class=(format!("status {}", status)) {
            p id=(element_id) { "Content" }
        }
    }
}
```

## Self-Closing Tags

WHERE self-closing HTML elements are used THE view SHALL terminate them with a semicolon.

Example:
```rust
html! {
    input type="text" name="username";
    br;
    img src="/logo.png" alt="Logo";
}
```

## Control Flow

WHERE conditional rendering is needed THE view SHALL use `@if`, `@else if`, and `@else`.

WHERE iteration is needed THE view SHALL use `@for`.

WHERE local variables are needed THE view SHALL use `@let`.

Example:
```rust
html! {
    @if user.is_admin {
        button { "Admin Panel" }
    } @else {
        p { "Access denied" }
    }

    @for item in &items {
        li { (item.name) }
    }

    @let total = items.len();
    p { "Total: " (total) }
}
```

## Component Functions

WHERE reusable markup patterns exist THE view SHALL define helper functions that return `Markup`.

THE helper function SHALL accept parameters for dynamic content.

THE helper function SHALL use the same `html! { }` macro.

Example:
```rust
fn card(title: &str, content: &str) -> Markup {
    html! {
        div class="card" {
            h3 { (title) }
            p { (content) }
        }
    }
}

fn render_page() -> Markup {
    html! {
        div {
            (card("Welcome", "Hello World"))
            (card("Info", "More details"))
        }
    }
}
```

## PreEscaped Content

WHERE JSON data is embedded for client-side use THE view SHALL use `maud::PreEscaped` to prevent HTML escaping.

THE view SHALL NOT use `PreEscaped` for any purpose other than embedding safe, non-user-generated content.

THE view SHALL never use `PreEscaped` with user-generated content.

Example:
```rust
html! {
    script {
        (PreEscaped(format!("const data = {};", json_string)))
    }
}
```

## Accessibility

WHERE interactive elements are used THE view SHALL include appropriate ARIA attributes.

WHERE status messages are displayed THE view SHALL use `role="status"` or `role="alert"`.

WHERE live regions are needed THE view SHALL use `aria-live` and `aria-atomic`.

Example:
```rust
html! {
    div role="status" aria-live="polite" {
        "Processing complete"
    }

    button aria-label="Close dialog" {
        "×"
    }
}
```

## Data Attributes

WHERE JavaScript needs to identify elements THE view SHALL use `id` attributes.

WHERE test automation needs to identify elements THE view SHALL use `data-test` attributes.

WHERE custom data is needed THE view SHALL use standard HTML5 `data-*` attributes.

Example:
```rust
html! {
    button id="submit-btn" data-test="submit-button" data-action="save" {
        "Submit"
    }
}
```

## Best Practices

THE view SHALL keep markup structure flat and readable.

WHERE nesting becomes deep THE view SHALL extract helper functions.

THE view SHALL use meaningful variable names for interpolated content.

THE view SHALL format multiline attributes for readability.

## References

- Maud Documentation: https://maud.lambda.xyz/
