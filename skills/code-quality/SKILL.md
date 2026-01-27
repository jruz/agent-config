---
name: code-quality
description: Review code quality. Use when refactoring.
---

# Code Quality

## Overview

This specification defines universal code quality principles that apply to all programming languages. These principles transcend language-specific syntax and focus on fundamental patterns for writing maintainable, correct, and understandable code.

## Functional Programming

THE system SHALL prefer functional programming patterns over object-oriented patterns.

THE system SHALL use pure functions where possible, producing the same output for the same input.

THE system SHALL pass data as function parameters rather than storing state in structures.

WHERE state is needed THE system SHALL pass it explicitly as function parameters.

THE system SHALL NOT maintain mutable state across function invocations.

THE system SHALL use function composition to build complex behavior from simple functions.

WHERE behavior needs to be shared THE system SHALL use standalone functions, not methods on structures.

## Asynchronous Operations

THE system SHALL use asynchronous operations for all I/O and potentially blocking operations.

THE system SHALL mark functions as asynchronous where they perform I/O, network requests, or database access.

THE system SHALL NOT block the execution thread waiting for I/O operations.

WHERE concurrent operations are needed THE system SHALL use appropriate async primitives.

THE system SHALL handle async errors with the same rigor as synchronous errors.

## Immutability

THE system SHALL treat all data as immutable by default.

THE system SHALL create new data structures for transformed output rather than mutating input data.

WHERE data modification is needed THE system SHALL create new instances with modified values.

THE system SHALL NOT mutate function parameters.

THE system SHALL NOT mutate variables after initialization.

WHERE collections are processed THE system SHALL use functional transformation methods, not mutation.

## Error Handling

THE system SHALL use explicit error types with descriptive messages.

THE system SHALL provide sufficient context in errors for callers to handle or display them.

THE system SHALL propagate errors to callers rather than silencing them.

THE system SHALL NOT silently swallow errors or provide default values that mask failures.

THE system SHALL NOT panic or throw unhandled exceptions on expected error conditions.

WHERE multiple error types are possible THE system SHALL use enumerated error types.

THE system SHALL NOT expose internal implementation details in error messages.

WHERE operations can fail THE system SHALL return error types, not success-or-failure booleans.

WHERE I/O operations fail THE system SHALL propagate errors with context about what was attempted.

## Testing

THE system SHALL have unit tests for all public functions.

THE system SHALL test units independently.

WHERE a function depends on external behavior THE system SHALL use test doubles with matching signatures.

THE system SHALL test error handling paths in addition to success paths.

THE system SHALL test edge cases and boundary conditions.

WHERE time-dependent logic exists THE system SHALL use fixed timestamps for deterministic testing.

THE system SHALL use in-memory or mock dependencies for unit tests where possible.

THE tests SHALL verify behavior, not implementation details.

THE system SHALL NOT write tests for simple, private, or tightly-coupled helper functions.

THE tests SHALL tell the story of each module's behavior.

WHERE tests become complex THE developer SHALL consider if the code under test needs simplification.

## State Management

THE system SHALL minimize stateful operations.

WHERE state is unavoidable THE system SHALL isolate it in clearly defined boundaries.

THE system SHALL NOT share mutable state across concurrent operations.

WHERE accumulation is needed THE system SHALL use immutable data structures with transformations.

THE system SHALL pass state explicitly rather than relying on implicit global state.

WHERE state transitions occur THE system SHALL make them explicit and predictable.

## Logging

See the Tracing skill for logging and observability requirements.

## Time and Timezone Handling

THE system SHALL use UTC for all timestamp storage and internal processing.

WHERE timezone-specific calculations are needed THE system SHALL convert timestamps using timezone libraries.

THE system SHALL NOT use local system time for business logic.

WHERE market hours are calculated THE system SHALL use the appropriate market timezone.

THE system SHALL store all timestamps in UTC in databases.

WHERE timestamps are displayed to users THE system SHALL convert to appropriate timezone at presentation layer.

## Resource Management

THE system SHALL acquire resources late and release them early.

WHERE resources require cleanup THE system SHALL ensure cleanup occurs in all code paths including errors.

THE system SHALL use language-appropriate resource management patterns (RAII, defer, try-finally, etc.).

WHERE connections are needed THE system SHALL accept pre-initialized clients as parameters.

THE system SHALL NOT create or manage connection pools within business logic.

WHERE files are opened THE system SHALL ensure they are closed even if operations fail.

## Code Organization

THE system SHALL organize code by feature or domain concept, not by technical layer.

THE system SHALL co-locate related code in the same module or directory.

WHERE a module becomes large THE developer SHALL split it by feature boundaries, not arbitrarily.

THE system SHALL keep modules focused on a single responsibility.

THE system SHALL use clear, descriptive names that reflect business concepts, not implementation details.

WHERE code is duplicated across 3 or more locations THE developer SHALL consider extracting common behavior.

WHERE duplication exists in fewer than 3 locations THE developer MAY leave it to avoid premature abstraction.

THE system SHALL group modules that share similar environment assumptions.

WHERE modules assume specific environmental conditions THE system SHALL validate those assumptions at module boundaries.

## Separation of Concerns

THE system SHALL separate pure calculations from I/O operations.

THE system SHALL separate data transformation from data access.

THE system SHALL separate validation from business logic.

WHERE multiple concerns are present THE developer SHALL split them into separate functions.

THE system SHALL avoid complecting (braiding together) distinct concerns.

THE developer SHALL recognize that complecting makes systems complex and difficult to reason about.

THE system SHALL NOT complect state (which changes over time) with identity or value.

THE system SHALL NOT complect "what" is done with "how" it is done (implementation details).

THE system SHALL NOT mix business logic with presentation logic.

THE system SHALL NOT mix data structures with behavior in the same construct.

THE system SHALL use modules to organize code without complecting meaning with location.

## Dependency Management

THE system SHALL depend on abstractions (function signatures, interfaces) not concrete implementations.

WHERE a function needs external behavior THE system SHALL accept it as a parameter.

THE system SHALL use dependency injection via function parameters.

THE system SHALL NOT access global dependencies within business logic.

WHERE multiple functions share dependencies THE developer MAY group them in the same module.

## Law of Demeter

THE functions SHALL only access:

- Direct function parameters
- Objects created within the function
- Direct properties of the current context

THE system SHALL NOT chain more than 2 property accesses.

WHERE deep property access is needed THE system SHALL create intermediate functions.

THE system SHALL ask direct collaborators for information rather than reaching through them.

## Complexity Management

THE developer SHALL recognize that simplicity is a choice that requires upfront work.

THE developer SHALL prioritize analyzing and designing before typing and testing.

THE developer SHALL decompose problems into distinct, simple sub-problems rather than accepting complexity.

THE developer SHALL prioritize the artifact (the running program and its value) over the construct (source code and writer's convenience).

THE system SHALL prioritize understandability over premature abstraction.

THE developer SHALL write the simplest code that passes tests first.

THE system SHALL tolerate duplication temporarily to reveal the correct abstraction.

THE developer SHALL recognize that human working memory is limited to approximately seven items (plus or minus two).

WHERE components are complected THE developer SHALL consider the entire interconnected set as a single cognitive load item.

THE system SHALL minimize the number of concepts a reader must track simultaneously.

WHERE complexity metrics exceed thresholds THE developer SHALL refactor to simplify:

- Cyclomatic complexity SHOULD be less than 5
- ABC score (Assignments, Branches, Conditions) SHOULD be less than 15
- Function length SHOULD be less than 20 lines

THE system SHALL avoid deeply nested conditional logic.

WHERE conditional logic becomes complex THE developer SHALL extract conditions into well-named functions.

## Data Validation

WHERE data crosses system boundaries THE system SHALL validate it.

THE validation SHALL occur at the boundary, not deep within business logic.

WHERE validation fails THE system SHALL provide clear error messages indicating what was invalid.

THE system SHALL NOT proceed with invalid data.

WHERE data has invariants THE system SHALL enforce them at construction time.

WHERE None, null, or undefined values are possible THE system SHALL handle them at the boundary, not deep in business logic.

THE system SHALL NOT pass None, null, or undefined values downstream into pure functions.

WHERE optional values cross boundaries THE system SHALL convert or validate them before processing.

## Naming

THE system SHALL use descriptive names that reflect domain concepts.

THE function names SHALL describe what the function represents, not how it works.

THE variable names SHALL use domain terminology over technical terminology.

WHERE abbreviations are used THE developer SHALL ensure they are widely understood in the domain.

THE system SHALL use consistent naming patterns throughout the codebase.

WHERE names become ambiguous THE developer SHALL add clarifying context.

WHERE functions cross data boundaries (I/O, network, database) THE system SHALL include verbs in function names.

WHERE functions only transform data without I/O THE system SHALL favor noun-based names over verb-based names.

## Optional Parameters

WHERE functions accept multiple optional parameters THE system SHALL use configuration objects or structs.

WHERE functions have one or two optional parameters THE system MAY use language default parameter mechanisms.

## Code Clarity

THE system SHALL write self-documenting code that requires no comments.

WHERE code is unclear THE developer SHALL refactor until it is understandable without explanation.

THE system SHALL NOT use comments to explain code behavior.

THE system SHALL use clear names and simple logic instead of comments.

WHERE complexity exists THE developer SHALL break it into smaller, well-named functions.

THE system SHALL make similar operations look similar and different operations look different.

## Refactoring

THE developer SHALL separate refactoring commits from feature commits.

WHERE new functionality is needed THE developer SHALL:

1. First refactor existing code to be "open" to the change
2. Commit the refactoring
3. Then add the new functionality
4. Commit the feature

THE developer SHALL apply "Flocking Rules" when refactoring:

1. Select similar code sections
2. Identify the smallest difference between them
3. Make the simplest change to remove that difference
4. Repeat until a pattern emerges

THE developer SHALL work horizontally when refactoring:

- Complete one abstraction across all locations (horizontal)
- Before diving into deep optimizations (vertical)

## Batch Operations

WHERE multiple items are processed THE system SHALL validate all items before processing.

THE batch operations SHALL collect and report all errors, not fail on first error.

WHERE partial success is possible THE system SHALL return summary information about successes and failures.

THE system SHALL NOT silently skip invalid items in batch operations.

## Streaming Data

WHERE real-time data streaming is needed THE system SHALL use appropriate streaming abstractions.

THE streaming operations SHALL handle connection failures gracefully with retry logic.

THE streaming operations SHALL NOT block on I/O operations.

WHERE backpressure is possible THE system SHALL handle slow consumers appropriately.

THE system SHALL clean up streaming resources when connections close.

## Correctness

THE developer SHALL recognize that tests prove the presence of bugs, not their absence.

THE system SHALL rely on both tests AND simple reasoning about code for correctness.

THE developer SHALL prioritize simplicity to enable reasoning about correctness.

WHERE code cannot be reasoned about easily THE developer SHALL refactor for clarity.

THE developer SHALL acknowledge that understanding is fundamental to correctness.

THE system SHALL make invalid states unrepresentable where possible.
