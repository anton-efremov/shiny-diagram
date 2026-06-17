# Target structure — Shiny webview

The target `src/` layout for the Sprint 2 architecture, and the mapping from each logical component (the boxes in `logical-dataflow-view.md`) to the code that realizes it.

Paths are authoritative — they come from the `Implementation:` fields in `sprint2-architecture.md`. The **confluence shape** column says *how* a logical box is realized: a single module, a family of parallel modules, or hooks embedded across components.

## Tree

```text
src/
  app/
    App.tsx                       # Boundary: webview ↔ extension host
  editor/
    EditorCoordinator.tsx         # Hub: owns read state + selection/tool; wires both pipelines
    selection.ts                  # Selection type
    components/                   # Editor UI — renders ElementViews + Selection
      ClassDiagram.tsx            #   canvas
      ClassBox.tsx
      MemberTable.tsx
      NamespaceBox.tsx
      RelationshipEdge.tsx
      Note.tsx
      ToolPane.tsx
      StylePane.tsx
    interactions/                 # Interaction Controllers — family of hooks, each embedded in its component
      useClassBoxController.ts
      useMemberTableController.ts
      useNamespaceController.ts
      useRelationshipController.ts
      useNoteController.ts
      useCanvasController.ts
      useToolPaneController.ts
      useStylePaneController.ts
  domain/
    classDiagram/                 # Pure domain core — no React, DOM, or VS Code imports
      model/                      # DiagramTree — the typed model of the whole source file
        diagnostics.ts            #   EditorDiagnostic
      parse/                      # Parser — sourceText → ParseResult{ DiagramTree }
      derive/                     # Derivator — DiagramTree → ElementViews
        viewModel.ts              #   ElementViews and the *View types
      commands/                   # Command Handlers — family
        commandTypes.ts           #   EditorCommand union, CommandContext
      source/                     # Source Writer
        sourceEditTypes.ts        #   SourceEdit
```

## Mapping — logical box → code

### Read pipeline

- **App** — boundary, single component. `app/App.tsx`. Receives `sourceText` from the host via the `sourceUpdate` event; passes it into the coordinator.
- **Editor Coordinator** — hub, single component. `editor/EditorCoordinator.tsx`. Owns `sourceText`, `parseResult`, `elementViews`, `selection`, `activeTool`. Drives parse → derive, passes renderable state to Editor UI. Implements no product command behavior.
- **Parser** — single module (folder). `domain/classDiagram/parse/`. Internally may tokenize then build the tree; those sub-steps are not component boundaries.
- **Derivator** — single module (folder). `domain/classDiagram/derive/`. Internally one deriver per element type; those are not boundaries. Owns `derive/viewModel.ts`.
- **Editor UI** — component tree. `editor/components/`. Renders `ElementViews` + `Selection`; owns local interaction state only.

### Write pipeline

- **Interaction Controllers** — family of hooks, embedded. `editor/interactions/`. Each hook is imported and called inside its target component (`useClassBoxController` inside `ClassBox`, etc.). Translates component events into named `EditorCommand`s and dispatches; emits `SelectionChange` on the separate selection channel.
- **Command Handlers** — family of pure functions. `domain/classDiagram/commands/`. Members: `ClassBoxCommandHandler`, `MemberCommandHandler`, `NamespaceCommandHandler`, `RelationshipCommandHandler`, `NoteCommandHandler`, `StyleCommandHandler`, `GenerateCommandHandler`. Each takes `(command, CommandContext)` → `CommandResult`. No React, DOM, VS Code, or side effects.
- **Source Writer** — single module (folder). `domain/classDiagram/source/`. Builds concrete Mermaid/Shiny strings and `SourceEdit` values via format functions + edit builders. Called only by Command Handlers.
- **App** — boundary. Receives `SourceEdit[]` via `onApplyEdits`; posts to host via `vscode.postMessage({ type: "applyEdits", edits })`.

### Off the ring

- **`selection.ts` / `ActiveTool`** — editor-level view state owned by the Coordinator. Not source, not derived-from-source. The `onSelectionChange` channel and tool activation flow here, **not** through the command pipeline.

## Confluence shapes at a glance

- Single module (folder): `Parser`, `Derivator`, `Source Writer`.
- Single component: `App`, `Editor Coordinator`.
- Component tree: `Editor UI`.
- Family of parallel modules: `Command Handlers`.
- Family of embedded hooks: `Interaction Controllers`.
