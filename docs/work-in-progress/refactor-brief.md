# Refactor brief — restructure webview to three-layer architecture

## Objective

Restructure the existing webview source tree into a clean three-layer architecture
**without changing any observable behavior**. This is a pure structural migration —
no new product behavior, no changes to component logic, no changes to the annotation
syntax or source synchronization semantics.

**Execute this brief fully in one run. Do not pause to ask questions. If a decision
is not covered here, apply the layering principle — each layer imports only from the
layer directly below it — and proceed. Report any judgment calls in the end-of-run
summary.**

---

## Background: target architecture

The webview is organized into three layers, from top to bottom:

```
extensionBridge/     — crosses the host boundary; owns postMessage wiring
controller/          — owns pipelines, state, and pure domain workhorses
view/                — renders ElementViews; owns local interaction state
```

### Layer responsibilities

**extensionBridge** — the only code that touches `vscode.postMessage` and
`window.addEventListener("message")`. Owns `sourceText` state and
`handleApplyEdits`. Passes `sourceText` and `onApplyEdits` down to the
controller. Knows nothing about what the controller does with them.

**controller** — owns both pipelines and all session state:
- Read pipeline: `sourceText → parseDiagram → DiagramTree → deriveElementViews → ElementViews`
- Write pipeline: `EditorCommand → applyCommand → SourceEdit[] → onApplyEdits`
- Session state: `selection`, `canvasState` (future), `mode`

Also owns its internal workhorses — pure framework-free modules that implement
the diagram rules:
- `model/` — shared types: `DiagramTree`, `ParseResult`, `ElementViews`,
  `EditorCommand`, `SourceEdit`, primitives
- `parse/` — read pipeline: `sourceText → ParseResult{ DiagramTree }`
- `derive/` — read pipeline: `DiagramTree → ElementViews`
- `commands/` — write pipeline: `(EditorCommand, CommandContext) → CommandResult`
- `source/` — write pipeline: string formatters and `SourceEdit` builders,
  called only by `commands/`

Hard constraint: nothing inside `controller/` imports React, DOM APIs, or VS Code
APIs. `AppController.tsx` is the only file in `controller/` that may use React
hooks — it is the React host for the pipeline.

**view** — renders `ElementViews` and `Selection`. Owns only local interaction
state (e.g. React Flow node positions during drag). Calls `dispatch` for
source-changing intents. Calls `setCanvasState` (future) for transient visual
state. Never writes source directly, never calls domain functions directly.

View receives `dispatch` and `onSelectionChange` from `AppController` via
**React context**, not prop-drilling. `AppController` creates and provides two
contexts:
- `EditorDispatchContext` — provides `dispatch: (command: EditorCommand) => void`
- `EditorSelectionContext` — provides `selection: Selection` and
  `onSelectionChange: (selection: Selection) => void`

Any view component that needs to dispatch or read selection consumes the relevant
context directly. No intermediate component receives these as props just to pass
them down.

View imports types from `controller/` (e.g. `ElementViews`, `EditorCommand`,
`ClassBoxView`, `ClassId`) as the data contract across the layer boundary.
This is expected and correct — types cross layer boundaries freely; logic does not.

---

## Target folder structure

```
webview/src/
  main.tsx                          # entry point — mounts React, no layer

  extensionBridge/
    ExtensionBridge.tsx             # was App.tsx — owns sourceText + postMessage wiring
    protocol.ts                     # SourceUpdateMessage, ApplyEditsMessage, LineEdit
    vscodeApi.ts                    # vscode.postMessage wrapper
    initialData.ts                  # reads initial sourceText from DOM
    typeGuards.ts                   # isHostMessage

  controller/
    AppController.tsx               # was EditorCoordinator.tsx — owns both pipelines + session state
    EditorDispatchContext.ts        # React context: dispatch + EditorCommand type
    EditorSelectionContext.ts       # React context: selection + onSelectionChange
    selection.ts                    # Selection type + emptySelection
    classBoxMetrics.ts              # DOM metric reader — stays in controller (DOM-adjacent but not view)
    model/                          # shared types for both pipelines
    parse/                          # sourceText → ParseResult{ DiagramTree }
    derive/                         # DiagramTree → ElementViews
    commands/                       # EditorCommand → SourceEdit[]
    source/                         # string formatters + SourceEdit builders

  view/
    App.tsx                         # shell — mode toggle, AppHeader, AutorenderView
    AppHeader/
      AppHeader.tsx
      AppHeader.module.css
    AutorenderView/
      AutorenderView.tsx
      AutorenderView.module.css
      useAutorender.ts
    editor/
      ClassDiagram/
        ClassDiagram.tsx
        ClassDiagram.module.css
        reactFlowAdapters.ts        # moved here from components/ — serves ClassDiagram only
        useClassBoxController.ts    # moved here from interactions/
        useCanvasController.ts      # moved here from interactions/
      ClassBox/
        ClassBox.tsx
        ClassBox.module.css
        MemberTable/
          MemberTable.tsx
          useMemberTableController.ts
        NamespaceBox.tsx
        Note.tsx
        RelationshipEdge/           # promoted — peer to ClassBox on the canvas
          RelationshipEdge.tsx
      StylePane/
        StylePane.tsx
        StylePane.module.css
        useStylePaneController.ts   # moved here from interactions/
      ToolPane/
        ToolPane.tsx
        ToolPane.module.css
```

---

## Current → target mapping

| Current path | Target path | Reason |
|---|---|---|
| `app/App.tsx` | `extensionBridge/ExtensionBridge.tsx` | rename + responsibility clarification |
| `app/extensionBridge/protocol.ts` | `extensionBridge/protocol.ts` | lift up one level |
| `app/extensionBridge/vscodeApi.ts` | `extensionBridge/vscodeApi.ts` | lift up one level |
| `app/extensionBridge/initialData.ts` | `extensionBridge/initialData.ts` | lift up one level |
| `app/extensionBridge/typeGuards.ts` | `extensionBridge/typeGuards.ts` | lift up one level |
| `app/AppHeader/` | `view/AppHeader/` | view component |
| `app/AutorenderView/` | `view/AutorenderView/` | view component |
| `editor/EditorCoordinator.tsx` | `controller/AppController.tsx` | rename to match layer |
| `editor/selection.ts` | `controller/selection.ts` | owned by controller |
| `editor/classBoxMetrics.ts` | `controller/classBoxMetrics.ts` | used by controller only |
| _(new)_ | `controller/EditorDispatchContext.ts` | extract from AppController — provides dispatch via context |
| _(new)_ | `controller/EditorSelectionContext.ts` | extract from AppController — provides selection via context |
| `domain/classDiagram/model/` | `controller/model/` | controller workhorse |
| `domain/classDiagram/parse/` | `controller/parse/` | controller workhorse |
| `domain/classDiagram/derive/` | `controller/derive/` | controller workhorse |
| `domain/classDiagram/commands/` | `controller/commands/` | controller workhorse |
| `domain/classDiagram/source/` | `controller/source/` | controller workhorse |
| `editor/components/ClassDiagram.tsx` | `view/editor/ClassDiagram/ClassDiagram.tsx` | folder per component |
| `editor/components/ClassBox.tsx` | `view/editor/ClassBox/ClassBox.tsx` | folder per component |
| `editor/components/MemberTable.tsx` | `view/editor/ClassBox/MemberTable/MemberTable.tsx` | subfolder — grows with member editing |
| `editor/components/NamespaceBox.tsx` | `view/editor/ClassBox/NamespaceBox.tsx` | internal to ClassBox for now |
| `editor/components/Note.tsx` | `view/editor/ClassBox/Note.tsx` | internal to ClassBox for now |
| `editor/components/RelationshipEdge.tsx` | `view/editor/RelationshipEdge/RelationshipEdge.tsx` | canvas peer, not ClassBox child |
| `editor/components/StylePane.tsx` | `view/editor/StylePane/StylePane.tsx` | folder per component |
| `editor/components/ToolPane.tsx` | `view/editor/ToolPane/ToolPane.tsx` | folder per component |
| `editor/components/reactFlowAdapters.ts` | `view/editor/ClassDiagram/reactFlowAdapters.ts` | serves ClassDiagram only |
| `editor/interactions/useClassBoxController.ts` | `view/editor/ClassDiagram/useClassBoxController.ts` | co-located with its component |
| `editor/interactions/useCanvasController.ts` | `view/editor/ClassDiagram/useCanvasController.ts` | co-located with its component |
| `editor/interactions/useMemberTableController.ts` | `view/editor/ClassBox/MemberTable/useMemberTableController.ts` | co-located with its component |
| `editor/interactions/useStylePaneController.ts` | `view/editor/StylePane/useStylePaneController.ts` | co-located with its component |

---

## Hard invariants (must hold at every commit)

- Nothing inside `controller/` (except `AppController.tsx`) imports React, DOM APIs,
  or VS Code APIs.
- `extensionBridge/` is the only code that calls `vscode.postMessage` or listens to
  `window.addEventListener("message")`.
- View components never call `parseDiagram`, `deriveElementViews`, or `applyCommand`
  directly. They consume `dispatch` via `EditorDispatchContext` and `selection` via
  `EditorSelectionContext`.
- No intermediate view component receives `dispatch` or `onSelectionChange` as a
  prop only to pass it down. Every component that needs them consumes context directly.
- All existing product behavior is identical after each commit: the example `.mmd`
  file renders the same canvas, drag-to-move produces the same source edit, Generate
  produces the same annotation output.

---

## Migration approach

Incremental, behavior-preserving slices. Keep the example working at every commit.
Do not big-bang.

Suggested order:

1. **Move extensionBridge internals** — lift `app/extensionBridge/*` up to
   `extensionBridge/`. Update imports. Build must pass.
2. **Rename and relocate App → ExtensionBridge** — move `app/App.tsx` to
   `extensionBridge/ExtensionBridge.tsx`, update `main.tsx`. No logic changes.
3. **Move controller workhorses** — move `domain/classDiagram/*` to `controller/*`.
   Update all imports. Verify zero React/DOM imports in moved files.
4. **Rename EditorCoordinator → AppController and introduce contexts** — move to
   `controller/`. Move `selection.ts` and `classBoxMetrics.ts` alongside it. Extract
   `EditorDispatchContext` and `EditorSelectionContext`. Update all view components
   to consume context instead of receiving `dispatch` and `onSelectionChange` as props.
5. **Move view shell components** — move `app/AppHeader/` and `app/AutorenderView/`
   to `view/`. Create `view/App.tsx` from current `app/App.tsx` shell rendering logic.
6. **Restructure editor components** — apply folder-per-component layout. Move
   interaction hooks to sit beside their components. Move `reactFlowAdapters.ts`
   into `ClassDiagram/`.

After each slice: run `tsc --noEmit`, verify the example renders and drag-to-move
produces correct source output.

---

## Out of scope

- New features or any feature-map behavior not already working.
- Changes to product behavior, command semantics, or annotation syntax.
- Introducing `canvasState` — that is feature work, not part of this structural migration.
- Changing any logic inside moved files beyond what is required to fix imports.

---

## End-of-run summary (required)

After completing all migration steps, produce a summary with the following sections:

**Layering violations found** — list every place where a layer imports from a
non-adjacent layer (e.g. view importing directly from `controller/parse/` instead
of receiving data via props or context; `extensionBridge` importing from
`controller/model/` directly). For each violation: file, import, and reason it
could not be resolved within this brief's scope.

**Judgment calls made** — list any structural decisions not explicitly covered by
this brief, with the reasoning applied.

**Build result** — output of `tsc --noEmit`.

**Behavior verification** — confirm the example `.mmd` file renders correctly and
drag-to-move produces correct `@spatial` source output.
