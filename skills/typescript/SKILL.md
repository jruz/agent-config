---
name: typescript
description: Use when working with TypeScript code.
---

# TypeScript

Use this skill when writing TypeScript code.

For project setup and tooling follow [SETUP.md](SETUP.md).

## Type Safety

WHERE types are defined THE system SHALL use type aliases explicitly.

THE system SHALL NOT use interfaces for data structures.

THE system SHALL NOT use `any` type.

THE system SHALL enforce strict immutability with `Readonly<T>`.

## Data Validation with Zod

THE system SHALL use Zod for runtime validation of external data, including request payloads, API responses, persisted files, and test-helper inputs.

THE system SHALL NOT implement handwritten structural validators or type predicates for external data, or use type assertions instead of validation.

THE system SHALL treat unvalidated external data as `unknown`.

THE system SHALL derive validated types using `z.infer<typeof Schema>` rather than maintain parallel handwritten types.

THE system SHALL reuse or compose schemas wherever the same data contract is validated.

WHERE invalid input is an expected failure THE system SHALL use `safeParse` and handle the failure explicitly according to [Module Errors](#module-errors).

WHERE validation failure should propagate as an exception THE system SHALL use `parse`.

THE system SHALL apply `.readonly()` to object and array schemas representing immutable data; nested schemas require their own `.readonly()` because it is not recursive.

Ordinary null checks, discriminant narrowing, and business decisions on already-validated data do not require Zod.

Example:

```typescript
import { z } from "zod";

const UserSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.email(),
  })
  .readonly();

const UsersSchema = z.array(UserSchema).readonly();
type User = z.infer<typeof UserSchema>;

const parseUsers = (data: unknown): readonly User[] => UsersSchema.parse(data);
```

## Module Structure

THE system SHALL use ES modules with `import` and `export`.

THE system SHALL include `.ts` extensions in relative TypeScript imports.

THE system SHALL run scripts in `scripts/` with Bun in every project, including Node projects, and use only erasable TypeScript syntax.

THE system SHALL keep executable scripts at the `scripts/` root.

WHERE a module is used by a single script THE system SHALL place it with its tests in `scripts/<script-name>/`.

WHERE a module is shared across scripts THE system SHALL place it in `scripts/lib/`.

WHERE the project uses a bundler, adapt the module configuration to the framework's requirements.

WHERE types do not require runtime validation THE system SHALL define them in dedicated type files.

## Code Style

THE system SHALL use `const` for all variables.

THE system SHALL use arrow functions for callbacks.

THE system SHALL NOT use `for` or `while` loops.

WHERE iteration is needed THE system SHALL use `forEach`, `map`, `reduce`, `filter`, or other functional array methods.

## Type Definitions

THE system SHALL use descriptive type names.

THE system SHALL use `Readonly<T>` to enforce immutability.

THE system SHALL export all public types.

Example:

```typescript
type User = Readonly<{
  id: string;
  name: string;
  email: string;
}>;
```

## Domain Modeling

WHERE primitives have domain meaning THE system SHALL create type aliases for clarity.

WHERE domain types require runtime validation THE system SHALL follow [Data Validation with Zod](#data-validation-with-zod).

For internal types that do not require runtime validation:

Example:

```typescript
type UserId = string;
type Email = string;

type User = Readonly<{
  id: UserId;
  email: Email;
}>;
```

## Conditional Logic

THE system SHALL prefer discriminated unions over complex conditionals.

WHERE behavior varies by type THE system SHALL use discriminated unions with exhaustive pattern matching.

THE system SHALL ensure all branches return consistent types (Liskov Substitution Principle).

Example:

```typescript
type Success = Readonly<{ type: "success"; data: string }>;
type Failure = Readonly<{ type: "error"; message: string }>;
type Result = Success | Failure;

const handleResult = (result: Result): string => {
  switch (result.type) {
    case "success":
      return result.data;
    case "error":
      return `Error: ${result.message}`;
  }
};
```

## Factory Patterns

WHERE object creation logic is complex THE system SHALL use factory functions.

WHERE selection logic is stable THE system SHALL use simple switch statements.

WHERE selection logic changes frequently THE system SHALL use a registry pattern (Map of factory functions).

Example registry pattern:

```typescript
type ChartFactory = (config: ChartConfig) => Chart;

const chartFactories = new Map<ChartType, ChartFactory>([
  ["line", createLineChart],
  ["bar", createBarChart],
  ["candlestick", createCandlestickChart],
]);

const createChart = (type: ChartType, config: ChartConfig): Chart => {
  const factory = chartFactories.get(type);
  if (!factory) {
    throw new Error(`Unknown chart type: ${type}`);
  }
  return factory(config);
};
```

## DOM Interaction

WHERE DOM elements are accessed THE system SHALL check for null.

WHERE an element's runtime type must be verified THE system SHALL narrow it with `instanceof`; a null check alone does not establish its element type.

Example:

```typescript
const button = document.querySelector<HTMLButtonElement>("#submit");
if (!button) {
  throw new Error("Submit button not found");
}
button.addEventListener("click", handleClick);
```

## Error Handling

WHERE code runs in the browser THE system SHALL NOT log to the console.

WHERE scripts report diagnostics THE system SHALL use [scripts/lib/log.ts](files/scripts/lib/log.ts), which writes every level to stderr.

WHERE scripts return user-facing output THE system SHALL use [scripts/lib/output.ts](files/scripts/lib/output.ts): `text`, `json`, or `table` write to stdout. Its companions are [table.ts](files/scripts/lib/table.ts) and [table.types.ts](files/scripts/lib/table.types.ts). The formatter measures visible widths with `Bun.stringWidth` so Unicode and ANSI-colored cells align.

THE system SHALL NOT use `||` or `??` operators to silently provide default values that mask null/undefined errors.

WHERE a value may be null or undefined THE system SHALL explicitly check and handle the error case.

### Module Errors

WHERE a module has expected failures THE module SHALL define and export one error-code string union and a readonly discriminated failure type.

THE system SHALL return expected failures through a readonly discriminated result union instead of throwing custom error classes.

THE result SHALL follow Zod's `safeParse` naming: `{ success: true, data }` or `{ success: false, error }`. This naming SHALL apply to plain result types without requiring Zod for domain operations.

THE callers SHALL handle failures by code, never by message.

WHERE failure variants need additional context THE system SHALL encode that context in the corresponding discriminated variant.

THE error-code translations SHALL be exhaustive.

THE tests SHALL verify that error handling is independent of message wording.

THE modules without expected failures SHALL NOT introduce an error abstraction.

THE system SHALL NOT use TypeScript `enum` declarations.

```typescript
type EntryErrorCode = "entry-not-found";

type EntryFailure = Readonly<{
  code: EntryErrorCode;
  id: string;
}>;

type Result<T, E> =
  | Readonly<{ success: true; data: T }>
  | Readonly<{ success: false; error: E }>;

const getEntry = (id: string): Result<Entry, EntryFailure> => {
  const entry = entries.find((entry) => entry.id === id);
  if (!entry) return { success: false, error: { code: "entry-not-found", id } };
  return { success: true, data: entry };
};
```

### Error Reporting

THE domain modules SHALL return typed expected failures and propagate unexpected exceptions.

THE system SHALL report unexpected exceptions at the responsible boundary using the [Faro skill's browser and backend guidance](../faro/SKILL.md).

THE system SHALL avoid duplicate reports from explicit handling and automatic instrumentation.

### Throwing Errors

THE unexpected errors SHALL propagate unchanged rather than becoming expected failure results.

WHERE errors are unrecoverable THE system SHALL throw errors with rich developer-friendly messages.

Example:

```typescript
const getUserName = (user: User | null): string => {
  if (!user) {
    throw new Error("User is null - cannot get name");
  }
  return user.name;
};
```

### Error Message Formatting

THE format SHALL be `category: value` (e.g., `no image: prometheus:v3.2.1`).

THE system SHALL omit redundant context and truncate long values.

## Testing

- Test `scripts/` with `bun test`
- Test app code in `src/` with Vitest
- `just test` runs `ts::test` and `bun::test`
- `just check` runs `ts::check` and other checks, never tests

THE test files SHALL be named with `.test.ts` suffix.

THE tests SHALL be co-located with the code they test.

WHERE a function depends on external behavior THE system SHALL use test doubles (fakes, stubs, or mocks).

THE test doubles SHALL match the same function signature as the real implementation.

Example:

```typescript
import { describe, it, expect } from "bun:test";

describe("calculateTotal", () => {
  it("should sum all item prices", () => {
    const items = [{ price: 10 }, { price: 20 }, { price: 30 }];
    expect(calculateTotal(items)).toBe(60);
  });
});
```

## Separation of Concerns

THE system SHALL use plain data structures (objects, arrays, maps) as interfaces between components.

WHERE polymorphism is required THE system SHALL use discriminated unions rather than class hierarchies.

## Immutability

THE system SHALL treat all data as immutable by default.

THE system SHALL create new data structures for transformed output rather than mutating input data.

WHERE data modification is needed THE system SHALL create new instances with modified values.

THE system SHALL NOT mutate function parameters.

THE system SHALL NOT mutate variables after initialization.

Example:

```typescript
const addItem = (items: readonly Item[], newItem: Item): readonly Item[] => {
  return [...items, newItem];
};

const updateItem = (
  items: readonly Item[],
  id: string,
  updates: Partial<Item>,
): readonly Item[] => {
  return items.map((item) => (item.id === id ? { ...item, ...updates } : item));
};
```

## Global Type Augmentation

WHERE third-party libraries add properties to the window object THE system MAY declare their types using `declare global`.

WHERE augmenting built-in global types THE system SHALL use `interface` to extend existing global interfaces.

Example:

```typescript
declare global {
  interface Window {
    readonly htmx: Htmx;
  }
}
```
