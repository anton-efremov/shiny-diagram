# UI Styling Standards

Governs Shiny's own style declarations. Behavior encapsulation is governed by [UI Library Architecture](./UI-library-architecture.md). User-authored diagram values are data, not styles: governed by the style-resolution spec, entering CSS only as component-owned custom-property bindings.

# Layer authority

**Domain component** — owns the composition of functional elements into one visual surface, and knows each element's state (this box is selected, this member is a gesture target, this text is secondary). It translates those facts into the library's situation vocabulary through options and variants, never stating how anything looks — no values, no tokens, no treatments. Exception: its own unique anatomy (canvas surface layout), where it is the library of itself.

**Library component** — owns the visual composition of a functional element from identity tokens. Given a situation, it decides what visually happens: which parts change, borders vs tints, which part expresses the state, spacing of its internals. Identity-bearing values (color, type scale, line and border shape, elevation, cursor) are never stated locally, only queried from central tokens; its own internal geometry remains its literals.

**Tokens** — own visual identity and its calibration (particular colors, radii, elevation, line styles, cursors), deciding what "accent" or "selection" actually is, calibrated per application flavor where uses need different strengths (`accent-outline` vs `accent-tint`), sourced from theme or fixed — invisibly to everyone above. `tokens.css` is the brandbook; its header annotation defines token grammar and governance.

# Core principles

- **One author per decision** — every style decision has exactly one author; everyone else refers to it by name (token, config constant, variant, template). Writing a copy of an existing decision is the defining violation.
- **Independence test** — can this value change alone, with nothing elsewhere becoming wrong? Yes → literal in the owning component's `.module.css`. No → the constraint gets one home. Constraint kinds: shared identity; ordering; cross-language pair (CSS draws it, TypeScript computes with it); derivation. Mount count never enters the test.
- **Homes by agreeing parties** — internal to one component → its `.module.css`; siblings in one arrangement → the layout template; unrelated components → token; TypeScript is a party → `editorUiConfig.ts`, bound into CSS; the user's diagram is a party → `stylePresets.ts`. Overlaps resolve: user → TypeScript → unrelated components → arrangement → own stylesheet.
- **Derivation names one free variable** — the dependent side is computed (`calc()`, shared constant), never a second number kept equal by hand.
- **Asserted vs emergent dimensions** — a dimension asserted regardless of content is identity, routed per its row; a dimension emerging from content is not authored at all (only paddings and constraints are).
- **Token names may use structural diagram vocabulary** (node, edge, canvas) — tokens name where in the picture a decision applies; component APIs stay situational.

# Property ownership

Each CSS property appears in exactly one row. Rows group properties sharing one value-definition policy; a conditional policy is a policy. Policies are written as `<source>: <case>`, case omitted when unconditional. All conditions live in the Value definition column.

| Property group | Exact CSS properties | Value definition |
|---|---|---|
| Color | `color`, `background`, `background-color`, `border-color`, `outline-color`, `caret-color`, `accent-color`, `fill`, `stroke` | `tokens.css`: authored values<br>component-owned data binding: values derived from user content |
| Type scale | `font-family`, `font-size`, `font-weight`, `line-height` | `tokens.css` |
| Line and border shape | `border-style`, `outline-style`, `text-decoration-style`, `stroke-dasharray`, `border-width`, `outline-width`, `stroke-width`, `border-radius` | `tokens.css` |
| Shadows | `box-shadow`, `text-shadow`, `filter` (shadow functions) | `tokens.css` |
| Cursor | `cursor` | `tokens.css` |
| Opacity | `opacity` | `tokens.css`: when expressing an identity state (disabled, scrim, emphasis levels)<br>owning component's `.module.css`: as a pure show/hide mechanism |
| Stacking | `z-index` | `editorUiConfig.ts` |
| Heights | `height`, `min-height`, `max-height` | `tokens.css`: on interactive controls and interaction affordances<br>owning component's `.module.css`: otherwise |
| Widths | `width`, `min-width`, `max-width` | `tokens.css`: on compact interactive controls and interaction affordances<br>arranging template's `.module.css`: on fluid interactive controls<br>owning component's `.module.css`: otherwise |
| Box geometry | `padding`, `margin`, `inset`, `top`, `right`, `bottom`, `left`, `transform` | owning component's `.module.css` |
| Layout | `display`, `flex-*`, `grid-*`, `gap`, `align-*`, `justify-*`, `overflow` | owning component's `.module.css` |
| Interaction toggles | `visibility`, `pointer-events` | owning component's `.module.css` |

Corollaries:

- Only two component kinds own a `.module.css`: library components (their internals) and canvas domain components (their unique anatomy). A `.module.css` in a chrome domain component is a violation — chrome composes library elements, arrangement belongs to templates
- For values owned by `tokens.css`, component CSS contains no raw values — only `var(--shiny-…)` reads
- A value that TypeScript also computes with moves to `editorUiConfig.ts` regardless of its row and is bound into CSS as a custom property
- `--vscode-*` appears only inside `tokens.css`; `--shiny-*` is defined only inside `tokens.css`; theme-conditional rules (`data-vscode-theme-kind`, `color-mix` recipes) exist only inside `tokens.css`
- A component may define custom properties only in its own namespace and only to carry data, never to author styling; a library component reads only `--shiny-*` tokens and variables it defines itself
- Deferral keywords (`transparent`, `none`, `currentColor`, `font: inherit`) are legal in component CSS — they author nothing
- A value with no home in this table is a table amendment, decided centrally — never a local exception

# CSS class naming

- Class names state the component's own states, parts, or variants — the axis that distinguishes them from each other — never the component's name (redundant with the file) or its domain role
- Name the contract, not the mechanism: what the class guarantees (`reservedBlank`), not how it is done (`hiddenAffordance`)

# styles.css

Limited to four sections: library stylesheet imports (incl. `tokens.css`), resets, document defaults, React Flow overrides (`.react-flow__*` only). Any other class selector is a violation.

# Interaction idioms

Cross-element visual language — one author each, expressed as tokens where the value is expressible in CSS, listed here where prose-shaped:

- Grip shapes: square = resize, circle = connection
- Dashed outline = provisional (gesture targets, placement previews)
- Cursor vocabulary: one cursor per interaction kind (tokens)
- Selection: one signal color for outline, handles, and selected strokes
- Glyph construction: 16×16 viewBox, whole/half-pixel grid, one stroke language (1.5px, round caps/joins), `currentColor` only, `aria-hidden`; exact coordinates always, Codicons/Lucide proportions as the metrics reference

# Enforcement

Automated scans: no literal values in `.module.css` for token-owned rows; no literal z-index; no `--shiny-*` definitions or `--vscode-*` reads outside `tokens.css`; no theme-conditional selectors outside `tokens.css`; no foreign custom properties read in library CSS; no `className`/`style` props on library components; no `.module.css` under chrome domain paths; interactive natives only under `ui/`.

Review checklist: label-plus-control rows use the layout template; new variant names are situational; class names follow the naming rule.

Deliberately unenforced: independent geometry literals (the residual category); spacing, until a rhythm scale promotes it to tokens.

Every category is scanned, on the checklist, or explicitly unenforced — silence is not a policy.
