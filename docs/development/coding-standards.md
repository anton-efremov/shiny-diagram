# Coding Standards

## 1. Enforced standards

These rules are enforced by the compiler and toolchain. The pipeline rejects code that violates them.

### TypeScript compiler

Configuration lives in `tsconfig.json` (extension host) and `tsconfig.webview.json` (webview). Both use `strict: true`, which enables:

- `strictNullChecks` — null and undefined are not assignable to other types without explicit handling
- `noImplicitAny` — every value must have an explicit or inferrable type
- `strictFunctionTypes` — function parameter types are checked contravariantly
- `strictPropertyInitialization` — class properties must be assigned in the constructor

### Prettier

Configuration: `.prettierrc` in the repo root.

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "always"
}
```

Prettier owns all formatting decisions: indentation, spacing, line breaks, quote style, trailing commas.

### ESLint

Configuration: `eslint.config.js` in the repo root. Uses ESLint 9 flat config format.

Key rules:

- `@typescript-eslint/no-explicit-any` — error
- `@typescript-eslint/no-unused-vars` — error
- `@typescript-eslint/no-non-null-assertion` — error
- `@typescript-eslint/consistent-type-imports` — type imports use `import type`
- `react-hooks/rules-of-hooks` — error
- `react-hooks/exhaustive-deps` — warning
- `no-console` — error

`console.warn` and `console.error` are permitted in `webview/src/` where VS Code's output channel is unavailable, but must not remain on non-error paths in committed code.

---

## 2. Standards requiring judgment

### Naming

Shiny follows the [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html) for naming. Summary:

- `camelCase` — variables, functions, module-scope constants, CSS module class names
- `PascalCase` — React components, classes, type aliases, interfaces
- `UPPER_SNAKE_CASE` — true compile-time constants (e.g. protocol message type literals)
- No `_` prefix for private members — use TypeScript `private` instead
- No abbreviations unless unambiguous in this domain (`mmd`, `css`, `id`, `url` are fine; `mgr`, `tmp`, `val` are not)
- Names describe responsibility, not implementation (`extractSpatialBoxes`, not `parseMmdAnnotations2` or `processData`)

### Comments and annotations

Shiny uses [JSDoc](https://jsdoc.app/) annotation style, aligned with Google's TSDoc conventions.

#### File-level annotation

Every non-component TypeScript and CSS module file begins with a `@fileoverview` block:

```ts
/**
 * @fileoverview Parses Mermaid source text into a structured diagram model.
 * Handles class declarations, relationships, style declarations, and
 * Shiny spatial annotations. Pure functions only — no VS Code dependencies.
 */
```

React component files (`.tsx`) are exempt.

#### Function annotation

Every exported function has a JSDoc block with at minimum a one-line summary:

```ts
/**
 * Extracts spatial box data from Mermaid source text.
 */
export function extractSpatialBoxes(source: string): SpatialBox[] {
```

`@param` and `@returns` are added when types alone do not make the contract clear:

```ts
/**
 * Patches a single spatial annotation in Mermaid source text.
 * Preserves all other source content unchanged.
 *
 * @param source - Full .mmd file content.
 * @param className - Mermaid class name identifying the annotation to patch.
 * @param patch - Partial spatial values to update; omitted keys are preserved.
 * @returns Updated source string, or null if no matching annotation was found.
 */
export function patchSpatialAnnotation(
  source: string,
  className: string,
  patch: Partial<SpatialBox>
): string | null {
```

Non-exported functions: JSDoc block if non-trivial; omit for obvious one-liners.

#### Inline comments

Comments explain _why_, not _what_.

Wrong:

```ts
// Loop through all classes
for (const cls of classes) {
```

Right:

```ts
// Class names are the stable identity for spatial annotations.
// We iterate declared classes, not annotation keys, so undeclared
// annotations are treated as orphaned rather than driving rendering.
for (const cls of classes) {
```

Required when:

- Working around a library constraint or known bug (name the constraint)
- Deviating intentionally from the documented architecture (state why)
- A non-obvious invariant must hold for correctness
