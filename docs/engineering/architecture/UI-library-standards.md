> **Implementation state:** Implemented and checker-enforced
> **Document state:** Maintained 
> **Scope:** `webview/src/ui/**`  
> **Goal** Must-follow standards of the UI library layer: what it owns, how it is structured, and where every style value is defined. Domain components consuming the library are governed by [react-standards](./react-standards.md); components are self-documenting — contracts live in code and file annotations, not in this document. `styles.css` governs itself through its header annotation.

Layer consumers, declared per layer: 
- the View domain tree consumes both wings
- Shell consumes the `chrome/` wing
- Controller, Bridge, and mermaidRenderer consume nothing from this layer — including tokens. 
- mermaidRenderer styles rendered diagram content outside the brand system: it owns its stylesheet, consumes `--vscode-*` directly, and never reads `--shiny-*`
Token consumption by cascade is part of the declared dependency: a `var(--shiny-*)` read in a non-consumer layer is a violation. How domain components consume the library is governed by [react-standards](./react-standards.md).

# Vocabulary

**Library** — a centralized repository of encapsulated UI elements, used by View components to reduce entropy in visual/behavioral representation by hard limitation of pattern variety

**Library component** — a component implemented in the UI library

**Wing** — one of the library's two identity areas, `chrome/` and `canvas/`

**Core** — the library's shared behavioral floor (`core/`): interaction machinery whose sameness across wings is semantic, not visual

**Tier** — the library composition level of an element — primitive, composite, or template — fixing what it may import from the library; determined by its folder path

**Primitives** — lowest-level reusable UI parts with fixed visuals and behavior, e.g. button with icon. Leaves of the library: they import nothing from it. Owns a design decision: it fixes which tokens/visual choices apply, removing that choice from consumers.

**Composites** — reusable UI elements assembled from primitives, other composites and native DOM elements, owning both their visuals and their interaction behavior — e.g. an editable field with fixed styling, commit/discard logic, and a validation error pop-up

**Templates** — structural UI containers that arrange, group, or frame other library elements without owning behavior

**Glyph descriptor** — pure geometry data (paths on the 16-grid, filled and dashed flags, optional anchor for marker use), typed in `shared/`. Domain components author domain-meaningful descriptors as content; a library element may own UI-pattern descriptors as private constants. The receiving element renders the descriptor and owns all treatment

# Library scope

### What is a library element

- Semantics, throughout this document, means the editor's subject matter: UML/Mermaid vocabulary (class, member, annotation, multiplicity, namespace) and what any rendered thing or reported event means to the diagram. Structural picture vocabulary — chrome, canvas, diagram, node, edge, grid — is not semantics: it names where and what the library draws, and is part of library knowledge
- An element is expressible in pure UI/behavior terms and semantic-blind; semantic decisions arrive only through props and variants
- Admitted only when its UI/behavior cannot be expressed by composing or configuring existing elements
- An element whose appearance is entirely determined by passed-in runtime values owns no decision and is not an element. Geometry-driven canvas elements (an edge taking path points, a box taking a rect) pass this test when they own the treatment around the received geometry — stroke identity, selection expression, hit policy

### Ownership

An element owns:

- Its visuals and their composition from tokens, per situation
- Its interaction behavior and local drafts — local view state held until an explicit outcome
- Its internal structure: owned children, private helpers, its stylesheet

An element never owns:

- Mermaid/UML semantic meaning of what it renders or reports — dispatch, transactions, and interpretation stay in domain components
- Editor knowledge: the state ledger, `editorCommands`, contexts, `editorUiConfig`, anything under `EditorRoot/**`
- Framework knowledge: framework libraries and their vocabularies

# Library structure

- **`chrome/`** — elements of panes and header
- **`canvas/`** — elements of diagram surfaces and overlays, assembled by consumers into diagram surfaces; user style values and glyph descriptors arrive as data props. Edge text placement along the path, compartment content semantics, and framework adapters are never library
- **`core/`** — behavioral machinery consumed by both wings: commit lifecycle, popup positioning and dismiss, keyboard patterns, gesture cursor override. Modules, not components: nothing rendered, no `.module.css`, no tokens. Admission test: if the wings' versions diverged, would that be a bug (core) or a design choice (wing)?
- Wings never import each other; visual coincidence between them is never a dependence. Core imports nothing from the wings
- Raw native interactive elements exist only inside the library — lint-enforced; wing and tier rules are boundary-checker-enforced by path

```
webview/src/ui/
├── tokens.css            the brandbook: --shiny-* definitions
├── core/
├── chrome/
│   ├── primitives/
│   ├── composites/
│   └── templates/
└── canvas/
    ├── primitives/
    ├── composites/
    └── templates/
```

# Library boundary

Inbound — how a consumer speaks to an element:

- UI props in, `on<Event>` handlers out; injected pure functions (e.g. `validate`) are permitted
- Situations are selected by variant; values are never passed for styling — no `className`, `style`, or visual-value props
- Glyph descriptors are content data, in the same category as text labels — legal at any icon or marker slot. The descriptor states geometry and the filled and dashed flags only; the receiving element owns all treatment: wrapper, stroke language, caps, color from tokens

Imports — what an element's files may reach:

| Tier | May import from the library |
|---|---|
| Primitives | `core/` only |
| Templates | `core/` only — children arrive as props |
| Composites | own wing's primitives and composites (acyclic), and `core/` |

- Additionally: React and browser APIs, own children, own `.module.css`, type-only imports from `shared/`
- Nothing editor-side or framework-side, per Ownership
- No root, wing, or tier barrels; direct imports from defining component files

Outbound — what an element exposes:

- The component and its boundary types; owned children, internal files, and `.module.css` are off-limits to consumers
- Consumers: the EditorRoot tree (both wings), Shell (`chrome/` wing only), and same-wing library composites — never Controller, Bridge, mermaidRenderer; `core/` is never imported outside the library

Stability:

- Contracts are stable by default: a mount-point need is met by the existing contract, proposed as a new variant or element through review, or escalated — contract changes are dedicated chunks, and the `ui/**` diff is a separate review artifact of every chunk touching it

# Component organization

### Structure

```
Dropdown/
├── Dropdown.tsx
├── Dropdown.module.css
└── OptionList/       owned child
```

- A component's wing and tier are its folder path
- Component folder closed set: `<Component>.tsx`, `<Component>.module.css`, owned children — imported only by the parent, never exported; they inherit the parent's wing and tier

### `<Component>.tsx`

#### File composition

- The component, its props type, and private helpers; the props type is the element's boundary type
- Exports: the component and its boundary types, nothing else

#### Naming

- Elements are named after their UI/behavior: `ResizeAffordance`, not `ClassResizeAffordance`; an element that cannot be named without a domain word does not belong in the library
- Standard UX pattern names are used bare when the element behaves exactly as the pattern implies: `Dropdown`
- A modifier prefix names an augmentation beyond the pattern's definition and carries its obligations: `Commit` (draft lifecycle), `Reserved` (space kept regardless of content state), `Affordance` (signals and reports an interaction on another element, never owns it), `Inline` (in-place canvas treatment: transparent ground, canvas type scale, treatment calibrated to sit inside diagram surfaces)
- Variant and option names are situational UI vocabulary ("inline", "compact", "secondary"), never domain words

#### Annotation

- `@behavior` / `@render` header stating non-derivable facts (variant map, non-obvious mechanisms) or omitted — a comment reconstructible from the filename is a violation

### `<Component>.module.css`

#### Ownership

- The element's visual composition: which parts express which situation, spacing of its internals
- Identity-bearing values (per Property ownership) are never stated locally — only `var(--shiny-…)` reads; internal geometry remains the element's literals
- Reads only `--shiny-*` tokens and variables the component defines itself; consumer-bound custom properties carry data, never styling

#### Style naming

- Class names state the component's own states, parts, or variants — the axis that distinguishes them from each other — never the component's name (redundant with the file) or its domain role
- Name the contract, not the mechanism: what the class guarantees (`reservedBlank`), not how it is done (`hiddenAffordance`)

#### Annotation

- `@render` header, same rule as `<Component>.tsx`: non-derivable facts or omit

# Brandbook organization — `tokens.css`

`tokens.css` is the brandbook: choosing values there is the brand work, and no separate brandbook document exists. It holds two visual identities — chrome and canvas — as its two sections, over a shared private Primitives section; a token is defined in its primary section and consumed anywhere its layer contract allows.

### Ownership

Which home a style value gets is decided by two questions:

- **Independence test** — can this value change alone, with nothing elsewhere becoming wrong? Yes → literal in the owning component's `.module.css`. No → one home by agreeing parties: internal to one component → its `.module.css`; siblings in one arrangement → the layout template; unrelated components → token; TypeScript is a party → `editorUiConfig.ts`, bound into CSS as a component-owned custom property; the user's diagram is a party → `stylePresets.ts`. Overlaps resolve in that reverse order. Mount count never enters the test.
- **Asserted vs emergent** — a dimension asserted regardless of content is identity and gets a home; a dimension emerging from content is not authored at all (only paddings and constraints are). A dependent value is computed from its one free variable (`calc()`, shared constant), never a second number kept equal by hand.

`tokens.css` owns the property groups the Property ownership table routes to it: color, type scale, line and border shape, shadows, cursor, identity opacity, control heights and compact widths.

### Style naming

- A token is named after what it is FOR, never after its value; area prefixes scope generic roles (`--shiny-chrome-font-size-label`, `--shiny-canvas-font-size-primary`); single-area concepts (field, button, edge) need no prefix; a token shared across both identities by design carries no prefix (`--shiny-glyph-stroke-width`)
- Consumers use tokens as-is: no local color-mix, alpha, or dimming — a use that needs a different value gets its own token

### Annotation

- The binding brand rules — naming law, value sourcing, theme variance, annotation discipline — are written in the file's own header annotation; this chapter describes the structure, the header is the law

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
| Stacking | `z-index` | `editorUiConfig.ts` — out of library scope; routed by domain components as a data prop, applied by the receiving element or framework adapter |
| Heights | `height`, `min-height`, `max-height` | `tokens.css`: on interactive controls and interaction affordances<br>owning component's `.module.css`: otherwise |
| Widths | `width`, `min-width`, `max-width` | `tokens.css`: on compact interactive controls and interaction affordances<br>arranging template's `.module.css`: on fluid interactive controls<br>owning component's `.module.css`: otherwise |
| Box geometry | `padding`, `margin`, `inset`, `top`, `right`, `bottom`, `left`, `transform` | owning component's `.module.css` |
| Layout | `display`, `flex-*`, `grid-*`, `gap`, `align-*`, `justify-*`, `overflow` | owning component's `.module.css` |
| Interaction toggles | `visibility`, `pointer-events` | owning component's `.module.css` |
| Text emphasis | `font-style`, `text-decoration-line` | owning component's `.module.css`: binary state expression selected by variant — no authored value exists |

Corollaries:

- Only library components own a `.module.css`; the four legacy canvas surfaces (ClassBox, NoteBox, NamespaceBox, RelationshipEdge) are checker-allowlisted until their assembly migrations and follow this table in their own CSS
- For values owned by `tokens.css`, component CSS contains no raw values — only `var(--shiny-…)` reads
- A component may define custom properties only in its own namespace and only to carry data, never to author styling
- Deferral keywords (`transparent`, `none`, `currentColor`, `font: inherit`) are legal in component CSS — they author nothing
- Spacing literals stay unpromoted until a rhythm scale enters `tokens.css`
- A value with no home in this table is a table amendment, decided centrally — never a local exception
