# System Architecture

> **Architecture state:** Target  
> **Document state:** Work-in-progress
> **Last reviewed:** 2026-06-19  
> **Scope:** Target subsystem responsibilities, data contracts, synchronization, and calculations

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

Shiny is a source-backed class-diagram editor for Mermaid `.mmd` documents. A Node.js Extension Host and a sandboxed React Webview communicate across a process boundary.

Target invariants:

- The `.mmd` document is the durable source of truth.
- The Extension Host is the sole document writer.
- The rendered diagram is a projection of source, not a second persisted model.
- Visual edits are represented as atomic `SourceEdit[]` transactions.
- Every accepted source change produces an authoritative source snapshot and reruns the complete read pipeline.
- Manual, AI-authored, and visual changes use the same source interpretation path.
- Transient View state is not persisted unless it becomes explicit product data.

Structural rules are defined in [Architectural Standards](./architectural-standards.md).

## 2. System topology

```text
┌─────────────────────────────────────────────────────────────────┐
│ VS Code                                                         │
│                                                                 │
│  TextDocument ◄──────────────► Extension Host                   │
│                                      │                          │
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

| Runtime | Responsibility |
|---|---|
| Extension Host | VS Code lifecycle, panel lifecycle, document observation, document versioning, source mutation, and protocol transport |
| Webview | Mermaid interpretation, diagram modeling, render projection, editor intent, source-edit planning, rendering, and interaction state |

One document-panel pair is represented by one synchronization session.

## 3. Runtime protocol and synchronization

### 3.1 Source snapshot

```ts
type SourceSnapshot = {
  readonly documentVersion: number;
  readonly sourceText: string;
};
```

The host embeds the initial snapshot in the Webview HTML. Later snapshots arrive through:

```ts
type SourceUpdateMessage = {
  readonly type: "sourceUpdate";
  readonly documentVersion: number;
  readonly sourceText: string;
};
```

The requesting panel receives the post-request snapshot in `ApplyEditsResultMessage`. `SourceUpdateMessage` carries changes not correlated with that panel's request, including manual changes, external changes, and edits applied through another session.

### 3.2 Edit request

```ts
type ApplyEditsMessage = {
  readonly type: "applyEdits";
  readonly requestId: string;
  readonly baseVersion: number;
  readonly edits: readonly SourceEdit[];
};
```

- `requestId` correlates the request with one result.
- `baseVersion` identifies the snapshot used to calculate the edits.
- `edits` preserves every supported `SourceEdit` variant defined in [Section 7.4](#74-commands).

### 3.3 Edit result

```ts
type ApplyEditsStatus = "applied" | "stale" | "invalid" | "failed";

type ApplyEditsResultMessage = {
  readonly type: "applyEditsResult";
  readonly requestId: string;
  readonly status: ApplyEditsStatus;
  readonly documentVersion: number;
  readonly sourceText: string;
  readonly problem?: string;
};
```

| Status | Meaning |
|---|---|
| `applied` | All edits were committed atomically. |
| `stale` | `baseVersion` did not match the current document; no edit was applied. |
| `invalid` | The request or edit set violated the protocol contract. |
| `failed` | VS Code rejected or failed to apply the transaction. |

Every result carries the authoritative post-request source snapshot.

### 3.4 Transaction semantics

For each synchronization session, the Extension Host:

1. serializes edit requests;
2. validates `baseVersion`;
3. validates edit ranges and rejects overlaps;
4. converts the complete `SourceEdit[]` transaction into one `WorkspaceEdit`;
5. applies the transaction;
6. checks the application result;
7. returns one correlated `ApplyEditsResultMessage`.

The Webview treats a requested edit as persisted only after an `applied` result. Any newer source update replaces the local snapshot and invalidates calculations based on an older version.

## 4. Extension Host

| Subsystem | Receives | Produces | Maintains |
|---|---|---|---|
| Activation and panel lifecycle | VS Code activation, `shiny.openDiagram`, active editor | Webview panel and synchronization session | Command and panel disposables |
| Webview provisioning | Panel, bundled assets, initial `SourceSnapshot` | CSP-constrained HTML with embedded initial data | Resource roots and asset URIs |
| Diagram session | Document changes, `ApplyEditsMessage` | `WorkspaceEdit`, `SourceUpdateMessage`, `ApplyEditsResultMessage` | Document version, request queue, subscriptions, optional debounce state |
| Host protocol adapter | Raw Webview messages | Validated edit requests | No application state |

The Diagram session applies edits mechanically; it does not interpret Mermaid or editor intent.

## 5. Webview

### 5.1 Layer responsibilities

| Layer | Receives | Produces | Maintains |
|---|---|---|---|
| Extension Bridge | Embedded initial data, host messages, Controller `SourceEdit[]` | `SourceSnapshot`, edit results, protocol requests | Current authoritative snapshot and pending request correlation |
| Controller | `SourceSnapshot`, View-owned `EditorCommand`, transient View-state updates | View context values and `SourceEdit[]` callback invocations | Current parse/model/render snapshot and hosted View state |
| View | View-owned render/state contracts, DOM and framework events | `EditorCommand`, transient View-state updates, React output | Component-local interaction state |

### 5.2 Vocabulary contracts

| Contract area    | Vocabulary                                                                       |
| ---------------- | -------------------------------------------------------------------------------- |
| `shared/`        | Canonical identities, generic geometry, relationship types, style-property names |

## 6. Webview layer contracts

### 6.1 Extension Bridge and Controller

The Controller receives the authoritative snapshot and an edit-application callback:

```ts
type ApplySourceEditsResult = {
  readonly status: ApplyEditsStatus;
  readonly snapshot: SourceSnapshot;
  readonly problem?: string;
};

type ApplySourceEdits = (
  baseVersion: number,
  edits: readonly SourceEdit[],
) => Promise<ApplySourceEditsResult>;

type AppControllerInput = {
  readonly sourceSnapshot: SourceSnapshot;
  readonly applySourceEdits: ApplySourceEdits;
};
```

The Extension Bridge assigns protocol request IDs and translates wire results into `ApplySourceEditsResult`. Controller does not consume wire-message types.

### 6.2 Controller and View read contract

Controller supplies the View state context:

```ts
type EditorStateContextValue = {
  readonly sourceText: string;
  readonly parseStatus: EditorHeaderState;
  readonly elementViews: ElementViews | null;
  readonly operationStatus: EditorOperationStatus;
};

type EditorOperationStatus =
  | { readonly status: "idle" }
  | { readonly status: "commandFailed"; readonly problem: string }
  | { readonly status: "synchronizationFailed"; readonly problem: string };
```

The header receives:

```ts
type EditorHeaderState =
  | { readonly status: "ready" }
  | { readonly status: "invalidSyntax"; readonly message: string }
  | {
      readonly status: "missingAnnotations";
      readonly missingIds: readonly ClassId[];
    };
```

The editor receives:

```ts
type ElementViews = {
  readonly classes: readonly ClassBoxView[];
  readonly namespaces: readonly NamespaceBoxView[];
  readonly relationships: readonly RelationshipView[];
};

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

These contracts contain render and interaction data only.

### 6.3 View and Controller command contract

View emits normalized editor intent through:

```ts
type EditorDispatch = (command: EditorCommand) => void;

type EditorCommand =
  | GenerateCommand
  | ClassDiagramCommand
  | StyleCommand;
```

| Command family | Discriminants | Payload |
|---|---|---|
| Generate | `generate` | None |
| Class box | `class.move`, `class.resize` | `classId`, `rect` |
| Class content | `class.header.setLabel`, `class.member.setText`, `class.member.setPrefix` | Canonical class/member IDs and normalized values |
| Namespace | `namespace.move`, `namespace.setStyle` | `namespaceId`, geometry or style value |
| Relationship | `relationship.setType`, `relationship.setMultiplicity`, `relationship.setLabel` | `relationshipId` and normalized relationship value |
| Note | `note.move`, `note.resize`, `note.setText` | `noteId` and geometry or text |
| Style | `style.setClassProperty` | `classId`, property name, value |

Every command is discriminated by `type` and uses canonical IDs from `shared/`.

### 6.4 Shared View state contract

```ts
type CanvasState = {
  readonly selectedClassId: ClassId | null;
};

type CanvasStateContextValue = {
  readonly canvasState: CanvasState;
  readonly setCanvasState: (update: Partial<CanvasState>) => void;
};
```

Controller hosts the context value; View defines and consumes it.

## 7. Controller component contracts

### 7.1 Controller model

```ts
type SourceLocation = {
  readonly startLine: number;
  readonly startChar: number;
  readonly endLine: number;
  readonly endChar: number;
  readonly raw: string;
};

type DiagramTree = {
  readonly classes: ReadonlyMap<ClassId, ClassNode>;
  readonly styleDefs: ReadonlyMap<StyleDefId, StyleDefNode>;
  readonly namespaces: ReadonlyMap<NamespaceId, NamespaceNode>;
  readonly relationships: readonly RelationshipEdge[];
  readonly appliesStyleEdges: readonly AppliesStyleEdge[];
  readonly inNamespaceEdges: readonly InNamespaceEdge[];
};
```

Model entities carry canonical IDs. Source-backed entities carry exact source locations; synthesized entities are distinguishable from source-backed entities.

### 7.2 Parse

```ts
function parseDiagram(sourceText: string): ParseResult;

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

`parseDiagram` calculates a complete result for one authoritative source snapshot.

### 7.3 Derive Views

```ts
function deriveElementViews(model: DiagramTree): ElementViews;
```

`deriveElementViews` calculates the View-owned render aggregate while preserving canonical model identities.

### 7.4 Commands

```ts
type CommandContext = {
  readonly sourceText: string;
  readonly model: DiagramTree;
  readonly malformedAnnotations?: ReadonlyMap<ClassId, SourceLocation>;
};

type CommandResult =
  | {
      readonly ok: true;
      readonly edits: readonly SourceEdit[];
    }
  | {
      readonly ok: false;
      readonly problem: string;
    };

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

function applyCommand(
  command: EditorCommand,
  context: CommandContext,
): CommandResult;
```

`applyCommand` calculates one source-edit transaction or one structured failure. The `generate` command additionally calculates spatial placement before producing edits.

## 8. End-to-end calculations

### 8.1 Authoritative source projection

| Producer | Input | Calculates |
|---|---|---|
| Diagram session | Current `TextDocument` | `SourceSnapshot` and `SourceUpdateMessage` |
| Extension Bridge | Embedded data or `SourceUpdateMessage` | Validated runtime `SourceSnapshot` |
| `parseDiagram` | `SourceSnapshot.sourceText` | `ParseResult` |
| `deriveElementViews` | `ParseResult.model` | `ElementViews` |
| AppController | `ParseResult`, `ElementViews`, operation outcome | `EditorHeaderState`, `EditorOperationStatus`, and `EditorStateContextValue` |
| React Flow adapter | `ElementViews` | React Flow node and edge descriptors |
| View components | View contracts and transient state | React output |

### 8.2 Persisted visual edit

| Producer | Input | Calculates |
|---|---|---|
| View interaction hook | DOM or framework event and current View data | `EditorCommand` |
| AppController | Current `SourceSnapshot` and editable `ParseResult` | `CommandContext` |
| `applyCommand` | `EditorCommand` and `CommandContext` | `CommandResult` |
| Extension Bridge | Successful `SourceEdit[]` and `baseVersion` | Correlated `ApplyEditsMessage` |
| Diagram session | Validated `ApplyEditsMessage` and current document | Atomic `WorkspaceEdit` and `ApplyEditsResultMessage` |
| Extension Bridge | `ApplyEditsResultMessage` | `ApplySourceEditsResult` and authoritative `SourceSnapshot` |
| AppController | New `SourceSnapshot` | A new source projection through [Section 8.1](#81-authoritative-source-projection) |

### 8.3 Transient interaction

| Producer | Input | Calculates |
|---|---|---|
| View interaction handler | DOM or framework event | `Partial<CanvasState>` |
| Canvas-state host | Current `CanvasState` and partial update | Next `CanvasState` |
| View components | Next `CanvasState` | Updated React output |

### 8.4 Autorender

| Producer | Input | Calculates |
|---|---|---|
| Mermaid renderer in Autorender View | `SourceSnapshot.sourceText` | Rendered SVG |

Autorender does not depend on `ParseResult` or Controller model coverage.
