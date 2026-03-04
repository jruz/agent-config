---
name: typescript
description: Write TypeScript code. Use when working with TypeScript, adding eslint, configuring linting rules, or creating custom eslint rules.
---

# TypeScript

Use this skill when writing TypeScript code.

## Type Safety

THE system SHALL use the strictest TypeScript configuration.

Copy `tsconfig.json` from this skill folder to the project root.

WHERE the project uses DOM APIs, add `"DOM"` to `lib`: `"lib": ["ESNext", "DOM"]`.

WHERE the project uses JSX, add `"jsx": "react-jsx"` to `compilerOptions`.

THE system SHALL enable all strict type checking options.

WHERE types are defined THE system SHALL use type aliases explicitly.

THE system SHALL NOT use interfaces for data structures.

THE system SHALL NOT use `any` type.

THE system SHALL enforce strict immutability with `Readonly<T>`.

WHERE type assertions are necessary THE system SHALL validate data using Zod schemas.

## Module Structure

THE system SHALL use ES modules with `import` and `export`.

WHERE types do not require runtime validation THE system SHALL define them in dedicated type files.

WHERE runtime validation is needed THE system SHALL create Zod schemas.

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

THE system SHALL use Zod schemas to validate and derive domain types.

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
type Error = Readonly<{ type: "error"; message: string }>;
type Result = Success | Error;

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

THE system SHALL handle missing elements gracefully.

THE system SHALL use type assertions only after null checks.

Example:

```typescript
const button = document.querySelector<HTMLButtonElement>("#submit");
if (!button) {
  throw new Error("Submit button not found");
}
button.addEventListener("click", handleClick);
```

## Error Handling

THE system SHALL NOT log to the console.

THE system SHALL NOT use `||` or `??` operators to silently provide default values that mask null/undefined errors.

WHERE a value may be null or undefined THE system SHALL explicitly check and handle the error case.

### Throwing Errors

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

### Result Types with neverthrow

WHERE errors are recoverable THE system SHALL use the `neverthrow` library for type-safe error handling.

THE system SHALL use `Result<T, E>` to represent operations that can fail.

THE system SHALL use `ok(value)` to return successful results.

THE system SHALL use `err(error)` to return error results.

THE system SHALL define domain-specific error types as discriminated unions.

Example:

```typescript
import { err, ok, type Result } from "neverthrow";

type AppError =
  | Readonly<{ type: "not_found"; resource: string }>
  | Readonly<{ type: "validation"; message: string }>
  | Readonly<{ type: "network"; status: number }>;

const fetchUser = async (id: string): Promise<Result<User, AppError>> => {
  const response = await fetch(`/users/${id}`);
  if (response.status === 404) {
    return err({ type: "not_found", resource: `user:${id}` });
  }
  if (!response.ok) {
    return err({ type: "network", status: response.status });
  }
  return ok(await response.json());
};
```

### Error Message Formatting

THE format SHALL be `category: value` (e.g., `no image: prometheus:v3.2.1`).

THE system SHALL omit redundant context and truncate long values.

### Error Type Naming

THE system SHALL use singular nouns in error types (e.g., `no_image` not `no_images`).

WHERE the type describes what's missing THE system SHALL use `value` as the key name.

```typescript
type AppError =
  | Readonly<{ type: "no_image"; value: string }>
  | Readonly<{ type: "no_label"; value: string }>
  | Readonly<{ type: "no_revision"; value: string }>;
```

## Data Validation with Zod

WHERE data is received from external sources THE system SHALL validate it using Zod schemas.

THE system SHALL use `z.infer<typeof Schema>` to derive TypeScript types from schemas.

THE system SHALL use `.readonly()` on Zod object schemas to enforce immutability.

WHERE types are derived from Zod schemas THE system SHALL call `.readonly()` on the schema to make all properties readonly in the inferred type.

THE `.readonly()` method SHALL be called after `.object()` and before type inference.

Example:

```typescript
import { z } from "zod";

const UserSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
  })
  .readonly();

type User = z.infer<typeof UserSchema>;

const parseUser = (data: unknown): User => {
  return UserSchema.parse(data);
};
```

## Testing

THE system SHALL use vitest for unit testing.

THE test files SHALL be named with `.test.ts` suffix.

THE tests SHALL be co-located with the code they test.

WHERE a function depends on external behavior THE system SHALL use test doubles (fakes, stubs, or mocks).

THE test doubles SHALL match the same function signature as the real implementation.

Example:

```typescript
import { describe, it, expect } from "vitest";

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

## Linting

| Project Type | Tool                                          |
| ------------ | --------------------------------------------- |
| Bun/Node CLI | ESLint (see `eslint.md` in this skill folder) |
| Next.js      | ESLint (see `eslint.md` in this skill folder) |
| Web frontend | Biome (Skill(checks))                         |

THE developer SHALL NOT bypass the linter by adding ignore comments.

THE system SHALL integrate linting into the CI pipeline.

## Dependencies

### Runtime

THE project SHALL pin the Bun or Node version (e.g., `.node-version`, `package.json` `engines`).

### Base Dependencies

Install with latest versions when setting up a new project:

```bash
bun install --dev @tsconfig/strictest @types/bun typescript eslint @eslint/js typescript-eslint jiti prettier
```

THE system SHALL pin exact dependency versions in `package.json` (no `^` or `~` prefix).

THE developer SHALL check pinned versions for API compatibility.

WHERE external libraries are added THE system SHALL install them via `bun add` or `npm install`.
