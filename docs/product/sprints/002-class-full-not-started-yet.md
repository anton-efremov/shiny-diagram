# Sprint 002 — Full Class Diagram Editor

## 1. Goal

Bring the class diagram editor toward full Mermaid class diagram spec coverage, and turn Sprint 1's structural groundwork (typed `DiagramTree`, parallel edit formatters, palette tokens, `ui/` library) into real interactions: resizing, content-aware sizing, namespace rendering, and remaining Mermaid syntax.

## 2. Carried over from Sprint 1

Namespace **parsing** was completed during Sprint 1's restructure — `buildNamespaceNode`/`buildInNamespaceEdge` are wired into `diagramTreeBuilders.ts`, and `DiagramTree.namespaces`/`inNamespaceEdges` are populated. Only namespace **rendering** (below) remains.

## 3. Scope

### 3.1 Parser — remaining syntax gaps

- Old colon member syntax: `ClassName : member` (outside class body)
- Notes — `note for ClassName "text"` and `note "text"`
- Backtick-escaped class names — `` `Class Name With Spaces` ``
- Direction — `direction LR/TB` etc.
- `style` keyword — inline per-class style, distinct from `classDef`
- Links — `link ClassName "url"` (likely out of editor scope but should parse without erroring)

### 3.2 Resize handles (functional)

Resize handles on `ClassBox` are currently visual-only. Wire them to write new `w`/`h` to the `@spatial` annotation — parallel to drag, likely a `computeResizeEdit` alongside `computeDragEdit`, both built on `formatSpatialAnnotation`.

### 3.3 Box content overflow — wrap + clip

New `.memberRow` behavior: long member text wraps within the box's declared `w` (change `white-space: nowrap; text-overflow: ellipsis` to wrapping). The declared `h` remains a hard clip — `overflow: hidden`, fixed `height`, unchanged from today. If wrapped content exceeds `h`, the excess is clipped; nothing auto-grows.

`w`/`h` are simply what they say — a fixed rectangle. "Content doesn't fit" is a visible, user-fixable-by-dragging state (depends on 3.2), not an error or auto-resize.

### 3.4 Content-aware box sizing (Generate)

When Generate computes `w`/`h` for new or malformed boxes, size should be driven by the class's actual content (name, stereotype, member count/length) rather than the current fixed `200×150` default. Measure text via `CanvasRenderingContext2D.measureText()` against the `--shiny-classbox-*` metrics tokens already defined in `styles.css` and exported (unused) from `layoutAlgorithm/classBoxMetrics.ts`. This is where `computeNewBoxLayout`/`computeMalformedBoxLayout` — currently thin `gridPlacement` wrappers — start to diverge from each other and from pure grid placement.

### 3.5 Preserve partial data in malformed annotations

A malformed `@spatial` annotation may have some fields present (e.g. `x`/`y` but missing `w`/`h`). `computeMalformedBoxLayout` currently discards everything and grid-places from scratch. It should instead preserve whichever fields were successfully parsed, filling only the missing ones. Requires the parser to expose partial values from a malformed annotation (currently `MalformedAnnotation` likely only carries location, not partial fields — verify and extend).

### 3.6 Namespace rendering

Render `DiagramTree.namespaces`/`inNamespaceEdges` in the canvas via React Flow's `parentId` grouping, so classes visually nest inside their namespace.

### 3.7 ToolPane — drag-to-create

`ToolPane` currently renders a disabled palette of class/relationship element types (`aria-disabled`, `tabIndex={-1}`). Wire these to actual element creation — dragging a tool onto the canvas adds the corresponding Mermaid construct (new `class X {}` + `@spatial`, or a new relationship) via the edit-formatter pipeline.

### 3.8 StylePane — stroke and text color editable

`computeStyleEdit`/`formatStyleProperty` are already generalized over any `StyleProperty["property"]`. Only Fill currently has a color-picker in `StylePane`; Stroke and Text are display-only swatches. Add pickers for those two, reusing the existing Fill wiring.

## 4. Product decisions carried into this sprint

### No collision prevention, ever

Boxes may overlap. No collision detection on drag, no validity check on parse, no new `ParseResult` error category for overlapping `@spatial`. Deliberate product-wide simplicity choice — collision prevention would mean rejecting/flagging diagrams an AI just wrote (fights the AI-human co-creation goal) and adds real complexity (collision algorithm, drag-into-collision behavior) for a problem the user can already fix by dragging a box away.

## 5. Open questions / spikes

### Parser longevity

Before adding a second diagram type, evaluate whether Mermaid's `@mermaid-js/parser` (Langium-based) has matured enough to reconsider hand-written tokenizer/builders — and whether its AST carries usable source locations. Gates whether the diagram-type-after-next is "new type on current foundation" or "re-foundation first."

### Webview bundle size

Production build is ~3.6MB; roughly 40% (~1.4MB) is dead weight — `cytoscape.esm.js` (435KB, for `architectureDiagram`), `katex.js` (258KB), and ~700KB across unused diagram-type chunks (sequence/gantt/er/c4/mindmap/sankey/etc). These are pulled in because `mermaid.render()` triggers Mermaid's dynamic-import-all-diagram-types pattern even though Shiny only renders `classDiagram`. Investigate restricting registered diagram types so Vite can tree-shake the rest.

## 6. Explicitly deferred

### Reusing Mermaid's layout algorithm for Generate

Shelved. Mermaid's layout data (`getData()`, dagre `graphlib.Graph` with computed positions) sits between parsing and SVG rendering but is internal, unexported, and has no stability guarantee (there's an open Mermaid community request for exactly this — issue #3843, unresolved). Shiny will build its own layout algorithm for Generate instead — see 3.4 — rather than couple to Mermaid internals.

### Legend component and style-spawning naming convention

Noted from earlier discussion, not yet scoped: a persistent panel showing all `StyleDefNode`s (a "legend"), and a naming convention for AI/Generate-spawned styles (e.g. `Style1`, `Rose1` pattern) to avoid collisions with user-named `classDef`s. Needs further definition before this can be sized.