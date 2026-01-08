---
name: problem-modeling
description: Analyze and structure problems before implementation. Use when starting a new feature to understand the domain, identify types, states, and failure modes before writing code.
---

# Problem Modeling

## Overview

This skill defines how to analyze and structure a problem before implementation. Use this first when starting a new feature to ensure you understand the domain before writing code.

## When to Apply

BEFORE implementing a feature THE developer SHALL complete the problem modeling steps.

WHERE a feature touches multiple entities or has complex state THE developer SHALL document the model before coding.

WHERE a feature is trivial (single function, no state) THE developer MAY skip formal modeling.

## Step 1: Identify the Nouns

THE developer SHALL list all domain concepts (nouns) mentioned in the requirement.

THE developer SHALL classify each noun as one of:
- **Entity** - has identity that persists over time (e.g., Order, User, Position)
- **Value** - defined by its attributes, no identity (e.g., Price, Quantity, DateRange)
- **Enum** - fixed set of options (e.g., OrderSide: Buy/Sell, Timeframe: Daily/Hourly)
- **Wrapper** - domain meaning around a primitive (e.g., UserId, OrderId, Ticker, Quantity)

WHERE a noun could be either entity or value THE developer SHALL ask: "Do I need to track this specific instance over time?"

IF yes THEN it is an entity.

IF no THEN it is a value.

THE developer SHALL wrap primitive types in domain-specific types.

THE developer SHALL NOT use raw primitives (String, i64, Uuid) for domain concepts.

WHERE two concepts share the same underlying type THE developer SHALL create distinct wrapper types to prevent mixing them (e.g., `UserId(Uuid)` vs `OrderId(Uuid)`).

## Step 2: Identify the Verbs

THE developer SHALL list all actions (verbs) the system must perform.

THE developer SHALL classify each verb as one of:
- **Command** - request to change state (e.g., PlaceOrder, CancelOrder)
- **Query** - request for information without state change (e.g., GetPosition, ListOrders)
- **Calculation** - pure transformation of data (e.g., CalculateVWAP, AggregateCandles)

THE developer SHALL keep commands and queries separate (a function should do one or the other).

## Step 3: Identify the States

WHERE an entity changes over time THE developer SHALL identify its lifecycle states.

THE developer SHALL draw the state transitions:
- What states can the entity be in?
- What causes transitions between states?
- What states are terminal (no further transitions)?

WHERE state transitions exist THE developer SHALL model them as distinct types or enum variants.

THE developer SHALL NOT use boolean flags or string fields to represent state.

## Step 4: Identify What Can Fail

THE developer SHALL list all ways each operation can fail.

THE developer SHALL classify each failure as one of:
- **Validation error** - bad input that should be rejected at the boundary
- **Business rule violation** - valid input but not allowed by domain rules
- **External failure** - I/O, network, database errors

THE developer SHALL design types that make validation errors impossible (e.g., use enums instead of strings, newtypes instead of primitives).

WHERE a failure is possible THE developer SHALL model it in the return type.

## Step 5: Identify the Constraints

THE developer SHALL list all business rules and invariants.

THE developer SHALL ask for each constraint: "Can the type system enforce this?"

WHERE a constraint can be enforced by types THE developer SHALL design types that make invalid states unrepresentable.

WHERE a constraint cannot be enforced by types THE developer SHALL enforce it at construction time via validation.

THE developer SHALL NOT scatter constraint checks throughout the codebase.

## Step 6: Design the Workflow

THE developer SHALL describe the workflow as a pipeline:

```
Input → Validate → Transform → Execute → Output
```

THE developer SHALL identify:
- What is the input (command or query)?
- What validation must occur?
- What transformations are needed?
- What side effects occur (database, external API)?
- What is the output (result, events, errors)?

THE developer SHALL separate pure logic from side effects.

WHERE multiple steps can fail THE developer SHALL compose them using Result types.

## Step 7: Name Things

THE developer SHALL use domain terminology from the requirements.

THE developer SHALL NOT invent technical names that obscure business meaning.

WHERE the same term means different things in different contexts THE developer SHALL disambiguate with prefixes or separate modules.

THE developer SHALL verify naming with stakeholders if unclear.

## Output Checklist

BEFORE starting implementation THE developer SHALL have documented:
- [ ] List of entities with their identity
- [ ] List of values with their attributes
- [ ] List of enums with their variants
- [ ] State diagram for stateful entities
- [ ] List of commands and queries
- [ ] List of failure modes and how they're handled
- [ ] Workflow pipeline showing data flow
- [ ] Constraints and how they're enforced

WHERE the feature is small THE developer MAY keep this checklist mental.

WHERE the feature is complex THE developer SHALL write the model in the feature spec before implementation.

## Anti-Patterns

THE developer SHALL NOT start coding before understanding the domain.

THE developer SHALL NOT use raw primitives for domain concepts:
- `id: Uuid` → use `id: UserId`
- `ticker: String` → use `ticker: Ticker`
- `quantity: f64` → use `quantity: Quantity`
- `price: f64` → use `price: Price`

THE developer SHALL NOT use boolean flags to represent states with more than two values.

THE developer SHALL NOT scatter validation logic throughout the codebase.

THE developer SHALL NOT mix commands and queries in the same function.

THE developer SHALL NOT ignore failure modes until implementation.
