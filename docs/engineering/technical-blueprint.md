# Technical Blueprint

## 1. Stack

### 1.1 Stack list

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

### 1.2 Design decisions made

#### React Flow as the visual editor canvas

**Decision:** Use React Flow (`@xyflow/react` 12) as the rendering/interaction substrate for the Editor view canvas — node/edge graph model, pan/zoom, drag, and selection.

**Rationale:** Provides canvas mechanics (pan/zoom, drag-to-move, a node/edge graph model) without building them from scratch.

**Known constraints:** Fits node/edge-style diagrams naturally, but a poor fit for diagram types with different visual grammars — e.g. Gantt charts, sequence diagrams. Could be forced in, but at increasing cost; revisit with the second diagram type.

#### Shiny owns its own Mermaid parser

**Decision:** Shiny parses Mermaid source directly using its own tokenizer/builder pipeline rather than Mermaid's internal APIs.

**Rationale:** Mermaid's public commitment is to the language spec, not its internal `db`/`parser`/`renderer` architecture. Internal APIs (`mermaidAPI`, `Diagram.fromText`, `diagram.db`) are deprecated, unstable, or unexported. Shiny's parser targets the language syntax directly, making it immune to Mermaid internal refactors. 
The Mermaid class diagram grammar is small enough that owning the parser is a reasonable investment.

**Alternative considered:** Use `mermaidAPI.getDiagramFromText()` to access Mermaid's internal parsed db. Rejected because `mermaidAPI` is deprecated in Mermaid 11, `Diagram` is not publicly exported, and the internal API surface has no stability guarantee.

---

## 2. High-level architecture

Shiny follows the standard VS Code extension model consisting of: 
- an extension host process running in Node.js
- a Chromium WebView for the visual interface
These are isolated runtimes with hard boundary: 
- all communication crosses the boundary via `postMessage`, as JSON messages. 
- `extension-host/` has no browser APIs, and `webview/src/` has no `vscode` module imports.

### 2.1 Runtime view

#### Extension Host

A Node.js process managed by VS Code:
- has the sole write access to the `.mmd` document on disk.
- reacts to events, debounces and routes messages.
- holds no Mermaid or diagram-semantic knowledge.

#### Webview

A React app rendered inside a sandboxed Chromium iframe:
- responsible for editor's UI
- fully owns Mermaid-related logic: parsing, the diagram tree, spatial annotation logic, rendering for both the Editor and Autorender views, user interactions, and edit computation
- isolated from a filesystem - communicates through `postMessage` with extension host

#### Protocol

All messages cross the `postMessage` boundary as JSON objects with a `type` discriminant field. 

**Host → Webview**

- `type SourceUpdateMessage`: `{ type: "sourceUpdate", sourceText: string }`. Carries the complete current source text. Sent when:
	- A manual document edit's debounce settles.
	-  The host has just applied a Shiny-originated edit, to resync the webview immediately without waiting for the debounce.
- Different mechanism on **initial load**, not a `postMessage`: the host serializes the initial source text into a `#shiny-initial-data` `<script type="application/json">` tag in the webview's HTML (`webviewProvider.ts`). The webview reads it once on startup via `readInitialData()`.

**Webview → Host**

- `applyEdits` (`ApplyEditsMessage`): `{ type: "applyEdits", edits: LineEdit[] }`. Sent when a visual edit (drag, style change, Generate) needs to be written back to source.
    - `LineEdit` is `{ lineNumber: number, newText: string }` — replace the entire line at `lineNumber` with `newText`.
    - The host applies all edits in one transaction (`vscode.WorkspaceEdit`), in order.

### 2.2 Code structure

```
project/
├── extension-host/
└── webview/src/
```
**Note:** to keep folders isolated, communication protocol isn't shared from a common module. Thus type definitions are duplicated and kept in sync manually in
- `extension-host/protocol.ts`
- `webview/src/extensionBridge/protocol.ts`

### 2.3 Design decisions made

##### All Mermaid knowledge lives in the webview

**Decision:** The extension host is a dumb pipe. It sends raw source to the webview and applies the `LineEdit[]` it receives back. All parsing, diagram tree construction, spatial logic, and edit computation live in the webview.

**Rationale:** The Autorender view needs the full raw source in the webview regardless (to call `mermaid.render()`). Given the host already sends the whole source, keeping all Mermaid knowledge there too avoids splitting parsing/logic across the boundary and duplicating it on both sides.

#### Line-edit based protocol

**Decision:** The webview sends `LineEdit[]` (`{ lineNumber, newText }` — whole-line replacements) to the extension host via `ApplyEditsMessage`, not full patched source strings or generic diffs.

**Rationale:** 
- keeps the extension host dumb — no diffing or merging logic on the host side 
- still flexible enough: `newText` can itself be multiple lines, so a single `LineEdit` can append new lines after the target line

**Alternative considered:** Webview sends the complete new file content; host overwrites the file wholesale. Rejected because:
- single edit requires full-file size message
- undermining the "review in Git" feature - diffs are not local and thus not useful

---
## 3. Extension host architecture

### 3.1 Host runtime behavior

#### Launching

When the user runs `shiny.openDiagram` or clicks Shiny extension button, the extension host:

- Creates a `WebviewPanel` — a sandboxed Chromium iframe alongside the editor.
- Generates the initial HTML and injects the source text into it.
- Obtains a reference to the active `.mmd` `TextDocument` — VS Code's in-memory representation of the file.
- Instantiates a `DiagramSession` object in memory — a stateful collection of event handlers that holds references to both the document and the webview panel.

#### Managing session

`DiagramSession` routes messages between the document and the webview with minimal logic:

- Listens for `onDidReceiveMessage` (webview → host) and `onDidChangeTextDocument` (VS Code → host).
- On `applyEdits` message: builds a `vscode.WorkspaceEdit`, applies all line replacements as one transaction, marks the change as Shiny-originated (`shinyOriginatedEdit` flag), then immediately pushes a `sourceUpdate` back to resync the webview.
- On a document change: if it's the just-applied Shiny-originated edit, the flag `shinyOriginatedEdit` is consumed and the change is skipped — preventing a re-render feedback loop. Otherwise, the change schedules a debounced (500ms) `sourceUpdate` push.

**Known caveat**: the Shiny-originated flag isn't race-condition-safe if a user edit and a Shiny edit land in the same event-loop tick. Safe in practice, but worth revisiting if sync issues arise.

#### Cleaning up

On panel close (`panel.onDidDispose`), the session's `dispose()` cancels any pending debounce timer and releases both registered listeners.

### 3.2 Code structure

- `extension.ts` — wiring only: registers `shiny.openDiagram`, creates the `WebviewPanel`, instantiates `DiagramSession`, registers disposables.
- `diagramSession.ts` defines `DiagramSession` class for session objects:
	- states held: references to the open document and the webview panel, a debounce timer, disposal tokens for registered listeners, and a flag distinguishing Shiny-originated edits from manual ones
	- defines event handlers for incoming webview messages and document change events
	- registers both handlers as callbacks in the constructor
- `webviewProvider.ts` — defines `getWebviewHtml()` that builds the webview's HTML document — CSP, asset URIs, nonce generation, and serialization of the initial source into `#shiny-initial-data`.
- `protocol.ts` — message type definitions (host's copy — see 2.1 Protocol).

---

## 4. Webview architecture

### 4.1 High-level webview architecture

#### 4.1.1 Runtime view

The webview is a single React app running in one V8 instance inside the Chromium iframe — everything below is synchronous in-process data flow, except at its two edges: receiving `sourceUpdate` and sending `applyEdits` across the `postMessage` boundary.

1. **Receiving source** — `App` is the only entry point for source updates after initial load:
	- listens for `message` events on `window` of a type `sourceUpdate` 
	- owns `sourceText` state and `view` state (autorenderer/editor)
	
2. **Parsing** — the parser (exposed through `parseDiagram(sourceText)`) converts `sourceText` into an in-memory representation of the diagram as a `DiagramTree`:
	- called from `App` via `useMemo`, recomputed whenever `sourceText` changes
	- returns a `ParseResult`: `{ ok: true, model: DiagramTree }` on success, or an `invalidSyntax`/`missingAnnotations` error variant on failure
	- `DiagramTree` holds all styled diagram information in a form of a tree, that includes
		  - functional diagram elements: nodes (`classes` , `namespaces`) and edges (`relationships`)
		  - namespace-contains relationships (`inNamespaceEdges`)
		  - diagram styles: `styleDefs` as nodes and `appliesStyleEdges` as edges connecting certain style to certain `classes`
	
3. **UI rendering** — React components render the active view (`App` owns state `view`):
	- **Editor view**:
		- `EditorView`/`ClassDiagram` converts `DiagramTree` into a React Flow graph through `reactFlowAdapters.ts` 
		- **React Flow** renders the canvas, edges, and pan/zoom and imports `ClassBox` to render classes
		- `ClassBox` renders each class node's content (header, fields, methods), 
	- **Autorender view** — `useAutorender` calls `mermaid.render()` on `sourceText` directly, producing an SVG string displayed as-is — bypasses `DiagramTree` entirely, a separate route that can render even when parsing fails

4. **Computing edits** — formatters take a `DiagramTree` node and required update derived from user action and calculate whole-line replacements `LineEdit[]` (each a `{ lineNumber, newText }`)
	- `computeDragEdits` - processes user dragging a box
	- `computeStyleEdits` - processes user changing a style of a box
	- `computeGenerateEdits` - processes click on "Generate" button (malformed/missing annotations)
	
5. **Sending edits** — the component that computed the edit wraps `LineEdit[]` in an `ApplyEditsMessage` (`{ type: "applyEdits", edits }`) and sends it via `vscode.postMessage`, crossing back out to the host (see 2.1 Protocol):
	- `EditorView` sends drag and style edits (`computeDragEdit`, `computeStyleEdit`)
	- `App` sends Generate edits (`computeGenerateEdits`), triggered from `AppHeader`'s Generate button

**Initial data:** step 1's `sourceText` state is seeded once at startup from `#shiny-initial-data` (read via `readInitialData()`), not from a `sourceUpdate` message — see 2.1 Protocol.

#### 4.1.2 Code structure

**Main functional blocks:**

- `App.tsx`)— owns `sourceText` and `view` state, renders the app shell (`AppHeader` + active view)
- `components/` — UI components, one folder per component (see 4.4.2)
- `parsers/classDiagram/` — exposes `parseDiagram(sourceText) → ParseResult` (see 4.2.2)
- `formatters/classDiagram/` — exposes `computeDragEdit`, `computeStyleEdit`, `computeGenerateEdits` → `LineEdit`/`LineEdit[]` (see 4.3.2)
- `models/classDiagram/` — exposes `DiagramTree` and its types: the contract between parsers and components (see 4.2.2)

**Support blocks:**

- `extensionBridge/` — `postMessage` protocol types, initial data reader, type guards, `vscode` API handle
- `ui/` — shared component library, built gradually (`Toggle` so far — see `design-system.md`)
- `styles.css` — design tokens, base/default styles, React Flow base import (see `design-system.md`)
- `main.tsx` — app entry point

Future diagram types add a sibling folder under `models/`, `parsers/`, and `formatters/` (e.g. `parsers/sequenceDiagram/`). Shared utilities move to a `shared/` sibling when genuine reuse emerges across diagram types — none yet.

#### 4.1.3 Design decisions made

##### Container components own state; presentational components don't

**Decision:** Most components are props-in/JSX-out (`ClassBox`, `AppHeader`, `Toggle`, `StylePane`, `ToolPane`). State and handlers live in container components one level up. A component gets its own colocated `use*.ts` hook only when its logic is substantial and largely independent of rendering — currently only `useAutorender`. Pure transformations live in `parsers/`, `formatters/`, or `models/` — never inline in components.

**Rationale:** Separates rendering concerns from logic concerns without imposing a hook on every component regardless of need — most components have no logic worth extracting, and forcing a colocated hook on each would add files without adding clarity.

---

### 4.2 Models & parser architecture (class diagram)

#### 4.2.1 Runtime view

1. **Tokenizing** — `tokenize(source)`:
	- input: raw Mermaid source
	- recursive: `tokenizeLines` groups nested blocks (class bodies, namespaces) via `blockTokens`, uniform at any nesting level
	- output: `ParseToken[]` tree

2. **Building the tree** — `buildSpatiallyUnawareDiagramTree`:
	- input: `ParseToken[]` tree
	- single traversal, one builder per construct (`builders/`, see 4.2.2)
	- output: `DiagramTree`, no spatial data yet

3. **Synthesizing implicit classes** — `synthesizeImplicitClassNodes`:
	- input: `DiagramTree` from step 2
	- adds a `ClassNode` (`location: null`) for any relationship endpoint with no explicit `class X {}` declaration
	- output: `DiagramTree` with all referenced classes present

4. **Attaching spatial data** — `parseSpatialAnnotations` + `attachSpatial`:
	- input: token tree (for `%% @spatial:...` comments) + `DiagramTree` from step 3
	- locates spatial comments, matches each to its class
	- output: `DiagramTree` with `SpatialData` attached where present

5. **Returning the result** — `parseDiagram` (`index.ts`), orchestrates steps 1–4:
	- `{ ok: true, model: DiagramTree }` — full success
	- `{ ok: false, error: "invalidSyntax", message }` — not a recognisable `classDiagram`
	- `{ ok: false, error: "missingAnnotations", model, missingIds, malformedAnnotations }` — parsed, but one or more classes lack a valid `@spatial`

#### 4.2.2 Code structure

- `models/classDiagram/`:
	- `primitives.ts` — `SourceLocation`; branded ID types (`ClassId`, `StyleDefId`, `NamespaceId`, `TreeNodeId`) + casters
	- `diagramTreeModel.ts` — `DiagramTree` (6 typed containers) and node/edge types: `ClassNode`, `StyleDefNode`, `NamespaceNode`, `StyleProperty`, `SpatialData`, etc.
- `parsers/classDiagram/`:
	- `tokenizer.ts` — `tokenize(source) → ParseToken[]` (step 1)
	- `diagramTreeBuilders.ts` — steps 2–4: `buildSpatiallyUnawareDiagramTree`, `synthesizeImplicitClassNodes`, `parseSpatialAnnotations`, `attachSpatial`
	- `builders/` — one builder per construct: `buildClassNode`, `buildRelationshipEdge`, `buildStyleDefNode`, `buildAppliesStyleEdge`, `buildNamespaceNode`, `buildInNamespaceEdge`, `buildSpatialData`, `toSourceLocation`
	- `index.ts` — `parseDiagram(source) → ParseResult` (step 5)

#### 4.2.3 Design decisions made

##### Tokenizer-first parsing with a single-traversal builder pipeline

**Decision:** Single traversal (`buildSpatiallyUnawareDiagramTree`) over a recursive token tree (`tokenize()`), one builder per construct; spatial annotations parsed and attached in separate, later passes (pipeline detailed in 4.2.1).

**Rationale:**
- Mermaid class diagram syntax is line-oriented and unambiguous — each line's type is determinable from its first token
- a single traversal with per-construct builders avoids re-scanning the token stream once per concern, while each builder stays small and independently testable
- uniform recursion means constructs and spatial annotations are valid at any nesting level (e.g. inside a namespace), with no special-casing

**Alternative considered (superseded during Sprint 1):** Four independent rule passes (classes, relationships, styles, namespaces), each scanning the full token stream separately. Replaced because of redundant scanning and per-rule namespace special-casing.

##### SourceLocation on every parsed construct, nullable for synthesized classes

**Decision:** Every parsed construct carries a `SourceLocation` (line number + raw text) in `primitives.ts`, except `ClassNode.location`, which is `null` for classes synthesized by `synthesizeImplicitClassNodes`.

**Rationale:**
- the edit-computation layer needs exact source lines to locate and update on a user edit (move, color change, Generate) — capturing location at parse time avoids a second pass or regex search at edit time
- for implicit classes there genuinely is no source line; `location: null` makes that explicit in the type system rather than pointing at an arbitrary line — such classes fall into `missingAnnotations`, handled by Generate

##### DiagramTree as the parser-to-component contract, in typed containers

**Decision:** `DiagramTree` and all parser-to-component types are defined in `models/classDiagram/{primitives,diagramTreeModel}.ts`, returned inside `ParseResult`. Components never receive raw source text. Six typed containers, plus branded ID types — shapes detailed in 4.2.2.

**Rationale:**
- a stable typed contract lets parser and components evolve independently — a breaking parser change becomes a compile error, not a runtime surprise
- typed containers eliminate kind-filtering in components (no `items.filter(i => i.kind === "class")`)
- branded IDs eliminate a category of bug where one container's key is used to look up another

---

### 4.3 Formatter architecture (class diagram)

#### 4.3.1 Runtime view

Each `compute*Edit(s)` function returns `LineEdit`/`LineEdit[]` directly — components never construct `{ lineNumber, newText }` themselves (see 4.1.1 step 4).

1. **`computeDragEdit`** — box moved to new `x`/`y`:
	- input: `ClassNode` (`SourceLocation`), new `x`/`y`
	- `formatSpatialAnnotation` (`formatLines.ts`) builds the replacement `@spatial` line
	- output: `LineEdit`

2. **`computeStyleEdit`** — style property changed:
	- input: `StyleDefNode` (`SourceLocation`), property name, new value
	- `formatStyleProperty` (`formatLines.ts`) builds the replacement `classDef` line
	- output: `LineEdit`

3. **`computeGenerateEdits`** — Generate clicked, for classes with missing/malformed `@spatial`:
	- input: `DiagramTree`, `missingIds`, `malformedAnnotations`, `sourceText`
	- `layoutAlgorithm/` computes positions (`gridPlacement`, `computeNewBoxLayout`/`computeMalformedBoxLayout`); `formatSpatialAnnotation` builds each line
	- output: `LineEdit[]` — one replacement per malformed annotation, plus one append edit for newly-placed classes

`formatLines.ts` — string-building primitives used by all three above; mirrors the parser's builders (see 4.3.3).

#### 4.3.2 Code structure

- `formatters/classDiagram/`:
	- `computeDragEdit.ts` — step 1
	- `computeStyleEdit.ts` — step 2
	- `computeGenerateEdits.ts` — step 3
	- `formatLines.ts` — `formatSpatialAnnotation`, `formatStyleProperty`
	- `layoutAlgorithm/`:
		- `gridPlacement.ts` — grid placement primitive (`computeStartY` + `gridPlacement`)
		- `computeNewBoxLayout.ts` — layout for classes with no `@spatial` annotation
		- `computeMalformedBoxLayout.ts` — layout for classes with an incomplete `@spatial` annotation
		- `classBoxMetrics.ts` — reads box-sizing tokens from `styles.css`

#### 4.3.3 Design decisions made

##### Formatters mirror builders

**Decision:** Each `format*` function in `formatLines.ts` mirrors exactly one builder in `parsers/classDiagram/builders/` (4.2.2) — e.g. `formatSpatialAnnotation` mirrors `buildSpatialData`. Read and write sides stay symmetric per construct.

**Rationale:** Adding or changing a construct means adding or changing one builder and its one mirroring formatter — not a divergent ad-hoc string-building path.

---

### 4.4 Component (UI) architecture

#### 4.4.1 Runtime view

**Containers** (own state and handlers, per 4.1.3):
- `App` — `sourceText`, `view`; renders the app shell (`AppHeader` + active view)
- `EditorView` — `selectedClassId`, edit handlers (`handleNodeDragStop`, `handleFillColorChange`, `handleGenerate`)
- `ClassDiagram` — React Flow `nodes`/`edges` state, its change handlers

**Presentational** (props in, JSX out, per 4.1.3): `ClassBox`, `AppHeader`, `Toggle`, `StylePane`, `ToolPane`.

**State ownership:**
- source file = single source of truth; extension host owns durable state
- webview state: `sourceText` (synced via `sourceUpdate`), `view`, `selectedClassId`
- everything else (`DiagramTree`, React Flow nodes/edges, class boxes) computed from `sourceText` via `useMemo`

#### 4.4.2 Code structure

- `components/` — one folder per component, sub-components nested (e.g. `EditorView/ClassDiagram/ClassBox/`)
- colocated hook convention (4.1.3): `ComponentName.tsx` + `ComponentName.module.css`, plus optional `useComponentName.ts` for substantial logic — currently only `AutorenderView/useAutorender.ts`