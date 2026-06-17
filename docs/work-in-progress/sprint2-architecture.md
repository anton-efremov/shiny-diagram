# Shiny webview — logical component view

Scope: target webview architecture for Phase 0 rails and later capsule-by-capsule implementation.

Source-first invariant: the `.mmd` source file is the durable artifact. The webview reads from source, projects it into editable visual state, and writes source edits back.

---

## 1. Vocabulary

- **Component** — logical responsibility block with a public boundary. Not necessarily one file, one folder, one React component, or one runtime object.
- **Component family** — parallel components with the same role and contract, but different entry points. One shared API, multiple implementations.
- **Boundary** — membrane between the webview and an external system. Not a peer component. Communicates via async events, not synchronous call/return.
- **Embedded in** — co-located with another component; not a boundary crossing.
- **Connects to** — a connection with another component, described from this component's perspective. Every component lists all its connections.
- **API** — callable interface across that boundary.
- **Passes** — data this component sends into an API it calls.
- **Receives** — data this component gets back from an API it called, or receives as input from its caller.
- **Returns** — data this component returns to its caller.
- **Defines** — types owned and published by this component.
- Absence of `Receives` after `Passes` means fire-and-forget.
- Absence of `Returns` means component does not return data to its caller.

---

## 2. Read logical component view

Read flow converts source text into renderable editor state.

---

**Boundary: App**

**Implementation:** `src/app/App.tsx`

**Role:** Membrane between webview and extension host. Receives source text via async `sourceUpdate` events and passes it into the editor pipeline.

**Connects to:** extension host
- Receives: `sourceText: string` via `sourceUpdate` event and initial load

**Connects to:** Editor Coordinator
- API: `EditorCoordinator(props: EditorCoordinatorProps)`
- Passes: `sourceText: string`

---

**Component: Editor Coordinator**

**Implementation:** `src/editor/EditorCoordinator.tsx`

**Role:** Owns editor-level read state. Drives the parse and derive pipeline, then passes renderable state to Editor UI.

**Owns:**
- `sourceText: string`
- `parseResult: ParseResult`
- `elementViews: ElementViews | null` — null when `ParseResult.status` is `"invalidSyntax"`
- `selection: Selection` defined at `src/editor/selection.ts`
- `activeTool: ActiveTool | null`

**Connects to:** App
- Receives: `sourceText: string`

**Connects to:** Parser
- API: `parseDiagram(sourceText)`
- Passes: `sourceText: string`
- Receives: `ParseResult`

**Connects to:** Derivator
- API: `deriveElementViews(model)`
- Passes: `model: DiagramTree` — always the whole tree
- Receives: `ElementViews`

**Connects to:** Editor UI
- API: `EditorUI(props: EditorUIProps)`
- Passes: `views: ElementViews | null`, `selection: Selection`, `activeTool: ActiveTool | null`, `diagnostics: EditorDiagnostic[]`, `dispatch: (command: EditorCommand) => void`, `onSelectionChange: (selection: Selection) => void`

---

**Component: Parser**

**Implementation:** `src/domain/classDiagram/parse/`

**Role:** Converts Mermaid/Shiny source text into a typed in-memory diagram representation.

**Connects to:** Editor Coordinator
- Returns: `ParseResult`

**Defines:**
- `ParseResult`:
  - `{ status: "ready"; model: DiagramTree; diagnostics: EditorDiagnostic[] }`
  - `{ status: "missingAnnotations"; model: DiagramTree; diagnostics: EditorDiagnostic[] }`
  - `{ status: "invalidSyntax"; diagnostics: EditorDiagnostic[] }`
- `DiagramTree` at `src/domain/classDiagram/model/`
- `EditorDiagnostic` at `src/domain/classDiagram/model/diagnostics.ts`:
  - `{ kind: "orphanedAnnotation" | "duplicateAnnotation" | "missingAnnotation" | "malformedAnnotation"; message: string; elementId?: string }`

---

**Component: Derivator**

**Implementation:** `src/domain/classDiagram/derive/`

**Role:** Computes per-element rendering descriptors from DiagramTree. Owns render facts that are not source facts: namespace bounds, default attached-note placement, stable relationship view IDs, and legend contents.

Public boundary is one function. Internally implemented as multiple per-element-type derivers — those are not component boundaries.

**Connects to:** Editor Coordinator
- Returns: `ElementViews`

**Defines:**
- `ElementViews` at `src/domain/classDiagram/derive/viewModel.ts`:
  - `classes: ClassBoxView[]` — `{ classId, x, y, w, h, header: { label, stereotype? }, members: { memberId, prefix, text }[], style?: { fill?, stroke?, color? } }`
  - `namespaces: NamespaceBoxView[]` — `{ namespaceId, bounds: Rect, label, style? }` — bounds derived from member class spatial rectangles
  - `relationships: RelationshipView[]` — `{ viewId: RelationshipViewId, sourceClassId, targetClassId, relationType, sourceMultiplicity?, targetMultiplicity?, label?, sourceLocation }`
  - `notes: NoteView[]` — `{ noteId, text, x?, y?, w?, h?, attachedTo?: ClassId }`
  - `legend: LegendView` — `{ entries: { label, style }[] }`
  - `diagnostics: EditorDiagnostic[]`

---

**Component: Editor UI**

**Implementation:** `src/editor/components/`

**Role:** Renders ElementViews and Selection. Owns local interaction state only. Does not derive geometry, decide product behavior, or write source.

**Connects to:** Editor Coordinator
- Receives: `views: ElementViews | null`, `selection: Selection`, `activeTool: ActiveTool | null`, `diagnostics: EditorDiagnostic[]`, `dispatch: (command: EditorCommand) => void`, `onSelectionChange: (selection: Selection) => void`

---

**Read rules**

- If `ParseResult.status` is `"invalidSyntax"`: do not call Derivator; pass diagnostics and blocking state to Editor UI
- If `ParseResult.status` is `"missingAnnotations"`: model exists; Derivator may run for diagnostics and Generate support; canvas rendering blocked per product rules
- If `ParseResult.status` is `"ready"`: pass model to Derivator

**Read invariants**

- Parser owns source interpretation
- Derivator owns render descriptors that are not source facts
- Editor UI renders what it receives
- Editor Coordinator wires the flow but does not implement product command behavior

---

## 3. Write logical component view

Write flow converts user interaction into source edits.

---

**Component: Editor UI**

**Implementation:** `src/editor/components/`

**Role:** Renders the editor surface. Embeds Interaction Controller hooks. Does not translate gestures, decide product behavior, or write source.

**Embedded in:** Interaction Controller Family

---

**Family: Interaction Controllers**

**Implementation:** `src/editor/interactions/`

**Role:** Hooks embedded inside Editor UI components. Each hook is co-located with its target component (e.g. `useClassBoxController` inside `ClassBox`). Wires component-level React and React Flow event handlers, translates them into named product intents, and dispatches to Editor Coordinator.

**Members:**
- `ClassBoxController` — embedded in `ClassBox`; wires React Flow node drag, resize, and click events
- `MemberTableController` — embedded in `MemberTable`; wires inline member editing events
- `NamespaceController` — embedded in `NamespaceBox`; wires drag events
- `RelationshipController` — embedded in relationship edge component; wires click and reconnect events
- `NoteController` — embedded in `Note`; wires drag, resize, and text edit events
- `CanvasController` — embedded in `ClassDiagram`; wires canvas click and pan events
- `ToolPaneController` — embedded in `ToolPane`; wires tool drag-to-canvas events
- `StylePaneController` — embedded in `StylePane`; wires style property change events

**Connects to:** Editor Coordinator
- API: `dispatch(command)` / `onSelectionChange(selection)`
- Passes: `EditorCommand | SelectionChange`

**Defines:**
- `SelectionChange`: `{ kind: "selectionChange"; selection: Selection }`

---

**Component: Editor Coordinator**

**Implementation:** `src/editor/EditorCoordinator.tsx`

**Role:** Receives product commands and selection changes. Updates selection state directly. Routes source-changing commands to Command Handlers and passes resulting edits to App.

**Connects to:** Interaction Controller Family
- Receives: `EditorCommand | SelectionChange`

**Connects to:** Command Handler Family
- API: `applyCommand(command, context)`
- Passes: `command: EditorCommand`, `context: CommandContext { sourceText: string; model: DiagramTree; views: ElementViews }`
- Receives: `CommandResult`

**Connects to:** App
- API: `onApplyEdits(edits)`
- Passes: `SourceEdit[]`

---

**Family: Command Handlers**

**Implementation:** `src/domain/classDiagram/commands/`

**Role:** Translate named product commands into source edits. Pure functions — no React, no DOM, no VS Code API, no side effects.

**Members:**
- `ClassBoxCommandHandler`
- `MemberCommandHandler`
- `NamespaceCommandHandler`
- `RelationshipCommandHandler`
- `NoteCommandHandler`
- `StyleCommandHandler`
- `GenerateCommandHandler`

**Connects to:** Editor Coordinator
- Returns: `CommandResult`:
  - `{ ok: true; edits: SourceEdit[] }`
  - `{ ok: false; problem: string }`

**Connects to:** Source Writer
- API (format functions): `formatSpatialAnnotation(classId, rect): string`, `formatStyleDef(styleDefId, properties): string`, `formatMemberRow(prefix, text): string`, `formatNoteId(noteId): string`, `formatNamespaceStyleAnnotation(namespaceId, properties): string`
- API (edit builders): `buildReplaceLine(location, newText): SourceEdit`, `buildInsertAfterLine(lineNumber, newText): SourceEdit`, `buildDeleteLine(lineNumber): SourceEdit`, `buildReplaceRange(location, newText): SourceEdit`
- Passes: `SourceLocation` or line number; new semantic, style, or spatial values
- Receives: `SourceEdit | string`

**Defines:**
- `EditorCommand` at `src/domain/classDiagram/commands/commandTypes.ts`:
  - `{ type: "class.move"; classId: ClassId; rect: Rect }`
  - `{ type: "class.resize"; classId: ClassId; rect: Rect }`
  - `{ type: "class.header.setLabel"; classId: ClassId; label: string }`
  - `{ type: "class.member.setText"; classId: ClassId; memberId: MemberId; text: string }`
  - `{ type: "class.member.setPrefix"; classId: ClassId; memberId: MemberId; prefix: MemberPrefix }`
  - `{ type: "style.setClassProperty"; classId: ClassId; property: StyleProperty; value: string }`
  - `{ type: "namespace.move"; namespaceId: NamespaceId; delta: Point }`
  - `{ type: "namespace.setStyle"; namespaceId: NamespaceId; property: StyleProperty; value: string }`
  - `{ type: "relationship.setType"; relationshipId: RelationshipViewId; relationType: RelationshipType }`
  - `{ type: "relationship.setMultiplicity"; relationshipId: RelationshipViewId; endpoint: "source" | "target"; value: string | null }`
  - `{ type: "relationship.setLabel"; relationshipId: RelationshipViewId; label: string | null }`
  - `{ type: "note.move"; noteId: NoteId; rect: Rect }`
  - `{ type: "note.resize"; noteId: NoteId; rect: Rect }`
  - `{ type: "note.setText"; noteId: NoteId; text: string }`
  - `{ type: "generate" }`
- `CommandContext`: `{ sourceText: string; model: DiagramTree; views: ElementViews }`
- `MemberId` — branded string ID for member identity within a class body

---

**Component: Source Writer**

**Implementation:** `src/domain/classDiagram/source/`

**Role:** Builds concrete Mermaid/Shiny source strings and SourceEdit values. Called only by Command Handlers.

**Connects to:** Command Handler Family
- Returns: `SourceEdit | string`

**Defines:**
- `SourceEdit` at `src/domain/classDiagram/source/sourceEditTypes.ts`:
  - `{ kind: "replaceLine"; lineNumber: number; newText: string }`
  - `{ kind: "insertLine"; lineNumber: number; newText: string }`
  - `{ kind: "deleteLine"; lineNumber: number }`
  - `{ kind: "replaceRange"; startLine: number; endLine: number; newText: string }`

---

**Boundary: App**

**Implementation:** `src/app/App.tsx`

**Role:** Membrane between webview and extension host. Receives source edits from Editor Coordinator and sends them to extension host.

**Connects to:** Editor Coordinator
- Receives: `SourceEdit[]` via `onApplyEdits` callback

**Connects to:** extension host
- Passes: `SourceEdit[]` via `vscode.postMessage({ type: "applyEdits", edits })`

---

**Write rules**

- SelectionChange does not enter the command pipeline
- Only source-changing intents become `EditorCommand`
- Editor UI emits component-level events
- Interaction Controllers translate events into named product intents
- Command Handlers decide what source change the intent requires
- Source Writer builds the concrete Mermaid/Shiny text

**Write invariants**

- Editor UI never writes source
- Interaction Controllers never format Mermaid
- Command Handlers never render UI
- Source Writer never decides product behavior
- App only crosses the host boundary
