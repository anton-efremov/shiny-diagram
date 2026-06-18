# 3. Webview architecture

Deep dive into the webview process (`webview/src/`). For the high-level overview of both processes, the host↔webview protocol, and the data flow loops, see `architecture.md`.

---

## 3.1 Three-layer architecture

The webview is organized as a three-layer architecture. Each layer imports only from the layer directly below it. Types cross layer boundaries freely as the data contract between layers; logic does not.

```
extensionBridge/     — crosses the host boundary; owns postMessage wiring
controller/          — owns both data pipelines, all session state, pure domain workhorses
view/                — renders ElementViews; owns local interaction state only
```

### extensionBridge

- **Role:** host boundary — the only code that crosses the `postMessage` boundary
- **Receives:**
  - `sourceText: string` — full current source of the `.mmd` file, from host via `sourceUpdate` message
  - initial source text from DOM on startup — same data, different delivery mechanism for first load
- **Calls:** `AppController.tsx`

### controller

- **Role:** owns both data pipelines, all session state, and pure domain workhorses
- **Receives:**
  - `sourceText: string` — raw source text; input to the read pipeline
  - `onApplyEdits: (edits: SourceEdit[]) => void` — callback to send computed edits back to the host
- **Calls:** `App.tsx` (renders it, wrapping in context providers)

### view

- **Role:** renders all UI elements; captures user gestures
- **Receives (via context):**
  - `sourceText: string` — raw source text; used by `AutorenderView` to call `mermaid.render()`
  - `parseStatus: EditorHeaderState` — current parse result status; gates editor rendering
  - `elementViews: ElementViews | null` — renderable descriptors for all diagram elements
  - `canvasState: CanvasState` — transient visual state (selected element, hover highlights, active tool)
- **Calls (via context):**
  - `dispatch: (command: EditorCommand) => void` — submits a named user intent to the write pipeline
  - `setCanvasState: (update: Partial<CanvasState>) => void` — updates transient visual state

Owns only local interaction state (e.g. React Flow node positions during drag). Never calls controller functions directly.

### 3.1.1 Design decisions made

#### Layer dependency rule

Each layer imports only from the layer directly below it. `App.tsx` imports from controller contexts. `ExtensionBridge` imports from controller (`AppController`). Nothing in `controller/` (other than `AppController.tsx`) imports React, DOM APIs, or VS Code APIs.

#### React context over prop drilling

`AppController` provides three contexts consumed anywhere in the view tree. No intermediate component receives `dispatch`, `canvasState`, or `editorState` as a prop only to pass it down.

---

## 3.2 ExtensionBridge

### 3.2.1 Core components

- `ExtensionBridge.tsx` — React component: owns `sourceText` state; registers `window.addEventListener("message")` on mount; calls `setSourceText` on `sourceUpdate`; renders `<AppController>`.
- `initialData.ts` — reads initial source text from the `#shiny-initial-data` DOM script tag on startup, before the first `sourceUpdate` arrives.
- `vscodeApi.ts` — thin wrapper around `acquireVsCodeApi()` and `vscode.postMessage`.
- `typeGuards.ts` — `isHostMessage(msg)` type guard used in the message listener.
- `protocol.ts` — message type definitions (webview copy; see 3.2.2).

### 3.2.2 Contracts and APIs

**Receives from extension host:**
- `sourceText: string` — via `sourceUpdate` postMessage or initial DOM tag

**Exposes to controller:**
- `sourceText: string` prop on `AppController`
- `onApplyEdits: (edits: SourceEdit[]) => void` prop on `AppController`

**Sends to extension host:**
- `LineEdit[]` via `applyEdits` postMessage, translated from `SourceEdit[]` via `toLineEdit()`

`toLineEdit` mapping:

| SourceEdit kind | LineEdit kind |
|---|---|
| `replaceLine` | `{ kind: "replaceLine", lineNumber, newText }` |
| `insertLine` | `{ kind: "insertLine", lineNumber, newText }` |
| `deleteLine` | `{ kind: "deleteLine", lineNumber }` |
| `replaceRange` | collapsed to `replaceLine` at `startLine` (known gap) |

### 3.2.3 Folder structure

```
extensionBridge/
  ExtensionBridge.tsx
  protocol.ts
  vscodeApi.ts
  initialData.ts
  typeGuards.ts
```

### 3.2.4 Design decisions made

#### Protocol types duplicated, not shared

`protocol.ts` is duplicated in `extension-host/protocol.ts` and `webview/src/extensionBridge/protocol.ts`. Intentional — keeps both sides isolated without a shared module crossing the process boundary.

#### `replaceRange` collapsed at the boundary (known gap)

`SourceEdit` has a `replaceRange` variant for future multi-line rewrites. `ExtensionBridge` currently collapses it to a `replaceLine` at `startLine`. Full support requires extending `LineEdit` with a `replaceRange` variant and implementing it in `DiagramSession.onApplyEdits`.

---

## 3.3 Controller

### 3.3.1 Core components

**`AppController.tsx`** — the React host. Owns `useMemo` for both pipelines, `useState` for `canvasState` and `parseStatus`. Provides all three contexts. Renders `<App />` as its only view import.

**`canvasState.ts`** — `CanvasState` type and `defaultCanvasState`; transient visual state: currently holds `selectedClassId`, designed to grow with hover highlights, active tool, drag preview.

**`index.ts`** — public API surface; view and extensionBridge import only from here, never from subfolders.

**`primitives.ts`** — shared type foundation: branded IDs (`ClassId`, `StyleDefId`, `NamespaceId`, `NoteId`, `MemberId`), `SourceLocation`, and all `DiagramTree` node/edge types (`ClassNode`, `StyleDefNode`, `NamespaceNode`, `SpatialData`, `ClassMember`, `RelationshipEdge`, etc.).

**`contexts/`**:
- **`CanvasStateContext.ts`** — provides `canvasState: CanvasState` and `setCanvasState: (update: Partial<CanvasState>) => void`.
- **`EditorDispatchContext.ts`** — provides `dispatch: (command: EditorCommand) => void`.
- **`EditorStateContext.ts`** — provides `sourceText`, `parseStatus`, and `elementViews` to the view layer.

**`parse/`** — read pipeline: `sourceText → ParseResult{ DiagramTree }`:
- `parseDiagram(source)` → `ParseResult` — orchestrates tokenize → build → synthesize → attach spatial
- `ParseResult` — `{ status: "ready", model }` | `{ status: "missingAnnotations", model, missingIds, malformedAnnotations }` | `{ status: "invalidSyntax", diagnostics }`
- `tokenizer.ts` — `tokenize(source)` → `ParseToken[]`; line-oriented, recursive for nested blocks
- `diagramTreeBuilders.ts` — `buildSpatiallyUnawareDiagramTree`, `synthesizeImplicitClassNodes`, `parseSpatialAnnotations`, `attachSpatial`
- `builders/` — one builder per construct

**`derive/`** — read pipeline: `DiagramTree → ElementViews`:
- `deriveElementViews(model)` — one pass, one deriver per element type; skipped on `invalidSyntax`
- `ElementViews`, `ClassBoxView`, `NamespaceBoxView`, `RelationshipView`, `NoteView`, `LegendView` — contract types co-located with their producer

**`commands/`** — write pipeline: `(EditorCommand, CommandContext) → CommandResult{ SourceEdit[] }`:
- `applyCommand(command, context)` — routes by `command.type` to handler
- `EditorCommand`, `CommandContext`, `CommandResult` — contract types co-located with `applyCommand`
- one handler per command family (see 3.5.2 for full routing table)
- `layoutAlgorithm/` — grid placement and box sizing for Generate

**`source/`** — write pipeline: string builders called only by `commands/`:
- `formatLines.ts` — `formatSpatialAnnotation`, `formatStyleProperty`; mirrors `parse/builders/` symmetrically
- `SourceEdit` union — contract type co-located with its producers: `replaceLine`, `insertLine`, `deleteLine`, `replaceRange`

### 3.3.3 Contracts and APIs

**Receives from extensionBridge:**
- `sourceText: string` prop
- `onApplyEdits: (edits: SourceEdit[]) => void` prop

**Provides to view via context:**
- `dispatch(command: EditorCommand)` — via `EditorDispatchContext`
- `canvasState: CanvasState`, `setCanvasState(update)` — via `CanvasStateContext`
- `parseStatus`, `elementViews` — via `EditorStateContext`

### 3.3.4 Folder structure

```
controller/
  AppController.tsx
  canvasState.ts
  primitives.ts
  index.ts
  contexts/
    EditorDispatchContext.ts
    CanvasStateContext.ts
    EditorStateContext.ts
  parse/
    index.ts
    tokenizer.ts
    diagramTreeBuilders.ts
    builders/
  derive/
    index.ts
  commands/
    index.ts
    classBoxCommandHandler.ts
    memberCommandHandler.ts
    styleCommandHandler.ts
    namespaceCommandHandler.ts
    relationshipCommandHandler.ts
    noteCommandHandler.ts
    generateCommandHandler.ts
    layoutAlgorithm/
      gridPlacement.ts
      computeNewBoxLayout.ts
      computeMalformedBoxLayout.ts
  source/
    index.ts
    formatLines.ts
```

### 3.3.5 Design decisions made

#### Full re-parse on every source change, no diffing

**Decision:** `parseDiagram` and `deriveElementViews` run on every `sourceText` change via `useMemo`. No incremental parsing, no targeted re-derive.

**Rationale:** Both are single-pass O(n) functions on small data — re-parse takes under a millisecond at any realistic class diagram size. React's virtual DOM diffing handles downstream optimization. Incremental parsing would be a significant investment for no perceptible gain.

#### Tokenizer-first parsing with a single-traversal builder pipeline

**Decision:** Single traversal over a recursive token tree, one builder per construct; spatial annotations parsed and attached in a separate later pass.

**Rationale:** Mermaid class diagram syntax is line-oriented and unambiguous. A single traversal with per-construct builders avoids re-scanning the token stream once per concern. Uniform recursion handles constructs at any nesting level (e.g. inside a namespace) with no special-casing.

**Alternative considered:** Four independent rule passes each scanning the full token stream. Replaced because of redundant scanning and per-rule namespace special-casing.

#### SourceLocation on every parsed construct, nullable for synthesized classes

**Decision:** Every parsed construct carries a `SourceLocation`. `ClassNode.location` is `null` for synthesized implicit classes.

**Rationale:** Command handlers need exact source lines to locate and rewrite on a user edit — capturing at parse time avoids a second pass. For implicit classes there is no source line; `null` makes that explicit in the type system. Such classes fall into `missingAnnotations`, handled by Generate.

#### DiagramTree as the parser-to-controller contract, in typed containers

**Decision:** `DiagramTree` uses six typed containers plus branded ID types. Nothing downstream receives raw source text.

**Rationale:** Typed containers eliminate kind-filtering downstream. Branded IDs eliminate a category of bug where one container's key is used to look up another. A breaking parser change becomes a compile error, not a runtime surprise.

#### Formatters mirror builders

**Decision:** Each `format*` function in `source/formatLines.ts` mirrors exactly one builder in `parse/builders/`.

**Rationale:** Adding or changing a construct requires changing one builder and one formatter — read and write sides stay symmetric per construct.

#### Source-first invariant

**Decision:** The webview never mutates its own rendered state directly. Every persisted change round-trips through the host and comes back as a `sourceUpdate`.

**Rationale:** Canvas is always a projection of the `.mmd` file. Undo is free via `WorkspaceEdit`. AI edits and manual edits are symmetric — both enter the same pipeline.

---

## 3.4 View

### 3.4.1 Core components

**`App.tsx`** — view root and shell. Owns `mode` state (`"editor"` | `"autorender"`). Renders `AppHeader` and either `EditorView` or `AutorenderView`. No controller logic.

**`AppHeader`** — mode toggle, parse status message, Generate button. Consumes `EditorDispatchContext` for Generate. Consumes `EditorStateContext` for parse status.

**`AutorenderView`** — calls `mermaid.render()` with raw source text from `EditorStateContext`.

**`EditorView`** — editor shell. Renders `ToolPane`, `ClassDiagram`, `StylePane`. Gates on `parseStatus` — shows blocking UI for `invalidSyntax` and `missingAnnotations`.

**`ClassDiagram`** — React Flow canvas. Reads `elementViews` from `EditorStateContext`. Converts to React Flow node/edge descriptors via `reactFlowAdapters.ts`. `ClassBoxView` travels as `node.data` into `ClassBox` — no further transformation.

**`ClassBox`** — renders `ClassBoxView`: header, annotation, member table via `MemberTable`. Contains `NamespaceBox` and `Note` as sibling canvas elements.

**`StylePane`** — style controls for the selected element. Reads `canvasState.selectedClassId` from `CanvasStateContext`.

**`ToolPane`** — tool selection (stub; future).

### 3.4.2 Contracts and APIs

**Consumes from controller via context:**
- `dispatch(command)` — from `EditorDispatchContext`; called by event handler hooks
- `canvasState`, `setCanvasState` — from `CanvasStateContext`; read by components, written by event handler hooks
- `parseStatus`, `elementViews` — from `EditorStateContext`

**Produces to controller:**
- `EditorCommand` — via `dispatch()`
- `canvasState` updates — via `setCanvasState()`

### 3.4.3 Folder structure

**Tree view** (nesting strategy — not exhaustive):

```
view/
  App.tsx
  AppHeader/
  AutorenderView/
  editor/
    EditorView/
    ClassDiagram/
      ClassDiagram.tsx
      reactFlowAdapters.ts
      useClassBoxEvents.ts      ← event handler hook, co-located
      useCanvasEvents.ts
    ClassBox/
      ClassBox.tsx
      MemberTable/              ← own folder; growing interaction surface
        MemberTable.tsx
        useMemberTableEvents.ts
      NamespaceBox.tsx
      Note.tsx
    RelationshipEdge/
    StylePane/
      StylePane.tsx
      useStylePaneEvents.ts
    ToolPane/
```

**Individual component view** (what lives in each component folder):

```
ComponentName/
  ComponentName.tsx         ← rendering only; reads context or props
  ComponentName.module.css  ← scoped styles
  useComponentNameEvents.ts ← event handler hook: gestures → dispatch / setCanvasState
```

Event handler hooks are co-located with their component. A hook is added when a component has user interactions that produce `EditorCommand`s or `canvasState` updates. Components with no interactions (e.g. `NamespaceBox`, `Note`) have no hook.

### 3.4.4 Design decisions made

#### Event handler hooks co-located with components

**Decision:** Event handler hooks (`useClassBoxEvents`, `useStylePaneEvents`, etc.) live beside their component, not in a shared `interactions/` folder.

**Rationale:** Each hook exists solely to translate gestures from one component into commands. Co-location makes the relationship explicit and avoids a folder that grows into an unstructured grab-bag.

#### React Flow adapter as a boundary translation layer

**Decision:** `reactFlowAdapters.ts` converts `ElementViews` into React Flow node/edge descriptors. `ClassBoxView` travels as `node.data` unchanged — `ClassBox` reads it directly.

**Rationale:** Isolates the React Flow API surface to one file. Downstream components never import React Flow types.

---

## 3.5 Scaling features

This section describes exactly what to add when implementing a new feature. No existing code is modified beyond what is listed — new features extend the system by addition, not mutation of existing structure.

### 3.5.1 Source code changes

Adding a new diagram construct (e.g. a new node type or relationship property) that needs to be parsed, derived, and editable:

| Folder/File | Function/Type added | Role |
|---|---|---|
| `controller/primitives.ts` | new node type (e.g. `NoteNode`) | adds the construct to `DiagramTree` |
| `controller/primitives.ts` | new branded ID type (e.g. `NoteId`) | type-safe identity for the new construct |
| `controller/parse/builders/` | new builder (e.g. `buildNoteNode.ts`) | parses one token into the new node type |
| `controller/parse/diagramTreeBuilders.ts` | wire new builder into traversal | registers the builder in the single-pass pipeline |
| `controller/derive/index.ts` | new view type (e.g. `NoteView`) + deriver function | renderable descriptor + produces `NoteView[]` from `DiagramTree` |
| `controller/commands/index.ts` | new `EditorCommand` variants + new case in `applyCommand` switch | named intents + routing to new handler |
| `controller/commands/` | new handler (e.g. `noteCommandHandler.ts`) | pure function: command + context → `SourceEdit[]` |
| `controller/source/formatLines.ts` | new format function (mirrors new builder) | builds replacement source strings for the new construct |

### 3.5.2 UI events with source change

Adding a new user interaction that modifies source (e.g. dragging a new element type, editing a label):

**Pipeline:** gesture → `EditorCommand` → `applyCommand` → `SourceEdit[]` → `LineEdit[]` → host → `sourceUpdate` → re-render.

| Step | Where | What to add |
|---|---|---|
| 1. New `EditorCommand` variant | `controller/commands/index.ts` | e.g. `{ type: "note.move", noteId, rect }` |
| 2. New command handler | `controller/commands/noteCommandHandler.ts` | pure function returning `SourceEdit[]` |
| 3. Route in `applyCommand` | `controller/commands/index.ts` | new case in switch |
| 4. New event handler hook | `view/editor/ComponentName/useComponentNameEvents.ts` | translates framework gesture → `dispatch(command)` |
| 5. Wire hook into component | `view/editor/ComponentName/ComponentName.tsx` | call the hook, pass callbacks to JSX |

No changes needed in `ExtensionBridge`, `AppController` pipeline, or `parseDiagram` / `deriveElementViews` unless the construct is new (see 3.5.1).

**Command routing table (current):**

| EditorCommand type | Handler |
|---|---|
| `class.move`, `class.resize` | `classBoxCommandHandler` |
| `class.header.setLabel`, `class.member.*` | `memberCommandHandler` |
| `style.setClassProperty` | `styleCommandHandler` |
| `namespace.move`, `namespace.setStyle` | `namespaceCommandHandler` |
| `relationship.setType`, `.setMultiplicity`, `.setLabel` | `relationshipCommandHandler` |
| `note.move`, `note.resize`, `note.setText` | `noteCommandHandler` |
| `generate` | `generateCommandHandler` |

### 3.5.3 UI events without source change

Adding a new transient visual behavior (e.g. hover highlight on namespace, drag preview, active tool indicator):

**Pipeline:** gesture → `setCanvasState(update)` → context re-render → component reads updated `canvasState`.

| Step | Where | What to add |
|---|---|---|
| 1. New field on `CanvasState` | `controller/canvasState.ts` | e.g. `hoveredNamespaceId: NamespaceId \| null` |
| 2. Default value | `controller/canvasState.ts` | add to `defaultCanvasState` |
| 3. Event handler hook | `view/editor/ComponentName/useComponentNameEvents.ts` | calls `setCanvasState({ hoveredNamespaceId: id })` on pointer enter, `setCanvasState({ hoveredNamespaceId: null })` on pointer leave |
| 4. Consuming component | `view/editor/ComponentName/ComponentName.tsx` | reads `canvasState.hoveredNamespaceId` from `useCanvasState()`, applies visual change |

No changes needed in `AppController`, either pipeline, or any controller workhorse.
