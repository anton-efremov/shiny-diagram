# System Architecture

> **Implementation state:** Current  
> **Document state:** Maintained  
> **Last reviewed:** 2026-06-20  
> **Scope:** Current subsystem responsibilities, data contracts, synchronization, and calculations

## Index

1. [Context and invariants](#1-context-and-invariants)
2. [System topology](#2-system-topology)
3. [Runtime protocol and synchronization](#3-runtime-protocol-and-synchronization)
4. [Extension Host](#4-extension-host)
5. [Webview](#5-webview)
6. [Webview layer contracts](#6-webview-layer-contracts)
7. [Controller component contracts](#7-controller-component-contracts)
8. [End-to-end calculations](#8-end-to-end-calculations)

## 1. Context and invariants

Shiny opens the active VS Code text document in a Webview and interprets its text as Mermaid class-diagram source. The command does not currently validate the document extension or language before opening the panel; it captures the active document when `shiny.openDiagram` runs. See [extension-host/extension.ts](../../../extension-host/extension.ts).

Current implementation properties:

- -The `.mmd` document is the durable source of truth.
- The Extension Host is the sole document writer.
- The rendered diagram is a projection of source, not a second persisted model.
- Visual edits are represented as atomic `LineEdit[]`  transactions (being migrated to `SourceEdit[]`)
- Every accepted source change produces an authoritative source snapshot and reruns the complete read pipeline.
- Manual, AI-authored, and visual changes use the same source interpretation path.
- Transient View state is not persisted unless it becomes explicit product data.

Structural policy is defined in [Architectural Standards](./architectural-standards.md). This document records the implementation as it exists, including places where runtime behavior is narrower than a declared TypeScript contract. All implementation links are relative to this file at `docs/engineering/architecture/system-architecture.md`.

## 2. System topology

```text
┌─────────────────────────────────────────────────────────────────┐
│ VS Code                                                         │
│                                                                 │
│  TextDocument ◄──────────────► Extension Host                   │
│                                      ▲                          │
│                                      │ message protocol         │
│                                      ▼                          │
│                                   Webview                       │
│                         ┌─────────────────────────┐             │
│                         │ Extension Bridge        │             │
│                         │ Controller              │             │
│                         │ View                    │             │
│                         └─────────────────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

| Runtime        | Responsibility                                                                                                                     |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Extension Host | VS Code lifecycle, panel lifecycle, document observation, document versioning, source mutation, and protocol transport             |
| Webview        | Mermaid interpretation, diagram modeling, render projection, editor intent, source-edit planning, rendering, and interaction state |
Each invocation of `shiny.openDiagram` creates a new panel. When an active document exists, that panel gets one [`DiagramSession`](../../../extension-host/diagramSession.ts) permanently bound to that document. When no active document exists, the panel is created with an empty initial source and without a synchronization session. See [extension-host/extension.ts](../../../extension-host/extension.ts) and [extension-host/webviewProvider.ts](../../../extension-host/webviewProvider.ts).

## 3. Runtime protocol and synchronization

### 3.1 Source snapshot

There is no `SourceSnapshot` data type in the current implementation. After initialization, the Host sends the complete current source through [`SourceUpdateMessage`](../../../extension-host/protocol.ts); the Webview duplicates the same wire declaration in [webview/src/extensionBridge/protocol.ts](../../../webview/src/extensionBridge/protocol.ts):

```ts
type SourceUpdateMessage = {
  readonly type: "sourceUpdate";
  readonly sourceText: string;
};
```

The message contains no document URI or document version (to be implemented). The session identity is implicit in the panel and its bound [`DiagramSession`](../../../extension-host/diagramSession.ts).

Before runtime messaging begins, [`getWebviewHtml`](../../../extension-host/webviewProvider.ts) serializes the initial document text as a JSON string in the `shiny-initial-data` element. [`readInitialData`](../../../webview/src/extensionBridge/initialData.ts) parses that element and returns either the string or `""`.

### 3.2 Edit request

The wire edit data is [`LineEdit`](../../../extension-host/protocol.ts) inside [`ApplyEditsMessage`](../../../extension-host/protocol.ts). The Webview keeps a duplicate declaration in [webview/src/extensionBridge/protocol.ts](../../../webview/src/extensionBridge/protocol.ts):

```ts
type LineEdit = {
  readonly lineNumber: number;
  readonly newText: string;
};

type ApplyEditsMessage = {
  readonly type: "applyEdits";
  readonly edits: readonly LineEdit[];
};
```

The request contains no request ID or base version. The current translation from Controller [`SourceEdit`](../../../webview/src/controller/commands/sourceEdit.ts) to wire `LineEdit` is implemented by [`toLineEdit`](../../../webview/src/extensionBridge/ExtensionBridge.tsx):

| Controller edit | Current wire result |
|---|---|
| `replaceLine` | Preserves `lineNumber` and `newText` |
| `replaceRange` | Uses `startLine` as `lineNumber`; ignores `endLine`; preserves `newText` |
| `insertLine` | Dropped |
| `deleteLine` | Dropped |

If all Controller edits are dropped, [`ExtensionBridge`](../../../webview/src/extensionBridge/ExtensionBridge.tsx) sends no message.

The current Generate handler uses `replaceRange` only with `startLine === endLine` and places multiple lines in `newText`; its source comment identifies this as the temporary representation used until the Host accepts `insertLine`. See [generateCommandHandler.ts](../../../webview/src/controller/commands/workers/handlers/generateCommandHandler.ts).

**Standards deviation:** the translation in [ExtensionBridge.tsx](../../../webview/src/extensionBridge/ExtensionBridge.tsx) does not preserve all supported `SourceEdit` semantics, contrary to the protocol-translation rule in [Architectural Standards](./architectural-standards.md#32-protocol-boundary).

### 3.3 Edit result

There is no edit-result message or edit-result data contract. [`HostToWebviewMessage`](../../../extension-host/protocol.ts) contains only `SourceUpdateMessage`, and [`WebviewToHostMessage`](../../../extension-host/protocol.ts) contains only `ApplyEditsMessage`.

[`DiagramSession`](../../../extension-host/diagramSession.ts) awaits `vscode.workspace.applyEdit(...)` but does not inspect its boolean result. It then posts a new `SourceUpdateMessage`. Consequently, the Webview receives the source text observed after the attempt, but it cannot correlate that update to a particular request or distinguish success, rejection, staleness, and failure through the protocol.

Controller command failures use the internal [`CommandResult`](../../../webview/src/controller/commands/commandExecution.ts), not a Host result. [`AppController`](../../../webview/src/controller/AppController.tsx) forwards only successful, non-empty edits and currently discards failure problems without exposing them to the View.

**Standards deviation:** transport outcomes and edit-application outcomes are not distinguishable, contrary to [Architectural Standards](./architectural-standards.md#33-boundary-adapters).

### 3.4 Transaction semantics

For one received `ApplyEditsMessage`, [`DiagramSession`](../../../extension-host/diagramSession.ts) currently:

1. routes the message by checking `msg.type === "applyEdits"`;
2. creates one `vscode.WorkspaceEdit`;
3. resolves every `LineEdit.lineNumber` with `document.lineAt(...)`;
4. replaces that complete line range with `LineEdit.newText`;
5. sets the `shinyOriginatedEdit` flag;
6. awaits `vscode.workspace.applyEdit(workspaceEdit)` without checking the returned boolean;
7. immediately posts the document's complete current text as `SourceUpdateMessage`.

The Host does not validate line bounds, duplicate or overlapping replacements, message shape, source version, or request ordering. It does not serialize requests through an explicit queue and does not catch and convert edit exceptions into protocol data. See [diagramSession.ts](../../../extension-host/diagramSession.ts).

For matching document changes not marked as Shiny-originated, the session restarts a 500 ms timer and then posts the complete source. The `shinyOriginatedEdit` boolean skips the next matching document-change event; the implementation comments explicitly note that this mechanism is not race-condition safe. See [`DEBOUNCE_MS` and `onDocumentChange`](../../../extension-host/diagramSession.ts).

On the Webview side, [`isHostMessage`](../../../webview/src/extensionBridge/typeGuards.ts) accepts any non-null object with a string-valued `type`. [`ExtensionBridge`](../../../webview/src/extensionBridge/ExtensionBridge.tsx) then checks `msg.type === "sourceUpdate"`, but reads `msg.sourceText` without validating that payload at runtime.

**Standards deviation:** the boundary adapters do not fully validate protocol messages or convert failures into explicit boundary outcomes as required by [Architectural Standards](./architectural-standards.md#33-boundary-adapters).

## 4. Extension Host

| Subsystem | Receives | Produces | Maintains | Implementation |
|---|---|---|---|---|
| Activation and panel lifecycle | VS Code activation, `shiny.openDiagram`, current active editor | A new `WebviewPanel`; optionally one `DiagramSession` | Command disposable; panel-owned session disposal callback | [extension.ts](../../../extension-host/extension.ts) |
| Webview provisioning | Extension context, Webview, optional active document | CSP-constrained HTML, initial source JSON, bundled script/style URIs | No long-lived application state | [webviewProvider.ts](../../../extension-host/webviewProvider.ts) |
| Diagram session | One `TextDocument`, one `WebviewPanel`, document-change events, `ApplyEditsMessage` | One `WorkspaceEdit` per request and complete `SourceUpdateMessage` values | Bound document and panel, disposables, 500 ms debounce timer, `shinyOriginatedEdit` flag | [diagramSession.ts](../../../extension-host/diagramSession.ts) |
| Host protocol declarations | TypeScript imports | `SourceUpdateMessage`, `LineEdit`, `ApplyEditsMessage`, and direction unions | Compile-time declarations only | [protocol.ts](../../../extension-host/protocol.ts) |

The Extension Host does not parse Mermaid, build the Controller model, derive View data, or interpret semantic editor commands. Its edit path mechanically replaces the document lines requested by the Webview. See [diagramSession.ts](../../../extension-host/diagramSession.ts).

## 5. Webview

### 5.1 Layer responsibilities

| Layer | Receives | Produces | Maintains | Implementation |
|---|---|---|---|---|
| Extension Bridge | Host-injected initial string, `window.message` data, Controller `SourceEdit[]` callback values | `sourceText` for the Controller and wire `ApplyEditsMessage` values | Current source string | [ExtensionBridge.tsx](../../../webview/src/extensionBridge/ExtensionBridge.tsx), [initialData.ts](../../../webview/src/extensionBridge/initialData.ts), [vscodeApi.ts](../../../webview/src/extensionBridge/vscodeApi.ts) |
| Controller | `sourceText`, `onApplyEdits`, View `EditorCommand`, partial canvas-state updates | `ParseResult`, `ElementViews`, React context values, and successful Controller edits | `CanvasState`; memoized source-derived projection | [AppController.tsx](../../../webview/src/controller/AppController.tsx) |
| View | Editor-state, dispatch, and canvas-state contexts; DOM and React Flow events | React output, wired `EditorCommand` values, and transient selection changes | Autorender/editor mode; React Flow node and edge working state | [App.tsx](../../../webview/src/view/App/App.tsx), [ClassDiagram.tsx](../../../webview/src/view/App/EditorView/ClassDiagram/ClassDiagram.tsx) |

[`AppController`](../../../webview/src/controller/AppController.tsx) is the Controller orchestrator. It invokes the public Parse, Derive Views, and Commands facades; constructs the three context values; and renders [`App`](../../../webview/src/view/App/App.tsx). The current Controller imports View runtime values through the root [`view/index.ts`](../../../webview/src/view/index.ts), command types through [`view/commands/index.ts`](../../../webview/src/view/commands/index.ts), and render types through [`view/views/index.ts`](../../../webview/src/view/views/index.ts).

**Standards deviation:** [view/index.ts](../../../webview/src/view/index.ts) is a prohibited root barrel, and [`AppController`](../../../webview/src/controller/AppController.tsx) should consume runtime APIs through [view/App/index.ts](../../../webview/src/view/App/index.ts) and [view/contexts/index.ts](../../../webview/src/view/contexts/index.ts), as specified by [Architectural Standards](./architectural-standards.md#611-view-root-organization).

### 5.2 Vocabulary contracts

| Contract area            | Current contents and access path                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `shared/`                | Branded diagram identities in [ids.ts](../../../webview/src/shared/ids.ts), `Rect` and `Point` in [geometry.ts](../../../webview/src/shared/geometry.ts), `RelationshipType` in [relationshipTypes.ts](../../../webview/src/shared/relationshipTypes.ts), and `StylePropertyName` in [styleTypes.ts](../../../webview/src/shared/styleTypes.ts). There is no shared root barrel.                                                                                           |
| `controller/model/`      | Source-derived nodes, edges, members, annotations, spatial data, and `DiagramTree` in [diagramTree.ts](../../../webview/src/controller/model/diagramTree.ts), plus `SourceLocation` in [sourceLocation.ts](../../../webview/src/controller/model/sourceLocation.ts). There is no model root barrel.                                                                                                                                                                        |
| `controller/commands/`   | Public `applyCommand` and `SourceEdit` through [index.ts](../../../webview/src/controller/commands/index.ts); internal `CommandContext` and `CommandResult` in [commandExecution.ts](../../../webview/src/controller/commands/commandExecution.ts).                                                                                                                                                                                                                        |
| `view/commands/`         | Component-owned command declarations re-exported by [view/commands/index.ts](../../../webview/src/view/commands/index.ts); aggregate `EditorCommand` in [editorCommand.ts](../../../webview/src/view/commands/editorCommand.ts).                                                                                                                                                                                                                                           |
| `view/views/`            | Component-owned render declarations re-exported by [view/views/index.ts](../../../webview/src/view/views/index.ts).                                                                                                                                                                                                                                                                                                                                                        |
| `view/contexts/`         | Context providers, `CanvasState`, and `defaultCanvasState` are exposed through [view/contexts/index.ts](../../../webview/src/view/contexts/index.ts); context value shapes and consumer hooks remain in [EditorStateContext.ts](../../../webview/src/view/contexts/EditorStateContext.ts), [EditorDispatchContext.ts](../../../webview/src/view/contexts/EditorDispatchContext.ts), and [CanvasStateContext.ts](../../../webview/src/view/contexts/CanvasStateContext.ts). |

## 6. Webview layer contracts

### 6.1 Extension Bridge and Controller

The current Controller input is the non-exported [`AppControllerProps`](../../../webview/src/controller/AppController.tsx):

```ts
type AppControllerProps = {
  sourceText: string;
  onApplyEdits: (edits: SourceEdit[]) => void;
};
```

[`ExtensionBridge`](../../../webview/src/extensionBridge/ExtensionBridge.tsx) owns `sourceText` and implements `onApplyEdits`. The callback is synchronous and returns no result. There is no snapshot object, document version, promise, operation status, or synchronization-error data at this boundary.

The callback accepts the Controller-owned [`SourceEdit`](../../../webview/src/controller/commands/sourceEdit.ts) union, converts it to wire [`LineEdit`](../../../webview/src/extensionBridge/protocol.ts) values as described in [Section 3.2](#32-edit-request), and calls [`vscode.postMessage`](../../../webview/src/extensionBridge/vscodeApi.ts).

### 6.2 Controller and View read contract

The current editor-state context value is defined privately in [EditorStateContext.ts](../../../webview/src/view/contexts/EditorStateContext.ts):

```ts
type EditorStateContextValue = {
  readonly sourceText: string;
  readonly parseStatus: EditorHeaderState;
  readonly elementViews: ElementViews | null;
};
```

There is no operation-status field.

[`EditorHeaderState`](../../../webview/src/view/App/AppHeader/views.ts) is:

```ts
type EditorHeaderState =
  | { readonly status: "ready" }
  | { readonly status: "invalidSyntax"; readonly message: string }
  | {
      readonly status: "missingAnnotations";
      readonly missingIds: readonly ClassId[];
    };
```

[`ElementViews`](../../../webview/src/view/App/EditorView/views.ts) is:

```ts
type ElementViews = {
  readonly classes: readonly ClassBoxView[];
  readonly namespaces: readonly NamespaceBoxView[];
  readonly relationships: readonly RelationshipView[];
};
```

[`ClassBoxView`](../../../webview/src/view/App/EditorView/ClassDiagram/ClassBox/views.ts) and [`ClassBoxMemberView`](../../../webview/src/view/App/EditorView/ClassDiagram/ClassBox/MemberTable/views.ts) are:

```ts
type ClassBoxView = {
  readonly classId: ClassId;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly header: {
    readonly label: string;
    readonly stereotype?: string;
  };
  readonly members: readonly ClassBoxMemberView[];
  readonly style?: {
    readonly fill?: string;
    readonly stroke?: string;
    readonly color?: string;
    readonly name?: string;
  };
};

type ClassBoxMemberView = {
  readonly memberId: MemberId;
  readonly prefix: string;
  readonly text: string;
  readonly kind: "field" | "method";
};
```

[`NamespaceBoxView` and `RelationshipView`](../../../webview/src/view/App/EditorView/ClassDiagram/views.ts) are:

```ts
type NamespaceBoxView = {
  readonly namespaceId: NamespaceId;
  readonly bounds: Rect;
  readonly label: string;
  readonly style?: {
    readonly fill?: string;
    readonly stroke?: string;
    readonly color?: string;
  };
};

type RelationshipView = {
  readonly relationshipId: RelationshipId;
  readonly sourceClassId: ClassId;
  readonly targetClassId: ClassId;
  readonly relationType: RelationshipType;
  readonly sourceMultiplicity?: string;
  readonly targetMultiplicity?: string;
  readonly label?: string;
};
```

Current consumption is narrower than these declarations:

- [`ClassDiagram`](../../../webview/src/view/App/EditorView/ClassDiagram/ClassDiagram.tsx) converts `classes` and `relationships` to React Flow data but does not render `namespaces`.
- [`reactFlowAdapters.ts`](../../../webview/src/view/App/EditorView/ClassDiagram/reactFlowAdapters.ts) uses relationship endpoints and `label`; it does not currently render `relationType`, source multiplicity, or target multiplicity.
- [`deriveNamespaceBoxViews`](../../../webview/src/controller/deriveViews/workers/deriveNamespaceBoxViews.ts) does not set `NamespaceBoxView.style`.
- [`MemberTable`](../../../webview/src/view/App/EditorView/ClassDiagram/ClassBox/MemberTable/MemberTable.tsx) displays member prefix and text as read-only content.
- [`EditorView`](../../../webview/src/view/App/EditorView/EditorView.tsx) renders the class-diagram editor only for `ready`; `invalidSyntax` and `missingAnnotations` render status content instead.

### 6.3 View and Controller command contract

The declared aggregate is [`EditorCommand`](../../../webview/src/view/commands/editorCommand.ts):

```ts
type EditorCommand =
  | GenerateCommand
  | ClassDiagramCommand
  | StyleCommand;
```

The current declaration and implementation coverage is:

| Command family | Current declared data | Current wiring and handler status | Contract source | Handler source |
|---|---|---|---|---|
| Generate | `{ type: "generate" }` | Emitted by the header when editor mode reports missing annotations; implemented | [AppHeader/commands.ts](../../../webview/src/view/App/AppHeader/commands.ts), [AppHeader.tsx](../../../webview/src/view/App/AppHeader/AppHeader.tsx) | [generateCommandHandler.ts](../../../webview/src/controller/commands/workers/handlers/generateCommandHandler.ts) |
| Class geometry | `class.move` or `class.resize` with `classId` and `rect: Rect` | `class.move` is emitted after React Flow drag-stop; both discriminants are implemented by the same handler. The current View has no `class.resize` dispatch path, although [ClassBox.tsx](../../../webview/src/view/App/EditorView/ClassDiagram/ClassBox/ClassBox.tsx) renders resize-handle elements. | [ClassBox/commands.ts](../../../webview/src/view/App/EditorView/ClassDiagram/ClassBox/commands.ts), [useClassBoxNodeInteractions.ts](../../../webview/src/view/App/EditorView/ClassDiagram/useClassBoxNodeInteractions.ts) | [classBoxCommandHandler.ts](../../../webview/src/controller/commands/workers/handlers/classBoxCommandHandler.ts) |
| Class content | `class.header.setLabel` carries `classId`, `label`; `class.member.setText` carries `classId`, `memberId`, `text`; `class.member.setPrefix` carries `classId`, `memberId`, `prefix: MemberPrefix` | Header and members are rendered read-only; the handler returns `ok: false` with “not yet implemented” | [ClassBox/commands.ts](../../../webview/src/view/App/EditorView/ClassDiagram/ClassBox/commands.ts), [MemberTable/commands.ts](../../../webview/src/view/App/EditorView/ClassDiagram/ClassBox/MemberTable/commands.ts), [MemberTable.tsx](../../../webview/src/view/App/EditorView/ClassDiagram/ClassBox/MemberTable/MemberTable.tsx) | [classContentCommandHandler.ts](../../../webview/src/controller/commands/workers/handlers/classContentCommandHandler.ts) |
| Namespace | `namespace.move` carries `namespaceId`, `delta: Point`; `namespace.setStyle` carries `namespaceId`, `property`, `value` | Namespace views are derived but not rendered; the handler returns “not yet implemented” | [ClassDiagram/commands.ts](../../../webview/src/view/App/EditorView/ClassDiagram/commands.ts), [ElementViews](../../../webview/src/view/App/EditorView/views.ts) | [namespaceCommandHandler.ts](../../../webview/src/controller/commands/workers/handlers/namespaceCommandHandler.ts) |
| Relationship | `relationship.setType` carries `relationshipId`, `relationType`; `relationship.setMultiplicity` carries `relationshipId`, `endpoint`, `value`; `relationship.setLabel` carries `relationshipId`, `label` | Relationships are displayed as non-editable default React Flow edges; the handler returns “not yet implemented” | [ClassDiagram/commands.ts](../../../webview/src/view/App/EditorView/ClassDiagram/commands.ts), [reactFlowAdapters.ts](../../../webview/src/view/App/EditorView/ClassDiagram/reactFlowAdapters.ts) | [relationshipCommandHandler.ts](../../../webview/src/controller/commands/workers/handlers/relationshipCommandHandler.ts) |
| Note | `note.move` and `note.resize` carry `noteId`, `rect`; `note.setText` carries `noteId`, `text` | No note node or note collection exists in the current Controller model, and no note is rendered; the handler returns “not yet implemented” | [ClassDiagram/commands.ts](../../../webview/src/view/App/EditorView/ClassDiagram/commands.ts), [diagramTree.ts](../../../webview/src/controller/model/diagramTree.ts), [ids.ts](../../../webview/src/shared/ids.ts) | [noteCommandHandler.ts](../../../webview/src/controller/commands/workers/handlers/noteCommandHandler.ts) |
| Class style | `style.setClassProperty` carries `classId`, `property: StylePropertyName`, `value` | Implemented only for a class already connected to an existing `classDef`. The current Style Pane emits only `property: "fill"` and only when the selected class has style data. | [StylePane/commands.ts](../../../webview/src/view/App/EditorView/StylePane/commands.ts), [useStylePaneInteractions.ts](../../../webview/src/view/App/EditorView/StylePane/useStylePaneInteractions.ts) | [styleCommandHandler.ts](../../../webview/src/controller/commands/workers/handlers/styleCommandHandler.ts) |

[`ToolPane`](../../../webview/src/view/App/EditorView/ToolPane/ToolPane.tsx) displays disabled class and relationship tool buttons and emits no commands.

All declared commands use shared IDs and value vocabulary from [shared/ids.ts](../../../webview/src/shared/ids.ts), [shared/geometry.ts](../../../webview/src/shared/geometry.ts), [shared/relationshipTypes.ts](../../../webview/src/shared/relationshipTypes.ts), and [shared/styleTypes.ts](../../../webview/src/shared/styleTypes.ts).

### 6.4 Shared View state contract

The current View-owned [`CanvasState`](../../../webview/src/view/contexts/canvasState.ts) is:

```ts
type CanvasState = {
  selectedClassId: ClassId | null;
};

const defaultCanvasState: CanvasState = {
  selectedClassId: null,
};
```

The non-exported value type used by [`CanvasStateContext`](../../../webview/src/view/contexts/CanvasStateContext.ts) is:

```ts
type CanvasStateContextValue = {
  readonly canvasState: CanvasState;
  readonly setCanvasState: (update: Partial<CanvasState>) => void;
};
```

[`AppController`](../../../webview/src/controller/AppController.tsx) hosts the state, shallow-merges partial updates, and clears `selectedClassId` when the selected class disappears from the latest `ElementViews`. [`useClassBoxNodeInteractions`](../../../webview/src/view/App/EditorView/ClassDiagram/useClassBoxNodeInteractions.ts) selects a class on node click, and [`useCanvasInteractions`](../../../webview/src/view/App/EditorView/ClassDiagram/useCanvasInteractions.ts) clears selection on pane click.

## 7. Controller component contracts

### 7.1 Controller model

[`SourceLocation`](../../../webview/src/controller/model/sourceLocation.ts) is:

```ts
type SourceLocation = {
  readonly startLine: number;
  readonly startChar: number;
  readonly endLine: number;
  readonly endChar: number;
  readonly raw: string;
};
```

The aggregate [`DiagramTree`](../../../webview/src/controller/model/diagramTree.ts) is:

```ts
type DiagramTree = {
  readonly classes: ReadonlyMap<ClassId, ClassNode>;
  readonly styleDefs: ReadonlyMap<StyleDefId, StyleDefNode>;
  readonly namespaces: ReadonlyMap<NamespaceId, NamespaceNode>;
  readonly relationships: readonly RelationshipEdge[];
  readonly appliesStyleEdges: readonly AppliesStyleEdge[];
  readonly inNamespaceEdges: readonly InNamespaceEdge[];
};
```

The same [diagramTree.ts](../../../webview/src/controller/model/diagramTree.ts) defines the current model data:

- `ClassNode`, including members, optional class annotation, optional spatial data, and `location: SourceLocation | null`;
- `ClassField` and `ClassMethod`, each with a branded `MemberId` and exact source location;
- `StyleDefNode` and `StyleProperty`;
- `NamespaceNode`;
- `RelationshipEdge`, `AppliesStyleEdge`, and `InNamespaceEdge`.

Implicit classes synthesized from relationships can have `location: null`. Classes without valid spatial annotations remain in the model with `spatial` absent. There is currently no note node or note collection in `DiagramTree`. Canonical branded IDs are defined in [shared/ids.ts](../../../webview/src/shared/ids.ts).

### 7.2 Parse

The public function is [`parseDiagram`](../../../webview/src/controller/parse/parseDiagram.ts):

```ts
function parseDiagram(source: string): ParseResult;
```

[`EditorDiagnostic` and `ParseResult`](../../../webview/src/controller/parse/parseResult.ts) are:

```ts
type EditorDiagnostic = {
  readonly kind:
    | "orphanedAnnotation"
    | "duplicateAnnotation"
    | "missingAnnotation"
    | "malformedAnnotation"
    | "syntaxError";
  readonly message: string;
  readonly elementId?: string;
};

type ParseResult =
  | {
      readonly status: "ready";
      readonly model: DiagramTree;
      readonly diagnostics: readonly EditorDiagnostic[];
    }
  | {
      readonly status: "missingAnnotations";
      readonly model: DiagramTree;
      readonly diagnostics: readonly EditorDiagnostic[];
      readonly missingIds: readonly ClassId[];
      readonly malformedAnnotations: ReadonlyMap<ClassId, SourceLocation>;
    }
  | {
      readonly status: "invalidSyntax";
      readonly diagnostics: readonly EditorDiagnostic[];
    };
```

Current calculation in [parseDiagram.ts](../../../webview/src/controller/parse/parseDiagram.ts):

1. the first non-empty, non-comment line must be `classDiagram` or start with `classDiagram `;
2. [`tokenize`](../../../webview/src/controller/parse/workers/tokenizer.ts) produces source tokens;
3. [`buildSpatiallyUnawareDiagramTree`](../../../webview/src/controller/parse/workers/buildDiagramTree.ts) builds nodes and edges, then implicit relationship endpoints are synthesized as class nodes;
4. [`parseSpatialAnnotations` and `attachSpatial`](../../../webview/src/controller/parse/workers/spatialAnnotations.ts) parse valid and malformed `%% @spatial` annotations and attach valid geometry;
5. any class without spatial data produces `missingAnnotations`; otherwise the result is `ready`;
6. thrown errors and a missing class-diagram header produce `invalidSyntax` with a `syntaxError` diagnostic.

Although `EditorDiagnostic.kind` declares five values, the current `parseDiagram` implementation constructs only `syntaxError`; `ready` and `missingAnnotations` currently return empty `diagnostics` arrays. The Parse public facade exports only `parseDiagram` and `ParseResult` through [controller/parse/index.ts](../../../webview/src/controller/parse/index.ts).

### 7.3 Derive Views

The public function is [`deriveElementViews`](../../../webview/src/controller/deriveViews/deriveElementViews.ts):

```ts
function deriveElementViews(model: DiagramTree): ElementViews;
```

It calculates the aggregate by invoking three workers:

- [`deriveClassBoxViews`](../../../webview/src/controller/deriveViews/workers/deriveClassBoxViews.ts) emits only classes with spatial data; copies geometry; formats field and method text; and resolves the first applied style definition into `fill`, `stroke`, `color`, and `name`.
- [`deriveNamespaceBoxViews`](../../../webview/src/controller/deriveViews/workers/deriveNamespaceBoxViews.ts) finds spatial member classes and calculates a 12-pixel padded union with [`unionRects`](../../../webview/src/controller/deriveViews/workers/layoutBounds.ts). A namespace with no spatial members receives `{ x: 0, y: 0, w: 120, h: 80 }`.
- [`deriveRelationshipViews`](../../../webview/src/controller/deriveViews/workers/deriveRelationshipViews.ts) emits only relationships whose source and target classes both have spatial data.

The public facade exports only `deriveElementViews` through [controller/deriveViews/index.ts](../../../webview/src/controller/deriveViews/index.ts). The current [viewModels.ts](../../../webview/src/controller/deriveViews/viewModels.ts) contains no declarations.

### 7.4 Commands

The internal [`CommandContext` and `CommandResult`](../../../webview/src/controller/commands/commandExecution.ts) are:

```ts
type CommandContext = {
  readonly sourceText: string;
  readonly model: DiagramTree;
  readonly malformedAnnotations?: ReadonlyMap<ClassId, SourceLocation>;
};

type CommandResult =
  | {
      readonly ok: true;
      readonly edits: SourceEdit[];
    }
  | {
      readonly ok: false;
      readonly problem: string;
    };
```

The Controller-owned [`SourceEdit`](../../../webview/src/controller/commands/sourceEdit.ts) is:

```ts
type SourceEdit =
  | {
      readonly kind: "replaceLine";
      readonly lineNumber: number;
      readonly newText: string;
    }
  | {
      readonly kind: "insertLine";
      readonly lineNumber: number;
      readonly newText: string;
    }
  | {
      readonly kind: "deleteLine";
      readonly lineNumber: number;
    }
  | {
      readonly kind: "replaceRange";
      readonly startLine: number;
      readonly endLine: number;
      readonly newText: string;
    };
```

[`applyCommand`](../../../webview/src/controller/commands/applyCommand.ts) has the current signature:

```ts
function applyCommand(
  command: EditorCommand,
  context: CommandContext,
): CommandResult;
```

Current handler behavior:

| Handler | Current calculation | Emitted `SourceEdit` kinds |
|---|---|---|
| [Generate](../../../webview/src/controller/commands/workers/handlers/generateCommandHandler.ts) | Replaces malformed spatial annotations; lays out missing classes in one horizontal row below existing boxes; appends new annotation text by replacing an anchor line with multiline text | `replaceLine`, `replaceRange` |
| [Class box](../../../webview/src/controller/commands/workers/handlers/classBoxCommandHandler.ts) | Rewrites the existing spatial-annotation line with the requested rectangle | `replaceLine` |
| [Style](../../../webview/src/controller/commands/workers/handlers/styleCommandHandler.ts) | Rewrites an existing applied `classDef` line with one property inserted or replaced | `replaceLine` |
| [Class content](../../../webview/src/controller/commands/workers/handlers/classContentCommandHandler.ts) | Returns `ok: false` / not implemented | None |
| [Namespace](../../../webview/src/controller/commands/workers/handlers/namespaceCommandHandler.ts) | Returns `ok: false` / not implemented | None |
| [Relationship](../../../webview/src/controller/commands/workers/handlers/relationshipCommandHandler.ts) | Returns `ok: false` / not implemented | None |
| [Note](../../../webview/src/controller/commands/workers/handlers/noteCommandHandler.ts) | Returns `ok: false` / not implemented | None |

No current handler emits `insertLine` or `deleteLine`. Generate placement uses `DEFAULT_WIDTH = 200`, `DEFAULT_HEIGHT = 150`, and `MARGIN = 40` from [layoutConstants.ts](../../../webview/src/controller/commands/workers/generateLayout/layoutConstants.ts); [`gridPlacement`](../../../webview/src/controller/commands/workers/generateLayout/gridPlacement.ts) places generated boxes left-to-right in a single row.

The public Commands facade exports only `applyCommand` and `SourceEdit` through [controller/commands/index.ts](../../../webview/src/controller/commands/index.ts). `CommandContext` and `CommandResult` remain internal.

## 8. End-to-end calculations

In this section, “persisted” means applied to the bound VS Code `TextDocument` buffer. The current Extension Host calls [`vscode.workspace.applyEdit`](../../../extension-host/diagramSession.ts) but does not call `document.save()`.

### 8.1 Authoritative source projection

| Producer | Input data | Current calculation | Implementation |
|---|---|---|---|
| Webview provisioning | Optional active `TextDocument` | Serializes `document.getText()` or `""` into the initial HTML | [webviewProvider.ts](../../../extension-host/webviewProvider.ts) |
| Diagram session | Bound `TextDocument` after a relevant change or edit attempt | Posts `SourceUpdateMessage { sourceText: document.getText() }` | [diagramSession.ts](../../../extension-host/diagramSession.ts), [protocol.ts](../../../extension-host/protocol.ts) |
| Extension Bridge | Initial JSON string or `SourceUpdateMessage` | Replaces its in-memory `sourceText` state | [initialData.ts](../../../webview/src/extensionBridge/initialData.ts), [ExtensionBridge.tsx](../../../webview/src/extensionBridge/ExtensionBridge.tsx) |
| Parse facade | `sourceText` | Calculates `ParseResult` and, when syntax is accepted, `DiagramTree` | [parseDiagram.ts](../../../webview/src/controller/parse/parseDiagram.ts), [parseResult.ts](../../../webview/src/controller/parse/parseResult.ts) |
| Derive Views facade | Non-invalid `DiagramTree` | Calculates `ElementViews` | [deriveElementViews.ts](../../../webview/src/controller/deriveViews/deriveElementViews.ts) |
| AppController | `sourceText`, `ParseResult`, `ElementViews` | Calculates `EditorHeaderState`, context values, and the active model reference | [AppController.tsx](../../../webview/src/controller/AppController.tsx) |
| App and Editor View | Editor-state context | Select autorender/editor mode; editor mode displays errors/missing IDs or the editor shell | [App.tsx](../../../webview/src/view/App/App.tsx), [EditorView.tsx](../../../webview/src/view/App/EditorView/EditorView.tsx) |
| React Flow adapters | `ClassBoxView[]`, `RelationshipView[]`, selected class ID | Calculates React Flow node and edge descriptors; chooses edge handles from box-center geometry | [reactFlowAdapters.ts](../../../webview/src/view/App/EditorView/ClassDiagram/reactFlowAdapters.ts) |
| View components | Context values and React Flow descriptors | Render the class boxes, members, default edges, style panel, disabled tool panel, and controls | [ClassDiagram.tsx](../../../webview/src/view/App/EditorView/ClassDiagram/ClassDiagram.tsx), [ClassBox.tsx](../../../webview/src/view/App/EditorView/ClassDiagram/ClassBox/ClassBox.tsx), [MemberTable.tsx](../../../webview/src/view/App/EditorView/ClassDiagram/ClassBox/MemberTable/MemberTable.tsx), [StylePane.tsx](../../../webview/src/view/App/EditorView/StylePane/StylePane.tsx), [ToolPane.tsx](../../../webview/src/view/App/EditorView/ToolPane/ToolPane.tsx) |

### 8.2 Persisted visual edit

The currently wired persisted-edit paths are Generate, class movement, and class fill-color change.

| Producer | Input data | Current calculation | Implementation |
|---|---|---|---|
| Header / interaction hook | Button, React Flow drag-stop, or color input event | Emits `generate`, `class.move`, or `style.setClassProperty` | [AppHeader.tsx](../../../webview/src/view/App/AppHeader/AppHeader.tsx), [useClassBoxNodeInteractions.ts](../../../webview/src/view/App/EditorView/ClassDiagram/useClassBoxNodeInteractions.ts), [useStylePaneInteractions.ts](../../../webview/src/view/App/EditorView/StylePane/useStylePaneInteractions.ts) |
| AppController | `EditorCommand`, current `sourceText`, current non-invalid model, optional malformed annotations | Builds `CommandContext`, calls `applyCommand`, and forwards only successful non-empty edits | [AppController.tsx](../../../webview/src/controller/AppController.tsx) |
| Commands | `EditorCommand`, `CommandContext` | Calculates `CommandResult` and supported `SourceEdit[]` | [applyCommand.ts](../../../webview/src/controller/commands/applyCommand.ts), [commandExecution.ts](../../../webview/src/controller/commands/commandExecution.ts) |
| Extension Bridge | `SourceEdit[]` | Converts supported edits to `LineEdit[]`; drops unsupported variants; posts `ApplyEditsMessage` when non-empty | [ExtensionBridge.tsx](../../../webview/src/extensionBridge/ExtensionBridge.tsx), [protocol.ts](../../../webview/src/extensionBridge/protocol.ts) |
| Diagram session | `ApplyEditsMessage`, bound `TextDocument` | Replaces complete line ranges in one `WorkspaceEdit`, awaits application, then posts the complete source | [diagramSession.ts](../../../extension-host/diagramSession.ts) |
| Extension Bridge and AppController | Subsequent `SourceUpdateMessage` | Replace `sourceText` and recalculate the projection through [Section 8.1](#81-authoritative-source-projection) | [ExtensionBridge.tsx](../../../webview/src/extensionBridge/ExtensionBridge.tsx), [AppController.tsx](../../../webview/src/controller/AppController.tsx) |

There is no optimistic local model mutation, request correlation, acknowledgement, version check, or visible command-failure state in this path. The post-edit source update is the only source refresh.

### 8.3 Transient interaction

| Producer | Input data | Current calculation | Implementation |
|---|---|---|---|
| App | Mode toggle | Replaces local `Mode`, whose values are `"autorender" \| "editor"` | [App.tsx](../../../webview/src/view/App/App.tsx) |
| Class-box interaction hook | React Flow node click | Sets `CanvasState.selectedClassId` | [useClassBoxNodeInteractions.ts](../../../webview/src/view/App/EditorView/ClassDiagram/useClassBoxNodeInteractions.ts) |
| Canvas interaction hook | React Flow pane click | Clears `CanvasState.selectedClassId` | [useCanvasInteractions.ts](../../../webview/src/view/App/EditorView/ClassDiagram/useCanvasInteractions.ts) |
| AppController | Partial `CanvasState` update | Shallow-merges the update; also clears a selection no longer present in derived class views | [AppController.tsx](../../../webview/src/controller/AppController.tsx) |
| ClassDiagram | Derived views, selected class, React Flow `NodeChange[]` | Rebuilds descriptors when source-derived data changes and applies local node changes while interacting | [ClassDiagram.tsx](../../../webview/src/view/App/EditorView/ClassDiagram/ClassDiagram.tsx) |

None of this state is written to the Mermaid document. Class movement becomes persisted only on drag-stop, when the View emits `class.move` through the path in [Section 8.2](#82-persisted-visual-edit).

### 8.4 Autorender

[`App`](../../../webview/src/view/App/App.tsx) passes the current `sourceText` directly to [`AutorenderView`](../../../webview/src/view/App/AutorenderView/AutorenderView.tsx). [`useAutorender`](../../../webview/src/view/App/AutorenderView/useAutorender.ts):

1. normalizes `stroke-width:` to `strokeWidth:` and `stroke-dasharray:` to `strokeDasharray:` on `classDef` lines;
2. initializes Mermaid with `startOnLoad: false`, `securityLevel: "strict"`, `htmlLabels: false`, the base theme, and CSS-derived theme variables;
3. calls `mermaid.render(...)` with the normalized source;
4. places the returned SVG in the container or exposes a local render-error string.

Autorender does not consume `ParseResult`, `DiagramTree`, or `ElementViews`. A source string can therefore fail or succeed in autorender independently of the Controller parser's supported subset.
