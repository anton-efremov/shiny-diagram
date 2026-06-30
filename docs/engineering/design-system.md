# Design System

> **Implementation state:** Aspirational
> **Document state:** Maintained
> **Last reviewed:** 2026-06-19
> **Scope:** A description of target design system to be built gradually

## Target vision

A central library of parametrized UI components (`webview/src/View/ui/`) — `Button`,
`Panel`, etc. — each owning its own structure, style, variants, and interaction
states (hover/focus/disabled). Feature components compose these instead of
writing ad-hoc markup/CSS for recurring UI elements.

This library is built gradually, not upfront (see Rule 2).

## Current system — rules

- **Rule 1: Colocated CSS Modules (static components)** — every component owns a
  sibling `.module.css`; no inline style declarations, no shared style fragments.
- **Rule 2: Promote on repetition** — stay local until a UI element genuinely
  repeats, then extract a parametrized component to `webview/src/View/ui/`.
- **Rule 3: Two-tier design tokens, palette-first** — `--vscode-*` tokens map to
  a small `--shiny-*` palette (named by color character, not application) in
  `styles.css`; components pick palette entries directly.
- **Rule 4: Theme-dependent values use tokens** — colors and other
  theme-dependent values are VS Code or `--shiny-*` tokens; layout values are
  literals.
- **Rule 5: Global stylesheet scope** — `styles.css` contains the React Flow
  base import, `--shiny-*` token definitions, base document defaults, and
  browser resets.
- **Rule 6: Dynamic per-instance styling (user-defined components)** — diagram
  components bind user-authored `classDef` colors to CSS custom properties,
  consumed with `--shiny-*` fallback.
- **Rule 7: React Flow defaults accepted as-is** — no override rules targeting
  React Flow's own class names.

### Rule 1 — Colocated CSS Modules (static components)

Every component whose appearance doesn't depend on diagram data owns a sibling
`.module.css` file, imported as a CSS Modules object. No inline `style`
declarations in `.tsx`.

```
components/ToolPane/
  ToolPane.tsx
  ToolPane.module.css
```

```tsx
import styles from "./ToolPane.module.css";
<div className={styles.toolPane}>...</div>;
```

No shared style fragments (`composes`, primitives files). Each `.module.css` is
self-contained.

### Rule 2 — Promote on repetition

Stay local until a UI element — not just a style pattern — genuinely repeats: same
structure, same behavior, a second real instance. Then extract a component (`.tsx`

- `.module.css`) into `webview/src/View/ui/`. The shared thing is always a component,
  never a bare CSS class or fragment — a component bundles structure, style, and
  behavior, which a CSS-only primitive can't capture without duplicating the
  behavioral part anyway.

Small duplicated style snippets (e.g. text-truncation ellipsis, 3 lines, appearing
in 2 places) are not worth promoting on their own — accept the duplication for now.

### Rule 3 — Two-tier design tokens, palette-first

VS Code injects `--vscode-*` custom properties into every WebView. `--shiny-*`
tokens are Shiny's own vocabulary, defined once in `styles.css` as either an alias
to a `--vscode-*` token or a per-theme-kind value when no VS Code equivalent exists.

**Components reference `--shiny-*` only — never `--vscode-*` directly**, anywhere
outside `styles.css`. This keeps VS Code's variable naming fully isolated to one
file; if VS Code renames/restructures tokens, only `styles.css` changes.

**Naming: palette tokens, not application-named tokens.** `--shiny-*` tokens name
the _character_ of a color (`--shiny-surface`, `--shiny-accent`,
`--shiny-overlay-faint`) — never _where in the diagram_ it's used
(`--shiny-box-fill`, `--shiny-edge-color`). A small palette is defined once;
components pick palette entries directly for whatever they need. This avoids the
same color being aliased under multiple application-named tokens (e.g.
`--vscode-editor-foreground` previously aliased separately as box-text,
edge-color, and text — all identical).

Each token name is flat and complete — `--shiny-overlay-faint` and
`--shiny-overlay-strong` are two distinct named characters, not a base name with
modifiers expected to combine.

```css
/* styles.css — Case 1: alias a VS Code token to a palette role. :root is the
   standard place for global custom-property definitions. */
:root {
  --shiny-surface: var(--vscode-editorWidget-background);
  --shiny-border: var(--vscode-panel-border);
  --shiny-text: var(--vscode-editor-foreground);
  --shiny-text-muted: var(--vscode-descriptionForeground);
  --shiny-text-error: var(--vscode-errorForeground);
  --shiny-accent: var(--vscode-focusBorder);
  --shiny-page-bg: var(--vscode-editor-background);
}

/* Case 2: no VS Code equivalent — define per theme-kind. VS Code sets
   data-vscode-theme-kind on <body>, so the selector targets body, not :root. */
body[data-vscode-theme-kind="vscode-light"] {
  --shiny-overlay-faint: rgba(0, 0, 0, 0.03);
}
body[data-vscode-theme-kind="vscode-dark"] {
  --shiny-overlay-faint: rgba(255, 255, 255, 0.03);
}
```

A component picks whichever palette entries fit:

```css
.classBox {
  background: var(--shiny-surface);
  border: 1px solid var(--shiny-border);
  color: var(--shiny-text);
}
```

New `--shiny-*` tokens require justification — confirm no existing palette entry
already covers the use case before adding one.

### Rule 4 — Theme-dependent values use tokens

Any value that varies by VS Code theme — color, but also things like
`--shiny-code-font-family` (aliasing `--vscode-editor-font-family`) — is a VS Code
token (only inside `styles.css`, per Rule 3) or a `--shiny-*` token. No literal
hex/rgb/hsl values in component `.module.css` files.

Layout values (widths, gaps, padding, font-sizes, border-radii) are literals as
needed — they aren't theme-dependent and don't need token indirection. A one-off
`width: 104px` for a single component doesn't warrant a `--shiny-*` token.

### Rule 5 — Global stylesheet scope

`styles.css`, imported once in `main.tsx`, contains exactly:

1. `@xyflow/react` base import — React Flow's own required CSS (node
   positioning, edge paths, handle rendering, controls layout). This is loading
   the library's stylesheet, not overriding it — see Rule 7 for the distinction.
2. `--shiny-*` token definitions (Rule 3)
3. Base/default styles — sizing reset (`* { box-sizing: border-box }`), body
   margin reset, and cascading defaults (`font-family`/`color` on `body` from
   `--shiny-*` tokens, inherited by the whole tree). Component `.module.css`
   files don't redeclare these.

Nothing component-specific lives here.

### Rule 6 — Dynamic per-instance styling (user-defined components)

`ClassBox` and `StylePane` render colors the user chose via `classDef` in their
diagram source — render-time data, not design tokens, different per instance.
These bind to CSS custom properties via the `style` attribute, read back in the
`.module.css` with `--shiny-*` as fallback:

```css
.classBox {
  background: var(--class-fill, var(--shiny-surface));
}
```

```tsx
<div style={{ "--class-fill": fillFromClassDef }} className={styles.classBox} />
```

This binds a _data value_ to a variable name — the CSS rules themselves stay
static in `.module.css`. It is not the kind of inline styling Rule 1 prohibits
(literal style declarations like `style={{ color: "red" }}`), and not CSS-in-JS:
no stylesheets are generated at runtime, only three custom-property values
(fill, stroke, color) are passed through.

### Rule 7 — React Flow defaults accepted as-is

Rule 5 imports React Flow's base stylesheet because the library requires it to
render at all. Separately, Shiny writes no additional CSS rules targeting React
Flow's own class names (`.react-flow__*`) to override that base appearance —
selection state, node wrapper structure, and handle styling stay at React Flow
defaults. Explicit choice, not an oversight. Revisit when selection/handle
interactions are built; any future overrides would live in `styles.css` under a
dedicated `/* React Flow overrides */` section.
