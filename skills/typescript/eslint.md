# ESLint

## Setup

1. Install: `bun install --dev eslint @eslint/js typescript-eslint jiti`
2. Copy `eslint.config.ts` from this skill folder to the project root
3. Add justfile recipes

Pin exact versions in `package.json` (no `^` prefix).

USE `defineConfig()` from `eslint/config` (not `tseslint.config()` which is deprecated).

USE `tseslint.configs.strictTypeChecked` + `tseslint.configs.stylisticTypeChecked` to enable type-aware rules.

## Justfile Recipes

See `justfile` in this skill folder for `ts-lint`, `ts-lint-fix`, and aggregate `check` recipe.

## Base Rules

Config file: `eslint.config.ts` in this skill folder.

## Common Fixes for strictTypeChecked

Void arrow returns:

```typescript
// bad
info: (msg: string) => console.log(msg),
// good
info: (msg: string) => { console.log(msg); },
```

Floating promises:

```typescript
// bad
program.parseAsync();
// good
program.parseAsync().catch((e: unknown) => {
  log.error(`parse failed: ${String(e)}`);
});
```

Async callback in void position:

```typescript
// bad
emitter.once("event", async (data) => {
  await handle(data);
});
// good
emitter.once("event", (data) => {
  (async () => {
    await handle(data);
  })().catch((e: unknown) => {
    log.error(`event handler failed: ${String(e)}`);
  });
});
```

Template literals with unknown:

```typescript
// bad
log.warn(`failed: ${err}`);
// good
log.warn(`failed: ${String(err)}`);
```

exactOptionalPropertyTypes (tsconfig/strictest):

```typescript
// bad
return { value: maybeUndefined, children };
// good
return { ...(val !== undefined ? { value: val } : {}), children };
```

JSON.parse safety:

```typescript
// bad
const parsed = JSON.parse(text);
// good
const parsed: unknown = JSON.parse(text);
```

Deprecated APIs — replace with non-deprecated alternative. If none exists, use CDP directly.

## Handling Unavoidable Casts

```typescript
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- reason
const x = value as TargetType;
```

THE eslint-disable comment SHALL include a reason.

## Handling Unavoidable `any`

```typescript
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- validated by downstream param helpers
const result = await dispatch(await req.json());
```

## Custom Rules

Custom rules live in `eslint-rules/` in the project root. See `rules/no-inline-styles.ts` in this skill folder for an example.

Register via a local plugin in the eslint config:

```typescript
{
  plugins: {
    local: { rules: { "rule-name": importedRule } },
  },
  rules: { "local/rule-name": "error" },
}
```

## Replacing Type Assertions

WHERE `as` casts exist on serialization boundaries, use runtime extraction helpers.

WHERE `as` casts narrow object types, use type guards.

WHERE `as` casts narrow platform-specific types, use type guard functions.

THE developer SHALL NOT bypass the linter by adding ignore comments.

THE system SHALL integrate linting into the CI pipeline.
