# Design System

## Style architecture

Styles are **colocated with components**. Each component has a sibling `.module.css` file that is imported into the component as a CSS Modules object.

```
webview/src/
├── modes/
│   ├── EditorView.tsx
│   └── EditorView.module.css        ← colocated
├── components/
│   ├── ClassBox/
│   │   ├── ClassBox.tsx
│   │   └── ClassBox.module.css      ← colocated
```

Usage inside components:

```tsx
import styles from "./ClassBox.module.css";

<div className={styles.box}>...</div>
```

No inline `style` objects inside `.tsx` files. No central component stylesheet.

## Global stylesheet (`webview/src/styles.css`)

One global CSS file, imported once in `main.tsx`. Contains exactly four things:

1. `@xyflow/react` base import
2. Shiny design tokens (`--shiny-*` custom properties) mapped from VS Code tokens
3. Shiny design tokens for diagram-domain values with no VS Code equivalent, defined conditionally per VS Code theme mode
4. Browser resets required by the WebView environment

Nothing component-specific lives here.

## React Flow overrides

React Flow applies selection state, node wrapper structure, and handle appearance via its own classNames. **Shiny does not override these.** React Flow defaults are accepted as-is.

This is an explicit rule, not an oversight. When selection and handle interactions are built, this rule will be revisited and a `/* React Flow overrides */` section will be introduced in `styles.css` if needed.

## Design tokens

### VS Code tokens

VS Code injects CSS custom properties into every WebView unconditionally. These are used directly for all shell chrome — surfaces, text, borders, interactive states, errors, typography.

Canonical VS Code tokens in use:

```css
--vscode-editor-background
--vscode-editorWidget-background
--vscode-editor-foreground
--vscode-descriptionForeground
--vscode-panel-border
--vscode-focusBorder
--vscode-button-background
--vscode-button-foreground
--vscode-button-secondaryBackground
--vscode-button-secondaryForeground
--vscode-button-border
--vscode-errorForeground
--vscode-font-family
```

### Shiny tokens

`--shiny-*` tokens are an indirection layer over VS Code tokens. Components always reference `--shiny-*` — never VS Code tokens directly. This means if the mapping between a Shiny concept and a VS Code token ever needs to change, it changes in one place.

Two cases:

**Case 1 — A VS Code token maps well.** Define the `--shiny-*` token as an alias:

```css
:root {
  --shiny-box-fill:        var(--vscode-editorWidget-background);
  --shiny-box-stroke:      var(--vscode-panel-border);
  --shiny-box-text:        var(--vscode-editor-foreground);
  --shiny-selection-color: var(--vscode-focusBorder);
  --shiny-hover-border:    var(--vscode-focusBorder);
  --shiny-edge-color:      var(--vscode-editor-foreground);
}
```

**Case 2 — No VS Code token exists.** Define the `--shiny-*` token conditionally using VS Code's `data-vscode-theme-kind` attribute, which VS Code sets on `<body>` with values `vscode-light`, `vscode-dark`, and `vscode-high-contrast`:

```css
body[data-vscode-theme-kind="vscode-light"] {
  --shiny-canvas-tint: rgba(0, 0, 0, 0.03);
}

body[data-vscode-theme-kind="vscode-dark"] {
  --shiny-canvas-tint: rgba(255, 255, 255, 0.03);
}

body[data-vscode-theme-kind="vscode-high-contrast"] {
  --shiny-canvas-tint: transparent;
}
```

New tokens require justification. Before adding a `--shiny-*` token, confirm no VS Code token covers the use case.

## Rules summary

- No hardcoded color values anywhere — use a VS Code token or a `--shiny-*` token
- `--shiny-*` tokens map to VS Code tokens where one exists; where none exists, define per `data-vscode-theme-kind` in `styles.css`
- Components reference `--shiny-*` tokens only — never VS Code tokens directly
- Styles in `.module.css` sibling files; never inline inside `.tsx`
- React Flow className overrides are out of scope until selection and handle interactions are built
