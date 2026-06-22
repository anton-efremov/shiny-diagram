# System Architecture

> **Implementation state:** Current  
> **Document state:** Maintained  
> **Last reviewed:** 2026-06-22  
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

- The `.mmd` document is the durable source of truth.
- The Extension Host is the sole document writer.
- The rendered diagram is a projection of source, not a second persisted model.
- Visual edits are represented as atomic canonical range-replacement `SourceEdit[]` transactions.
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
│                         │ WebViewShell            │             │
│                         │ ├─ MermaidRenderer      │             │
│                         │ └─ ShinyController      │             │
│                         │    └─ EditorView        │             │
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

The wire edit data is [`SourceEdit`](../../../extension-host/protocol.ts) inside [`ApplyEditsMessage`](../../../extension-host/protocol.ts). The Webview keeps a duplicate declaration in [webview/src/extensionBridge/protocol.ts](../../../webview/src/extensionBridge/protocol.ts):

```ts
type SourcePosition = {
  readonly line: number;
  readonly character: number;
};

type SourceEdit = {
  readonly start: SourcePosition;
  readonly end: SourcePosition;
  readonly replacementText: string;
};

type ApplyEditsMessage = {
  readonly type: "applyEdits";
  readonly edits: readonly SourceEdit[];
};
```

`start` and `end` are zero-based source positions, and `end` is exclusive. An empty range inserts `replacementText`; a non-empty range with empty `replacementText` deletes the range; a non-empty range with non-empty `replacementText` replaces the range.

The request contains no request ID or base version. Controller [`SourceEdit`](../../../webview/src/shinyController/commands/sourceEdit.ts) has the same structural shape as the wire edit. [`ExtensionBridge.toProtocolEdit`](../../../webview/src/extensionBridge/ExtensionBridge.tsx) maps it field-for-field into the protocol-owned edit declaration. If the Controller returns no edits, [`ExtensionBridge`](../../../webview/src/extensionBridge/ExtensionBridge.tsx) sends no message.

### 3.3 Edit result

There is no edit-result message or edit-result data contract. [`HostToWebviewMessage`](../../../extension-host/protocol.ts) contains only `SourceUpdateMessage`, and [`WebviewToHostMessage`](../../../extension-host/protocol.ts) contains only `ApplyEditsMessage`.

[`DiagramSession`](../../../extension-host/diagramSession.ts) awaits `vscode.workspace.applyEdit(...)` but does not inspect its boolean result. It then posts a new `SourceUpdateMessage`. Consequently, the Webview receives the source text observed after the attempt, but it cannot correlate that update to a particular request or distinguish success, rejection, staleness, and failure through the protocol.

Controller command failures use the internal [`CommandResult`](../../../webview/src/shinyController/commands/commandExecution.ts), not a Host result. [`ShinyController`](../../../webview/src/shinyController/ShinyController.tsx) forwards only successful, non-empty edits and currently discards failure problems without exposing them to the View.

**Standards deviation:** transport outcomes and edit-application outcomes are not distinguishable, contrary to [Architectural Standards](./architectural-standards.md#33-boundary-adapters).

### 3.4 Transaction semantics

For one received `ApplyEditsMessage`, [`DiagramSession`](../../../extension-host/diagramSession.ts) currently:

1. routes the message by checking `msg.type === "applyEdits"`;
2. creates one `vscode.WorkspaceEdit`;
3. converts every `SourceEdit.start` and `SourceEdit.end` to a VS Code `Range`;
4. replaces that range with `SourceEdit.replacementText`;
5. sets the `shinyOriginatedEdit` flag;
6. awaits `vscode.workspace.applyEdit(workspaceEdit)` without checking the returned boolean;
7. immediately posts the document's complete current text as `SourceUpdateMessage`.

The Host does not validate position bounds, duplicate or overlapping ranges, message shape, source version, or request ordering. It does not serialize requests through an explicit queue and does not catch and convert edit exceptions into protocol data. See [diagramSession.ts](../../../extension-host/diagramSession.ts).

For matching document changes not marked as Shiny-originated, the session restarts a 500 ms timer and then posts the complete source. The `shinyOriginatedEdit` boolean skips the next matching document-change event; the implementation comments explicitly note that this mechanism is not race-condition safe. See [`DEBOUNCE_MS` and `onDocumentChange`](../../../extension-host/diagramSession.ts).

On the Webview side, [`isHostMessage`](../../../webview/src/extensionBridge/typeGuards.ts) accepts any non-null object with a string-valued `type`. [`ExtensionBridge`](../../../webview/src/extensionBridge/ExtensionBridge.tsx) then checks `msg.type === "sourceUpdate"`, but reads `msg.sourceText` without validating that payload at runtime.

**Standards deviation:** the boundary adapters do not fully validate protocol messages or convert failures into explicit boundary outcomes as required by [Architectural Standards](./architectural-standards.md#33-boundary-adapters).

## 4. Extension Host

| Subsystem | Receives | Produces | Maintains | Implementation |
|---|---|---|---|---|
| Activation and panel lifecycle | VS Code activation, `shiny.openDiagram`, current active editor | A new `WebviewPanel`; optionally one `DiagramSession` | Command disposable; panel-owned session disposal callback | [extension.ts](../../../extension-host/extension.ts) |
| Webview provisioning | Extension context, Webview, optional active document | CSP-constrained HTML, initial source JSON, bundled script/style URIs | No long-lived application state | [webviewProvider.ts](../../../extension-host/webviewProvider.ts) |
| Diagram session | One `TextDocument`, one `WebviewPanel`, document-change events, `ApplyEditsMessage` | One `WorkspaceEdit` per request and complete `SourceUpdateMessage` values | Bound document and panel, disposables, 500 ms debounce timer, `shinyOriginatedEdit` flag | [diagramSession.ts](../../../extension-host/diagramSession.ts) |
| Host protocol declarations | TypeScript imports | `SourceUpdateMessage`, `SourcePosition`, `SourceEdit`, `ApplyEditsMessage`, and direction unions | Compile-time declarations only | [protocol.ts](../../../extension-host/protocol.ts) |

The Extension Host does not parse Mermaid, build the Controller model, derive View data, or interpret semantic editor commands. Its edit path mechanically applies the source ranges requested by the Webview. See [diagramSession.ts](../../../extension-host/diagramSession.ts).

## 5. Webview

### 5.1 Layer responsibilities

| Layer | Receives | Produces | Maintains | Implementation |
|---|---|---|---|---|
| Extension Bridge | Host-injected initial string, `window.message` data, Controller `SourceEdit[]` callback values | `sourceText` for Shell and wire `ApplyEditsMessage` values | Current source string | [ExtensionBridge.tsx](../../../webview/src/extensionBridge/ExtensionBridge.tsx), [initialData.ts](../../../webview/src/extensionBridge/initialData.ts), [vscodeApi.ts](../../../webview/src/extensionBridge/vscodeApi.ts) |
| Shell | `sourceText`, `onApplyEdits`, mode-toggle input | Selected product branch: standard Mermaid rendering or Shiny editor | `WebViewMode` (`"mermaid" \| "shiny"`) | [WebViewShell.tsx](../../../webview/src/webviewShell/WebViewShell.tsx), [MermaidRenderer.tsx](../../../webview/src/mermaidRenderer/MermaidRenderer.tsx) |
| Controller | `sourceText`, `onApplyEdits`, View `EditorCommand` values | One `EditorViewModel`, one `EditorDispatch`, and successful Controller edits | Memoized source-derived projection | [ShinyController.tsx](../../../webview/src/shinyController/ShinyController.tsx) |
| View | `EditorViewModel`, `EditorDispatch`, DOM and React Flow events | React output, wired `EditorCommand` values, and transient interaction state updates | Selected class IDs, placement mode, React Flow node and edge working state | [EditorView.tsx](../../../webview/src/shinyView/EditorView/EditorView.tsx), [ClassDiagram.tsx](../../../webview/src/shinyView/EditorView/ClassDiagram/ClassDiagram.tsx) |

[`WebViewShell`](../../../webview/src/webviewShell/WebViewShell.tsx) owns the product-level Mermaid/Shiny mode and mounts only the selected branch. Mermaid mode mounts [`MermaidRenderer`](../../../webview/src/mermaidRenderer/MermaidRenderer.tsx) with `sourceText`; Shiny mode mounts [`ShinyController`](../../../webview/src/shinyController/ShinyController.tsx) with `sourceText` and the edit callback.

[`ShinyController`](../../../webview/src/shinyController/ShinyController.tsx) is the Shiny Controller orchestrator. It invokes the public Parse, Derive Views, and Commands facades; constructs one [`EditorViewModel`](../../../webview/src/shinyView/EditorView/views.ts); and renders [`EditorView`](../../../webview/src/shinyView/EditorView/EditorView.tsx) with that model and one [`EditorDispatch`](../../../webview/src/shinyView/commands/editorCommand.ts) implementation. The Controller imports View APIs through [`shinyView/EditorView`](../../../webview/src/shinyView/EditorView/index.ts), [`shinyView/commands`](../../../webview/src/shinyView/commands/index.ts), and [`shinyView/views`](../../../webview/src/shinyView/views/index.ts), as specified by [Architectural Standards](./architectural-standards.md#611-view-root-organization).

### 5.2 Vocabulary contracts

| Contract area            | Current contents and access path                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `shared/`                | Branded diagram identities in [ids.ts](../../../webview/src/shared/ids.ts), `Rect` and `Point` in [geometry.ts](../../../webview/src/shared/geometry.ts), `RelationshipType` in [relationshipTypes.ts](../../../webview/src/shared/relationshipTypes.ts), and `StylePropertyName` in [styleTypes.ts](../../../webview/src/shared/styleTypes.ts). There is no shared root barrel.                                                                                           |
| `shinyController/model/`      | Source-derived nodes, edges, members, annotations, spatial data, and `DiagramTree` in [diagramTree.ts](../../../webview/src/shinyController/model/diagramTree.ts), plus `SourceLocation` in [sourceLocation.ts](../../../webview/src/shinyController/model/sourceLocation.ts). There is no model root barrel.                                                                                                                                                                        |
| `shinyController/commands/`   | Public `applyCommand` and `SourceEdit` through [index.ts](../../../webview/src/shinyController/commands/index.ts); internal `CommandContext` and `CommandResult` in [commandExecution.ts](../../../webview/src/shinyController/commands/commandExecution.ts).                                                                                                                                                                                                                        |
| `shinyView/commands/`         | Component-owned command declarations re-exported by [shinyView/commands/index.ts](../../../webview/src/shinyView/commands/index.ts); aggregate `EditorCommand` and `EditorDispatch` in [editorCommand.ts](../../../webview/src/shinyView/commands/editorCommand.ts).                                                                                                                                                                                                                                           |
| `shinyView/views/`            | Component-owned render declarations and the whole-editor `EditorViewModel` re-exported by [shinyView/views/index.ts](../../../webview/src/shinyView/views/index.ts).                                                                                                                                                                                                                                                                                                                                                        |

## 6. Webview layer contracts

### 6.1 Extension Bridge, Shell, and Controller

The current Shell input is the private `WebViewShellProps` in [`WebViewShell.tsx`](../../../webview/src/webviewShell/WebViewShell.tsx):

```ts
type WebViewShellProps = {
  sourceText: string;
  onApplyEdits: (edits: SourceEdit[]) => void;
};
```

The current Controller input is the non-exported [`ShinyControllerProps`](../../../webview/src/shinyController/ShinyController.tsx):

```ts
type ShinyControllerProps = {
  sourceText: string;
  onApplyEdits: (edits: SourceEdit[]) => void;
};
```

[`ExtensionBridge`](../../../webview/src/extensionBridge/ExtensionBridge.tsx) owns `sourceText` and implements `onApplyEdits`. [`WebViewShell`](../../../webview/src/webviewShell/WebViewShell.tsx) passes the same edit callback directly to [`ShinyController`](../../../webview/src/shinyController/ShinyController.tsx) when Shiny mode is mounted. The callback is synchronous and returns no result. There is no snapshot object, document version, promise, operation status, or synchronization-error data at this boundary.

The callback accepts the Controller-owned [`SourceEdit`](../../../webview/src/shinyController/commands/sourceEdit.ts), converts it to the structurally equivalent wire [`SourceEdit`](../../../webview/src/extensionBridge/protocol.ts) as described in [Section 3.2](#32-edit-request), and calls [`vscode.postMessage`](../../../webview/src/extensionBridge/vscodeApi.ts).

### 6.2 Controller and View contract

The Controller/View runtime boundary is:

```ts
<EditorView view={editorViewModel} dispatch={dispatch} />
```

`ShinyController` constructs the complete read model and one semantic dispatch function. There is no `sourceText`, parse result, Controller model object, source location, source edit, operation-status field, or Controller-owned transient View state in the View-facing contract.

[`EditorViewModel`](../../../webview/src/shinyView/EditorView/views.ts) is:

```ts
type EditorViewModel =
  | {
      readonly status: "invalidSyntax";
      readonly message: string;
    }
  | {
      readonly status: "missingAnnotations";
      readonly missingIds: readonly ClassId[];
      readonly elements: ElementViews;
    }
  | {
      readonly status: "ready";
      readonly elements: ElementViews;
    };
```

[`ElementViews`](../../../webview/src/shinyView/EditorView/views.ts) is:

```ts
type ElementViews = {
  readonly classes: readonly ClassBoxView[];
  readonly namespaces: readonly NamespaceBoxView[];
  readonly relationships: readonly RelationshipView[];
};
```

[`ClassBoxView`](../../../webview/src/shinyView/EditorView/ClassDiagram/ClassBox/views.ts) and [`ClassBoxMemberView`](../../../webview/src/shinyView/EditorView/ClassDiagram/ClassBox/MemberTable/views.ts) are:

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

[`NamespaceBoxView` and `RelationshipView`](../../../webview/src/shinyView/EditorView/ClassDiagram/views.ts) are:

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

- [`ClassDiagram`](../../../webview/src/shinyView/EditorView/ClassDiagram/ClassDiagram.tsx) converts `classes` and `relationships` to React Flow data but does not render `namespaces`.
- [`reactFlowAdapters.ts`](../../../webview/src/shinyView/EditorView/ClassDiagram/reactFlowAdapters.ts) uses relationship endpoints and `label`; it does not currently render `relationType`, source multiplicity, or target multiplicity.
- [`deriveNamespaceBoxViews`](../../../webview/src/shinyController/deriveViews/workers/deriveNamespaceBoxViews.ts) does not set `NamespaceBoxView.style`.
- [`MemberTable`](../../../webview/src/shinyView/EditorView/ClassDiagram/ClassBox/MemberTable/MemberTable.tsx) displays member prefix and text as read-only content.
- [`EditorView`](../../../webview/src/shinyView/EditorView/EditorView.tsx) renders the class-diagram editor only for `ready`; `invalidSyntax` and `missingAnnotations` render status content instead.

### 6.3 View and Controller command contract

The declared aggregate is [`EditorCommand`](../../../webview/src/shinyView/commands/editorCommand.ts):

```ts
type EditorCommand =
  | GenerateCommand
  | ClassDiagramCommand
  | StyleCommand;
```

The current declaration and implementation coverage is:

| Command family | Current declared data | Current wiring and handler status | Contract source | Handler source |
|---|---|---|---|---|
| Generate | `{ type: "generate" }` | Emitted by `EditorStatus` when Shiny editor status reports missing annotations; implemented | [EditorStatus/commands.ts](../../../webview/src/shinyView/EditorView/EditorStatus/commands.ts), [EditorStatus.tsx](../../../webview/src/shinyView/EditorView/EditorStatus/EditorStatus.tsx) | [generateCommandHandler.ts](../../../webview/src/shinyController/commands/workers/handlers/generateCommandHandler.ts) |
| Class geometry | `class.resize` with one `classId` and `rect: Rect`; `class.move` with aggregate `moves: ClassMoveEntry[]` | `class.move` is emitted once after React Flow drag-stop and contains the final rectangle for every class moved by the completed gesture; `ClassBox` emits `class.resize` from the resize handle. Both discriminants are implemented by the same handler. | [ClassBox/commands.ts](../../../webview/src/shinyView/EditorView/ClassDiagram/ClassBox/commands.ts), [useClassBoxNodeInteractions.ts](../../../webview/src/shinyView/EditorView/ClassDiagram/useClassBoxNodeInteractions.ts), [useClassBoxInteractions.ts](../../../webview/src/shinyView/EditorView/ClassDiagram/ClassBox/useClassBoxInteractions.ts) | [classBoxCommandHandler.ts](../../../webview/src/shinyController/commands/workers/handlers/classBoxCommandHandler.ts) |
| Class placement | `class.add` with the drawn flow-space rectangle | The enabled Class placement tool activates `EditorView`-owned class-placement mode and emits no `EditorCommand` itself. [`PlacementOverlay`](../../../webview/src/shinyView/EditorView/ClassDiagram/PlacementOverlay/PlacementOverlay.tsx) later owns the full-viewport drawing surface, converts pointer positions to React Flow coordinates, emits `class.add` with the normalized final rectangle, and exits placement mode after a meaningful draw. Existing boxes may be drawn over through the overlay placement surface; overlap is allowed, and the existing selection is not changed. | [PlacementOverlay/commands.ts](../../../webview/src/shinyView/EditorView/ClassDiagram/PlacementOverlay/commands.ts), [ToolPane.tsx](../../../webview/src/shinyView/EditorView/ToolPane/ToolPane.tsx), [useToolPaneInteractions.ts](../../../webview/src/shinyView/EditorView/ToolPane/useToolPaneInteractions.ts), [usePlacementOverlayInteractions.ts](../../../webview/src/shinyView/EditorView/ClassDiagram/PlacementOverlay/usePlacementOverlayInteractions.ts) | [classAddCommandHandler.ts](../../../webview/src/shinyController/commands/workers/handlers/classAddCommandHandler.ts) |
| Class content | `class.header.setLabel` carries `classId`, `label`; `class.member.setText` carries `classId`, `memberId`, `text`; `class.member.setPrefix` carries `classId`, `memberId`, `prefix: MemberPrefix` | Header and members are rendered read-only; the handler returns `ok: false` with “not yet implemented” | [ClassBox/commands.ts](../../../webview/src/shinyView/EditorView/ClassDiagram/ClassBox/commands.ts), [MemberTable/commands.ts](../../../webview/src/shinyView/EditorView/ClassDiagram/ClassBox/MemberTable/commands.ts), [MemberTable.tsx](../../../webview/src/shinyView/EditorView/ClassDiagram/ClassBox/MemberTable/MemberTable.tsx) | [classContentCommandHandler.ts](../../../webview/src/shinyController/commands/workers/handlers/classContentCommandHandler.ts) |
| Namespace | `namespace.move` carries `namespaceId`, `delta: Point`; `namespace.setStyle` carries `namespaceId`, `property`, `value` | Namespace views are derived but not rendered; the handler returns “not yet implemented” | [ClassDiagram/commands.ts](../../../webview/src/shinyView/EditorView/ClassDiagram/commands.ts), [ElementViews](../../../webview/src/shinyView/EditorView/views.ts) | [namespaceCommandHandler.ts](../../../webview/src/shinyController/commands/workers/handlers/namespaceCommandHandler.ts) |
| Relationship | `relationship.setType` carries `relationshipId`, `relationType`; `relationship.setMultiplicity` carries `relationshipId`, `endpoint`, `value`; `relationship.setLabel` carries `relationshipId`, `label` | Relationships are displayed as non-editable default React Flow edges; the handler returns “not yet implemented” | [ClassDiagram/commands.ts](../../../webview/src/shinyView/EditorView/ClassDiagram/commands.ts), [reactFlowAdapters.ts](../../../webview/src/shinyView/EditorView/ClassDiagram/reactFlowAdapters.ts) | [relationshipCommandHandler.ts](../../../webview/src/shinyController/commands/workers/handlers/relationshipCommandHandler.ts) |
| Note | `note.move` and `note.resize` carry `noteId`, `rect`; `note.setText` carries `noteId`, `text` | No note node or note collection exists in the current Controller model, and no note is rendered; the handler returns “not yet implemented” | [ClassDiagram/commands.ts](../../../webview/src/shinyView/EditorView/ClassDiagram/commands.ts), [diagramTree.ts](../../../webview/src/shinyController/model/diagramTree.ts), [ids.ts](../../../webview/src/shared/ids.ts) | [noteCommandHandler.ts](../../../webview/src/shinyController/commands/workers/handlers/noteCommandHandler.ts) |
| Class style | `style.setClassProperty` carries aggregate `classIds`, one `property: "fill" \| "stroke" \| "color"`, and `value` | The Style Pane emits one command for one color-picker interaction across the selected classes. The handler plans one atomic edit batch, including clone-on-write isolation for shared `classDef` consumers and style creation for unstyled classes. | [StylePane/commands.ts](../../../webview/src/shinyView/EditorView/StylePane/commands.ts), [useStylePaneInteractions.ts](../../../webview/src/shinyView/EditorView/StylePane/useStylePaneInteractions.ts) | [styleCommandHandler.ts](../../../webview/src/shinyController/commands/workers/handlers/styleCommandHandler.ts), [styleMutationPlanning.ts](../../../webview/src/shinyController/commands/workers/styleMutationPlanning.ts) |

[`ToolPane`](../../../webview/src/shinyView/EditorView/ToolPane/ToolPane.tsx) enables the Class placement tool, keeps the remaining class controls and relationship controls disabled, and emits no `EditorCommand` when placement mode is activated.

All declared commands use shared IDs and value vocabulary from [shared/ids.ts](../../../webview/src/shared/ids.ts), [shared/geometry.ts](../../../webview/src/shared/geometry.ts), [shared/relationshipTypes.ts](../../../webview/src/shared/relationshipTypes.ts), and [shared/styleTypes.ts](../../../webview/src/shared/styleTypes.ts).

### 6.4 Transient View state

Each independent transient state domain lives at the narrowest View ancestor shared by its consumers.

| State domain | Owner | Consumers |
|---|---|---|
| Selected class IDs | [`EditorView`](../../../webview/src/shinyView/EditorView/EditorView.tsx), through [`useSelectedClassIds`](../../../webview/src/shinyView/EditorView/useSelectedClassIds.ts) | `ClassDiagram`, `ClassBox`, `StylePane` |
| Class placement mode | [`EditorView`](../../../webview/src/shinyView/EditorView/EditorView.tsx), using [`placementMode.ts`](../../../webview/src/shinyView/EditorView/placementMode.ts) | `ToolPane`, `ClassDiagram`, `PlacementOverlay` |
| React Flow nodes and edges | [`ClassDiagram`](../../../webview/src/shinyView/EditorView/ClassDiagram/ClassDiagram.tsx) | `ClassDiagram` and React Flow child nodes |
| Placement drag origin and draft rectangle | [`usePlacementOverlayInteractions`](../../../webview/src/shinyView/EditorView/ClassDiagram/PlacementOverlay/usePlacementOverlayInteractions.ts) | `PlacementOverlay` |
| Mermaid/Shiny mode | [`WebViewShell`](../../../webview/src/webviewShell/WebViewShell.tsx) | Product-level branch selection |

[`useSelectedClassIds`](../../../webview/src/shinyView/EditorView/useSelectedClassIds.ts) reconciles selection whenever a new `EditorViewModel` arrives: it keeps selected IDs that still exist, removes disappeared IDs, preserves class-view order, and clears selection when no class views are available. Duplicate commands create copies but do not request automatic selection of the new classes; any prior surviving selection remains selected.

Class selection follows React Flow's standard gestures. Plain-clicking a class replaces the selection, Command-click on macOS or Control-click on Windows/Linux toggles individual classes, Shift-drag selects by rectangle, and clicking the empty canvas clears selection. `EditorView` owns the selected ID collection as transient View state and reconciles it across new View models; `ClassDiagram` preserves surviving selected IDs when source-derived class views rebuild React Flow node descriptors.

[`EditorView/Controls`](../../../webview/src/shinyView/EditorView/Controls) contains Shiny View-internal presentation controls shared by sibling `EditorView` components. `ControlButton` is used for Tool Pane tiles, Style Pane actions, and the Generate action. `ColorSelector` is used for class fill, border/stroke, and text-color selection. The Webview Shell remains outside this cluster and keeps its own Mermaid/Shiny toggle.

[`StylePane`](../../../webview/src/shinyView/EditorView/StylePane/StylePane.tsx) aggregates each selected style property independently. A property displays its common explicit source value, `Default` when every selected class has no explicit value, or `Multiple` when selected values differ, including explicit-versus-default. The aggregation is View-only and does not enter the Controller model.

[`ToolPane`](../../../webview/src/shinyView/EditorView/ToolPane/ToolPane.tsx) activates class placement without emitting a source-changing command. [`PlacementOverlay`](../../../webview/src/shinyView/EditorView/ClassDiagram/PlacementOverlay/PlacementOverlay.tsx) is rendered over the React Flow viewport while placement is active; it owns the pointer drawing surface, keeps the drag origin and draft rectangle locally, converts pointer positions to flow-space coordinates with React Flow, emits `class.add` with the normalized final rectangle, then clears placement mode. Normal node selection, movement, and resizing are suspended by the overlay while placement is active.

## 7. Controller component contracts

### 7.1 Controller model

[`SourceLocation`](../../../webview/src/shinyController/model/sourceLocation.ts) is:

```ts
type SourceLocation = {
  readonly startLine: number;
  readonly startChar: number;
  readonly endLine: number;
  readonly endChar: number;
  readonly raw: string;
};
```

The aggregate [`DiagramTree`](../../../webview/src/shinyController/model/diagramTree.ts) is:

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

The same [diagramTree.ts](../../../webview/src/shinyController/model/diagramTree.ts) defines the current model data:

- `ClassNode`, including members, optional class annotation, optional spatial data, and `location: SourceLocation | null`;
- `ClassField` and `ClassMethod`, each with a branded `MemberId` and exact source location;
- `StyleDefNode` and `StyleProperty`;
- `NamespaceNode`;
- `RelationshipEdge`, `AppliesStyleEdge`, and `InNamespaceEdge`.

Implicit classes synthesized from relationships can have `location: null`. Classes without valid spatial annotations remain in the model with `spatial` absent. There is currently no note node or note collection in `DiagramTree`. Canonical branded IDs are defined in [shared/ids.ts](../../../webview/src/shared/ids.ts).

### 7.2 Parse

The public function is [`parseDiagram`](../../../webview/src/shinyController/parse/parseDiagram.ts):

```ts
function parseDiagram(source: string): ParseResult;
```

[`EditorDiagnostic` and `ParseResult`](../../../webview/src/shinyController/parse/parseResult.ts) are:

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

Current calculation in [parseDiagram.ts](../../../webview/src/shinyController/parse/parseDiagram.ts):

1. the first non-empty, non-comment line must be `classDiagram` or start with `classDiagram `;
2. [`tokenize`](../../../webview/src/shinyController/parse/workers/tokenizer.ts) produces source tokens;
3. [`buildSpatiallyUnawareDiagramTree`](../../../webview/src/shinyController/parse/workers/buildDiagramTree.ts) builds nodes and edges, then implicit relationship endpoints are synthesized as class nodes;
4. [`parseSpatialAnnotations` and `attachSpatial`](../../../webview/src/shinyController/parse/workers/spatialAnnotations.ts) parse valid and malformed `%% @spatial` annotations and attach valid geometry;
5. any class without spatial data produces `missingAnnotations`; otherwise the result is `ready`;
6. thrown errors and a missing class-diagram header produce `invalidSyntax` with a `syntaxError` diagnostic.

Although `EditorDiagnostic.kind` declares five values, the current `parseDiagram` implementation constructs only `syntaxError`; `ready` and `missingAnnotations` currently return empty `diagnostics` arrays. The Parse public facade exports only `parseDiagram` and `ParseResult` through [shinyController/parse/index.ts](../../../webview/src/shinyController/parse/index.ts).

### 7.3 Derive Views

The public function is [`deriveElementViews`](../../../webview/src/shinyController/deriveViews/deriveElementViews.ts):

```ts
function deriveElementViews(model: DiagramTree): ElementViews;
```

It calculates the aggregate by invoking three workers:

- [`deriveClassBoxViews`](../../../webview/src/shinyController/deriveViews/workers/deriveClassBoxViews.ts) emits only classes with spatial data; copies geometry; formats field and method text; and resolves the first applied style definition into `fill`, `stroke`, `color`, and `name`.
- [`deriveNamespaceBoxViews`](../../../webview/src/shinyController/deriveViews/workers/deriveNamespaceBoxViews.ts) finds spatial member classes and calculates a 12-pixel padded union with [`unionRects`](../../../webview/src/shinyController/deriveViews/workers/layoutBounds.ts). A namespace with no spatial members receives `{ x: 0, y: 0, w: 120, h: 80 }`.
- [`deriveRelationshipViews`](../../../webview/src/shinyController/deriveViews/workers/deriveRelationshipViews.ts) emits only relationships whose source and target classes both have spatial data.

The public facade exports only `deriveElementViews` through [shinyController/deriveViews/index.ts](../../../webview/src/shinyController/deriveViews/index.ts). The current [viewModels.ts](../../../webview/src/shinyController/deriveViews/viewModels.ts) contains no declarations.

### 7.4 Commands

The internal [`CommandContext` and `CommandResult`](../../../webview/src/shinyController/commands/commandExecution.ts) are:

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

The Controller-owned [`SourceEdit`](../../../webview/src/shinyController/commands/sourceEdit.ts) is the canonical zero-based range replacement:

```ts
type SourcePosition = {
  readonly line: number;
  readonly character: number;
};

type SourceEdit = {
  readonly start: SourcePosition;
  readonly end: SourcePosition;
  readonly replacementText: string;
};
```

[`applyCommand`](../../../webview/src/shinyController/commands/applyCommand.ts) has the current signature:

```ts
function applyCommand(
  command: EditorCommand,
  context: CommandContext,
): CommandResult;
```

Current handler behavior:

| Handler | Current calculation | Emitted `SourceEdit` ranges |
|---|---|---|
| [Generate](../../../webview/src/shinyController/commands/workers/handlers/generateCommandHandler.ts) | Replaces malformed spatial annotations; lays out missing classes in one horizontal row below existing boxes; appends new annotation text at an anchor position | Non-empty replacements for malformed annotations; zero-width insertion for appended annotations |
| [Class add](../../../webview/src/shinyController/commands/workers/handlers/classAddCommandHandler.ts) | Generates `NewClass` or the first available numbered variant from every model class, including implicit classes; accepts the View-defined rectangle; inserts a minimal class declaration before the existing spatial-annotation section and appends the new `@spatial` after existing spatial annotations. If no spatial section exists, appends both lines after existing diagram content. Overlap is allowed, and automatic selection is outside this feature. | Zero-width insertions |
| [Class box](../../../webview/src/shinyController/commands/workers/handlers/classBoxCommandHandler.ts) | Rewrites the existing spatial-annotation range with the requested rectangle | Non-empty replacement |
| [Style](../../../webview/src/shinyController/commands/workers/handlers/styleCommandHandler.ts) | Plans one aggregate class-style-property mutation; updates a fully selected shared `classDef` in place, clones shared definitions for selected subsets, retargets selected style applications, and creates definitions/applications for unstyled classes | Non-empty replacements and zero-width insertions in one atomic batch |
| [Class content](../../../webview/src/shinyController/commands/workers/handlers/classContentCommandHandler.ts) | Returns `ok: false` / not implemented | None |
| [Namespace](../../../webview/src/shinyController/commands/workers/handlers/namespaceCommandHandler.ts) | Returns `ok: false` / not implemented | None |
| [Relationship](../../../webview/src/shinyController/commands/workers/handlers/relationshipCommandHandler.ts) | Returns `ok: false` / not implemented | None |
| [Note](../../../webview/src/shinyController/commands/workers/handlers/noteCommandHandler.ts) | Returns `ok: false` / not implemented | None |

Generate placement uses `DEFAULT_WIDTH = 200`, `DEFAULT_HEIGHT = 150`, and `MARGIN = 40` from [layoutConstants.ts](../../../webview/src/shinyController/commands/workers/generateLayout/layoutConstants.ts); [`gridPlacement`](../../../webview/src/shinyController/commands/workers/generateLayout/gridPlacement.ts) places generated boxes left-to-right in a single row.

The public Commands facade exports only `applyCommand` and `SourceEdit` through [shinyController/commands/index.ts](../../../webview/src/shinyController/commands/index.ts). `CommandContext` and `CommandResult` remain internal.

## 8. End-to-end calculations

In this section, “persisted” means applied to the bound VS Code `TextDocument` buffer. The current Extension Host calls [`vscode.workspace.applyEdit`](../../../extension-host/diagramSession.ts) but does not call `document.save()`.

### 8.1 Authoritative source projection

| Producer | Input data | Current calculation | Implementation |
|---|---|---|---|
| Webview provisioning | Optional active `TextDocument` | Serializes `document.getText()` or `""` into the initial HTML | [webviewProvider.ts](../../../extension-host/webviewProvider.ts) |
| Diagram session | Bound `TextDocument` after a relevant change or edit attempt | Posts `SourceUpdateMessage { sourceText: document.getText() }` | [diagramSession.ts](../../../extension-host/diagramSession.ts), [protocol.ts](../../../extension-host/protocol.ts) |
| Extension Bridge | Initial JSON string or `SourceUpdateMessage` | Replaces its in-memory `sourceText` state | [initialData.ts](../../../webview/src/extensionBridge/initialData.ts), [ExtensionBridge.tsx](../../../webview/src/extensionBridge/ExtensionBridge.tsx) |
| WebViewShell | `sourceText`, local `WebViewMode` | Mounts only `MermaidRenderer` in Mermaid mode or `ShinyController` in Shiny mode | [WebViewShell.tsx](../../../webview/src/webviewShell/WebViewShell.tsx), [state.ts](../../../webview/src/webviewShell/state.ts) |
| Parse facade | `sourceText` | Calculates `ParseResult` and, when syntax is accepted, `DiagramTree` | [parseDiagram.ts](../../../webview/src/shinyController/parse/parseDiagram.ts), [parseResult.ts](../../../webview/src/shinyController/parse/parseResult.ts) |
| Derive Views facade | Non-invalid `DiagramTree` | Calculates `ElementViews` | [deriveElementViews.ts](../../../webview/src/shinyController/deriveViews/deriveElementViews.ts) |
| ShinyController | `sourceText`, `ParseResult`, `ElementViews` | Calculates `EditorViewModel`, `EditorDispatch`, and the active model reference | [ShinyController.tsx](../../../webview/src/shinyController/ShinyController.tsx) |
| EditorView | `EditorViewModel`, `EditorDispatch` | Displays Shiny invalid-syntax, missing-annotation, or ready editor branches; owns selection and placement mode | [EditorView.tsx](../../../webview/src/shinyView/EditorView/EditorView.tsx), [EditorStatus.tsx](../../../webview/src/shinyView/EditorView/EditorStatus/EditorStatus.tsx) |
| React Flow adapters | `ClassBoxView[]`, `RelationshipView[]`, selected class IDs, dispatch | Calculates React Flow node and edge descriptors; chooses edge handles from box-center geometry | [reactFlowAdapters.ts](../../../webview/src/shinyView/EditorView/ClassDiagram/reactFlowAdapters.ts) |
| View components | Props and React Flow descriptors | Render the class boxes, members, default edges, style panel, enabled Class placement tool, disabled remaining tools, and controls | [ClassDiagram.tsx](../../../webview/src/shinyView/EditorView/ClassDiagram/ClassDiagram.tsx), [ClassBox.tsx](../../../webview/src/shinyView/EditorView/ClassDiagram/ClassBox/ClassBox.tsx), [MemberTable.tsx](../../../webview/src/shinyView/EditorView/ClassDiagram/ClassBox/MemberTable/MemberTable.tsx), [StylePane.tsx](../../../webview/src/shinyView/EditorView/StylePane/StylePane.tsx), [ToolPane.tsx](../../../webview/src/shinyView/EditorView/ToolPane/ToolPane.tsx) |

### 8.2 Persisted visual edit

The currently wired persisted-edit paths are Generate, class movement, class placement, class deletion/duplication, and box-level class color styling.

| Producer | Input data | Current calculation | Implementation |
|---|---|---|---|
| Editor status / interaction hook | Generate button, React Flow drag-stop, color input event, or placement-overlay draw | Emits `generate`, aggregate `class.move`, aggregate `style.setClassProperty`, or `class.add` | [EditorStatus.tsx](../../../webview/src/shinyView/EditorView/EditorStatus/EditorStatus.tsx), [useClassBoxNodeInteractions.ts](../../../webview/src/shinyView/EditorView/ClassDiagram/useClassBoxNodeInteractions.ts), [useStylePaneInteractions.ts](../../../webview/src/shinyView/EditorView/StylePane/useStylePaneInteractions.ts), [usePlacementOverlayInteractions.ts](../../../webview/src/shinyView/EditorView/ClassDiagram/PlacementOverlay/usePlacementOverlayInteractions.ts) |
| ShinyController | `EditorCommand`, current `sourceText`, current non-invalid model, optional malformed annotations | Builds `CommandContext`, calls `applyCommand`, and forwards only successful non-empty edits | [ShinyController.tsx](../../../webview/src/shinyController/ShinyController.tsx) |
| Commands | `EditorCommand`, `CommandContext` | Calculates `CommandResult` and supported `SourceEdit[]` | [applyCommand.ts](../../../webview/src/shinyController/commands/applyCommand.ts), [commandExecution.ts](../../../webview/src/shinyController/commands/commandExecution.ts) |
| Extension Bridge | `SourceEdit[]` | Maps Controller edits field-for-field to protocol `SourceEdit[]`; posts `ApplyEditsMessage` when non-empty | [ExtensionBridge.tsx](../../../webview/src/extensionBridge/ExtensionBridge.tsx), [protocol.ts](../../../webview/src/extensionBridge/protocol.ts) |
| Diagram session | `ApplyEditsMessage`, bound `TextDocument` | Replaces source ranges in one `WorkspaceEdit`, awaits application, then posts the complete source | [diagramSession.ts](../../../extension-host/diagramSession.ts) |
| Extension Bridge and ShinyController | Subsequent `SourceUpdateMessage` | Replace `sourceText` and recalculate the projection through [Section 8.1](#81-authoritative-source-projection) | [ExtensionBridge.tsx](../../../webview/src/extensionBridge/ExtensionBridge.tsx), [ShinyController.tsx](../../../webview/src/shinyController/ShinyController.tsx) |

There is no optimistic local model mutation, request correlation, acknowledgement, version check, or visible command-failure state in this path. The post-edit source update is the only source refresh.

For class styling, one picker change creates one atomic Controller edit batch. The planner validates the complete selected class set before returning edits. It updates an existing `classDef` in place only when all classes consuming that definition are selected. If only a subset is selected, it clones the style definition, changes the requested property on the clone, and retargets only the selected classes' style-application lines. Unstyled selected classes receive a generated style definition and style applications. Unselected consumers of a named style are preserved. Untouched properties, including unsupported or unknown `classDef` properties, remain in the source text.

### 8.3 Transient interaction

| Producer | Input data | Current calculation | Implementation |
|---|---|---|---|
| WebViewShell | Mode toggle | Replaces local `WebViewMode`, whose values are `"mermaid" \| "shiny"` | [WebViewShell.tsx](../../../webview/src/webviewShell/WebViewShell.tsx) |
| EditorView selection hook | New `EditorViewModel` or selection replacement | Keeps selected IDs that still exist, preserves class-view order, and drops disappeared IDs | [useSelectedClassIds.ts](../../../webview/src/shinyView/EditorView/useSelectedClassIds.ts) |
| Canvas interaction hook | React Flow selection and pane events | Replaces selected class IDs or clears selection | [useCanvasInteractions.ts](../../../webview/src/shinyView/EditorView/ClassDiagram/useCanvasInteractions.ts) |
| ClassDiagram | Derived views, selected class IDs, React Flow `NodeChange[]` | Rebuilds descriptors when source-derived data changes and applies local node changes while interacting | [ClassDiagram.tsx](../../../webview/src/shinyView/EditorView/ClassDiagram/ClassDiagram.tsx) |
| Placement overlay hook | Pointer drag while placement mode is active | Keeps drag origin and draft rectangle locally until it emits `class.add` | [usePlacementOverlayInteractions.ts](../../../webview/src/shinyView/EditorView/ClassDiagram/PlacementOverlay/usePlacementOverlayInteractions.ts) |

None of this state is written to the Mermaid document. Class movement becomes persisted only on drag-stop, when the View emits `class.move` through the path in [Section 8.2](#82-persisted-visual-edit).

React Flow performs local group movement for selected class boxes. The View emits no source-changing command while the pointer is moving; one drag-stop emits one aggregate `class.move` command. The Controller validates the complete movement aggregate and returns one atomic `SourceEdit[]` batch containing every moved class's spatial-annotation replacement, sorted by source location. The Extension Bridge and Host keep the existing fire-and-forget source round trip: there is no optimistic rendering, acknowledgement, rollback, transaction ID, or protocol change.

### 8.4 Mermaid rendering

[`WebViewShell`](../../../webview/src/webviewShell/WebViewShell.tsx) passes the current `sourceText` directly to [`MermaidRenderer`](../../../webview/src/mermaidRenderer/MermaidRenderer.tsx) only while Mermaid mode is active. [`useMermaidRender`](../../../webview/src/mermaidRenderer/useMermaidRender.ts):

1. normalizes `stroke-width:` to `strokeWidth:` and `stroke-dasharray:` to `strokeDasharray:` on `classDef` lines;
2. initializes Mermaid with `startOnLoad: false`, `securityLevel: "strict"`, `htmlLabels: false`, the base theme, and CSS-derived theme variables;
3. calls `mermaid.render(...)` with the normalized source;
4. places the returned SVG in the container or exposes a local render-error string.

Mermaid rendering does not consume `ParseResult`, `DiagramTree`, or `ElementViews`. A source string can therefore fail or succeed in Mermaid rendering independently of the Controller parser's supported subset.
