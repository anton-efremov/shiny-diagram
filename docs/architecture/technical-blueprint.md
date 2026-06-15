# Technical Blueprint

## Stack

|Concern|Technology|
|---|---|
|Extension host runtime|Node.js / VS Code Extension API|
|Extension host language|TypeScript 5, compiled to CommonJS via `tsc`|
|Webview runtime|Chromium (VS Code WebView)|
|Webview language|TypeScript 5 + React 19, bundled via Vite|
|Diagram rendering|Mermaid 11|
|Visual editor canvas|React Flow (`@xyflow/react` 12)|
|Formatter|Prettier|
|Linter|ESLint 9 (flat config)|

## Runtime architecture

Shiny follows the standard VS Code extension model: an extension host process running in Node.js, paired with a Chromium WebView for the visual interface. These are isolated runtimes with no shared memory. All communication crosses the boundary via `postMessage` as JSON messages with a `type` discriminant field.

The boundary is hard. `extension-host/` has no browser APIs. `webview/src/` has no `vscode` module imports.

### Data flow

```
Extension Host (Node.js)                  WebView (Chromium)
────────────────────────                  ──────────────────────────────────────

 .mmd file                                 ┌─ parseDiagram() ──► ParseResult
     │                                     │        │          (DiagramTree on success)
     └────── raw source ──────────────────►│        ▼
                                           │  toClassBoxNodeDescriptors()
                                           │  toRelationshipEdgeDescriptors() ──► React Flow
     ▲                                     │
     │                                     └─ mermaid.render() ──► SVG (Autorender view)
     │                                              │
     └──────────── LineEdit[] ──────────────────────┘
```

**Extension host → webview:** raw Mermaid source text. The extension host has no knowledge of Mermaid semantics.

**Webview → extension host:** `LineEdit[]` (`{ lineNumber, newText }` — replace-line operations) describing the minimal text changes required by a user edit. The extension host applies these to disk and nothing else.

**Webview internal pipeline:**

1. Receives raw Mermaid source (initial data on open, `sourceUpdate` messages on manual edits)
2. `parseDiagram(sourceText)` — see `parsers/classDiagram/index.ts` — returns a `ParseResult`: `{ ok: true, model: DiagramTree }` on success, or an `invalidSyntax` / `missingAnnotations` error variant
3. On success, `DiagramTree` is transformed into React Flow nodes/edges via `toClassBoxNodeDescriptors`/`toRelationshipEdgeDescriptors` (`reactFlowAdapters.ts`) for the Editor view
4. `mermaid.render()` converts raw source to SVG for the Autorender view (`useAutorender.ts`)
5. On a user edit (drag, style change, Generate), the webview computes `LineEdit[]` using `SourceLocation` data from `DiagramTree`, via `computeDragEdit` / `computeStyleEdit` / `computeGenerateEdits` (`formatters/classDiagram/`), and posts an `ApplyEditsMessage`

All Mermaid knowledge — parsing, the diagram tree, spatial logic, edit computation — lives exclusively in the webview.

### Extension host

The extension host is a Node.js process managed by VS Code. When the user runs `shiny.openDiagram` it:

- Creates a WebviewPanel — a sandboxed Chromium iframe alongside the editor
- Generates the initial HTML and injects the source text into it
- Obtains a reference to the active `.mmd` TextDocument — VS Code's in-memory representation of the file
- Instantiates a `DiagramSession` object in memory — a stateful collection of event handlers that holds references to both the document and the webview panel, and routes messages between them with minimal logic: debouncing manual edits before pushing to the webview, and suppressing change notifications triggered by Shiny's own writes

The extension host is otherwise passive — it reacts to events rather than driving anything. All diagram understanding, parsing, and rendering logic lives in the webview.

`extension.ts` is a wiring file only — it registers commands and sets up listeners. All substantive logic lives in dedicated modules (`diagramSession.ts`, `webviewProvider.ts`).

The message protocol (`protocol.ts`) is duplicated between `extension-host/protocol.ts` and `webview/src/extensionBridge/protocol.ts`, kept in sync manually — both runtimes need the types but cannot share a module across the boundary.

### Webview

Owns everything Mermaid-related: parsing, the diagram tree, spatial annotation logic, React Flow rendering, user interactions, and edit computation. Sends `LineEdit[]` to the extension host and never touches the filesystem directly.

## Code structure

### State ownership

The source file is the single source of truth. The extension host owns all durable state. The webview holds only UI-local state — `mode`, `selectedClassId` — plus `sourceText`, a synced copy of the source pushed by the extension host via `sourceUpdate`. Everything else (`DiagramTree`, React Flow nodes/edges, class boxes) is derived from `sourceText` via `useMemo`.

### Component pattern

Most components are presentational: props in, JSX out (`ClassBox`, `AppHeader`, `Toggle`, `StylePane`, `ToolPane`). State and handlers are owned by container components one level up:

- `App` owns `mode` and `sourceText`
- `EditorView` owns `selectedClassId` and the edit handlers (`handleNodeDragStop`, `handleFillColorChange`, `handleGenerate`)
- `ClassDiagram` owns React Flow's `nodes`/`edges` state and its change handlers

A component gets its own colocated hook (`use*.ts`) when its logic is substantial and largely independent of rendering:

```
components/
└── AutorenderView/
    ├── AutorenderView.tsx       ← props in, JSX out
    ├── AutorenderView.module.css
    └── useAutorender.ts          ← Mermaid init + render lifecycle
```

Currently `useAutorender` is the only such hook. Pure transformations (no React state) live in `parsers/`, `formatters/`, or `models/` — never inline in components.

### Folder structure

```
webview/src/
├── App.tsx                  — owns mode + sourceText state, renders the app shell
├── App.module.css
├── main.tsx
├── styles.css                — design tokens, base/default styles, React Flow import
│
├── extensionBridge/           — postMessage protocol, typed messages, initial data, type guards
│
├── models/classDiagram/       — DiagramTree, branded ID types, primitives:
│                                 the parser ↔ component contract
│
├── parsers/classDiagram/       — tokenizer + builders → DiagramTree (see Parser structure)
│
├── formatters/classDiagram/    — compute*Edit(s) → LineEdit (see Parser structure)
│
├── components/                 — UI components; one folder per component, with
│                                 sub-components nested (e.g. EditorView/ClassDiagram/ClassBox/)
│
└── ui/                          — shared component library, built gradually
                                    (Toggle so far — see design-system.md)
```

`extension-host/` is flat: `extension.ts`, `diagramSession.ts`, `webviewProvider.ts`, `protocol.ts` — no Mermaid knowledge, no subfolders needed at current size.

Future diagram types add a sibling folder under `models/`, `parsers/`, and `formatters/` (e.g. `parsers/sequenceDiagram/`). Shared utilities move to a `shared/` sibling when genuine reuse emerges across diagram types — none yet.

### Parser structure

```
models/classDiagram/
  primitives.ts            — SourceLocation; branded ID types (ClassId, StyleDefId,
                              NamespaceId, TreeNodeId) + toClassId/toStyleDefId/toNamespaceId casters
  diagramTreeModel.ts       — DiagramTree (6 typed containers) and node/edge types:
                              ClassNode, StyleDefNode, NamespaceNode, StyleProperty, SpatialData, etc.

parsers/classDiagram/
  tokenizer.ts              — tokenize(source) → ParseToken[]; recursive (tokenizeLines),
                              groups nested blocks (class bodies, namespaces) via blockTokens
  diagramTreeBuilders.ts    — pipeline: buildSpatiallyUnawareDiagramTree →
                              synthesizeImplicitClassNodes → parseSpatialAnnotations → attachSpatial
  builders/                 — one builder per construct: buildClassNode, buildRelationshipEdge,
                              buildStyleDefNode, buildAppliesStyleEdge, buildNamespaceNode,
                              buildInNamespaceEdge, buildSpatialData, toSourceLocation
  index.ts                  — parseDiagram(source) → ParseResult
```

`DiagramTree` holds six typed containers: `classes`, `styleDefs`, `namespaces` (`Map`s keyed by branded IDs) and `relationships`, `appliesStyleEdges`, `inNamespaceEdges` (arrays of edges referencing those IDs). Components read directly from the container they need — no filtering a mixed collection by kind.

**`tokenize()`** produces a recursive `ParseToken[]` tree — nesting (namespaces containing classes, classes containing members) is uniform recursion via `tokenizeLines`/`blockTokens`, with no special-casing per nesting level.

**`buildSpatiallyUnawareDiagramTree`** is a single traversal of that token tree, calling the matching builder for each construct it encounters and assembling `DiagramTree`. **`synthesizeImplicitClassNodes`** then adds a `ClassNode` (with `location: null`) for any relationship endpoint that has no explicit `class X { }` declaration. **`parseSpatialAnnotations`** and **`attachSpatial`** are separate passes that locate `%% @spatial:...` comments and attach `SpatialData` to the matching class.

**`index.ts`** orchestrates the pipeline and returns `ParseResult`: `{ ok: true, model: DiagramTree }`, or `{ ok: false, error: "invalidSyntax", message }`, or `{ ok: false, error: "missingAnnotations", model, missingIds, malformedAnnotations }`.

```
formatters/classDiagram/
  computeDragEdit.ts         — LineEdit (drag a box → new @spatial)
  computeStyleEdit.ts         — LineEdit (style property change → new classDef)
  computeGenerateEdits.ts      — LineEdit[] (Generate button)
  formatLines.ts                — formatSpatialAnnotation, formatStyleProperty:
                                  write-side mirrors of the builders above
  layoutAlgorithm/
    classBoxMetrics.ts          — reads box-sizing tokens from styles.css
    gridPlacement.ts             — grid placement primitive (computeStartY + gridPlacement)
    computeNewBoxLayout.ts        — layout for classes with no @spatial annotation
    computeMalformedBoxLayout.ts   — layout for classes with an incomplete @spatial annotation
```

Each `compute*Edit(s)` function returns `LineEdit`/`LineEdit[]` directly — components never construct `{ lineNumber, newText }` themselves. `format*` functions in `formatLines.ts` are internal string-building primitives, each the write-side mirror of one builder (e.g. `formatSpatialAnnotation` mirrors `buildSpatialData`).

Future diagram types add sibling folders under `models/`, `parsers/`, and `formatters/`.

## Design decisions

### Shiny owns its own Mermaid parser

**Decision:** Shiny parses Mermaid source directly using its own tokenizer/builder pipeline rather than Mermaid's internal APIs.

**Rationale:** Mermaid's public commitment is to the language spec, not its internal `db`/`parser`/`renderer` architecture. Internal APIs (`mermaidAPI`, `Diagram.fromText`, `diagram.db`) are deprecated, unstable, or unexported. Shiny's parser targets the language syntax directly, making it immune to Mermaid internal refactors. The Mermaid class diagram grammar is small enough that owning the parser is a reasonable investment.

**Alternative considered:** Use `mermaidAPI.getDiagramFromText()` to access Mermaid's internal parsed db. Rejected because `mermaidAPI` is deprecated in Mermaid 11, `Diagram` is not publicly exported, and the internal API surface has no stability guarantee.

**Open question:** before adding a second diagram type, evaluate whether Mermaid's newer `@mermaid-js/parser` (Langium-based) has matured enough to reconsider — tracked as an architecture note in the sprint 002 plan.

### Tokenizer-first parsing with a single-traversal builder pipeline

**Decision:** `tokenize()` produces a recursive `ParseToken[]` tree (nesting handled uniformly via `tokenizeLines`/`blockTokens`). A single traversal (`buildSpatiallyUnawareDiagramTree`) walks this tree once, calling one builder per construct to assemble `DiagramTree`. Spatial annotations are parsed and attached in separate, later passes.

**Rationale:** Mermaid class diagram syntax is line-oriented and unambiguous — each line's type is determinable from its first token. A single traversal with per-construct builders avoids re-scanning the token stream once per concern, while each builder stays small and independently testable. Uniform recursion means spatial annotations and constructs are valid at any nesting level (e.g. inside a namespace) with no special-casing.

**Alternative considered (superseded during Sprint 1):** Four independent rule passes (classes, relationships, styles, namespaces), each scanning the full token stream separately. Replaced because of redundant scanning, and because namespace-nested constructs needed special-casing in each rule rather than uniform recursion.

### SourceLocation on every parsed construct, nullable for synthesized classes

**Decision:** Every parsed construct carries a `SourceLocation` (line number + raw text) in `primitives.ts`. The one exception is `ClassNode.location`, which is `null` for classes synthesized by `synthesizeImplicitClassNodes` — relationship endpoints with no explicit `class X { }` declaration.

**Rationale:** The edit-computation layer needs to locate and update exact source lines when the user makes an edit (move box, change color, Generate). Without `SourceLocation`, it would need a second parse pass or a regex search at edit time. Capturing location during the initial parse eliminates that cost and makes edits precise. For implicit classes, there genuinely is no source line — `location: null` makes that explicit in the type system rather than pointing at an arbitrary or nonexistent line; such classes fall into `missingAnnotations` and are handled by Generate.

### DiagramTree as the parser-to-component contract, in typed containers

**Decision:** `models/classDiagram/{primitives,diagramTreeModel}.ts` define `DiagramTree` and all types that flow from the parser to components, returned inside `ParseResult` (`parsers/classDiagram/index.ts`). Components never receive raw source text. `DiagramTree` splits its contents into six typed containers — `classes`, `styleDefs`, `namespaces` (`Map`s keyed by branded IDs) and `relationships`, `appliesStyleEdges`, `inNamespaceEdges` (arrays) — rather than one mixed collection, and branded ID types (`ClassId`, `StyleDefId`, `NamespaceId`, `TreeNodeId`) prevent using one container's key as another's.

**Rationale:** A stable typed contract lets both sides evolve independently — the compiler enforces it, so a parser output change that breaks a component is a compile error, not a runtime surprise. Typed containers eliminate kind-filtering in components (no `items.filter(i => i.kind === "class")`); branded IDs eliminate a category of bugs where a `StyleDefId` is accidentally used to look up `classes`.

### All Mermaid knowledge lives in the webview

**Decision:** The extension host is a dumb pipe. It sends raw source to the webview and applies `LineEdit[]` it receives back. All parsing, diagram tree construction, spatial logic, and edit computation live in the webview.

**Rationale:** Keeping all Mermaid knowledge in one runtime eliminates duplication across the `postMessage` boundary and means adding a new diagram type requires no extension host changes.

### Line-edit based protocol

**Decision:** The webview sends `LineEdit[]` (`{ lineNumber, newText }` — replace-line operations) to the extension host via `ApplyEditsMessage`, not full patched source strings or generic diffs.

**Rationale:** The webview has full model context at edit time and can compute the minimal surgical change using `SourceLocation` data. A single `LineEdit` can also express "replace this line with itself plus N new lines" — used by `computeGenerateEdits` to append multiple new `@spatial` annotations in one edit, avoiding the line-number drift that sequential single-line inserts would cause.

**Alternative considered:** Webview sends the complete patched source string. Rejected because it is imprecise and couples payload size to file size unnecessarily.

### Extension host as the sole file writer

**Decision:** The extension host is the only layer that writes `.mmd` files.

**Rationale:** Centralizing file mutation makes the source-of-truth contract enforceable and ensures Shiny-originated edits can be distinguished from manual edits, preventing re-render loops.

### Container components own state; presentational components don't

**Decision:** Most components are props-in/JSX-out (`ClassBox`, `AppHeader`, `Toggle`, `StylePane`, `ToolPane`). State and handlers live in container components one level up (`App`, `EditorView`, `ClassDiagram`). A component gets its own colocated `use*.ts` hook only when its logic is substantial and largely independent of rendering — currently only `useAutorender`. Pure transformations live in `parsers/`, `formatters/`, or `models/`.

**Rationale:** Separates rendering concerns from logic concerns without imposing a hook on every component regardless of need — most components have no logic worth extracting, and forcing a colocated hook on each would add files without adding clarity.

---

Webview styling conventions — design tokens, CSS Modules, the `ui/` component library — are documented separately in `design-system.md`.