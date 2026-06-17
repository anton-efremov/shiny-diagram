# Logical dataflow view — Shiny webview

The durable artifact is the `.mmd` source file. The webview is a projection of it: it reads source into something you can see and edit, then writes your edits back. The file is the only memory; nothing in the webview persists across a turn of the loop.

This is a **logical** view:

- Boxes are logical components — responsibilities, each turning one core artifact into the next. A box is not a file, folder, or runtime object; one box may be many files, a scatter of hooks, or no stable instance.
- Arrows carry core artifacts — the essential data, not its envelope, return type, or call sequence.
- Helpers internal to a transformation (tokenizers, per-element derivers, source-edit builders) are not shown; they live one level down.

## The loop

```text
                            ┌────────────────────────┐
              ┌────────────▶│       .mmd source      │────────────┐
              │             └────────────────────────┘            │
              │ SourceEdit[]                                       │ sourceText
              │                                                    ▼
  ┌───────────┴──────────────┐                       ┌────────────────────────┐
  │     Command Handlers     │                       │         Parser         │
  └──────────────────────────┘                       └────────────┬───────────┘
              ▲                                                    │ DiagramTree
              │ EditorCommand                                      ▼
              │                                       ┌────────────────────────┐
              │                                       │        Derivator       │
              │                                       └────────────┬───────────┘
              │                                                    │ ElementViews
  ┌───────────┴──────────────┐                                    ▼
  │ Interaction Controllers  │                       ┌────────────────────────┐
  └──────────────────────────┘                       │        Editor UI       │
              ▲                                       └────────────┬───────────┘
              ┊ gesture (no data)                                  ┊ canvas (no data)
              ┊                                                    ▼
              ┊                                         ┌────────────────────────┐
              └ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┤          You           │
                                                        └────────────────────────┘
```

- Down the right = **read**: source becomes view — `sourceText` → `DiagramTree` → `ElementViews`.
- Up the left = **write**: view becomes source — `EditorCommand` → `SourceEdit[]`.
- `.mmd source` and `You` are the shared pivots; the two halves close into one loop.
- Solid `──▶` carries a typed core artifact. Dashed `┄┄▶` is the human pivot — perception out (`canvas`), intent in (`gesture`), no typed data.
- The ring is asymmetric by one stage on purpose: `Editor UI` is double-booked — the read-side render stage and the physical host of the write-side `Interaction Controllers`. That co-location is a structural fact and belongs to the component view, not here.

## Core artifacts

All types below are created in Sprint 2; the shapes here are the spec the migration implements against.

### `sourceText` — Parser input

```ts
type SourceText = string; // arrives via the sourceUpdate event + initial load (App boundary)
```

Source-faithful, lossless, whole-file. It *is* the source, not a projection — the durable artifact every other type derives from or compiles back into.

### `DiagramTree` — Parser output, delivered in `ParseResult`

```ts
type ParseResult =
  | { status: "ready";              model: DiagramTree; diagnostics: EditorDiagnostic[] }
  | { status: "missingAnnotations"; model: DiagramTree; diagnostics: EditorDiagnostic[] }
  | { status: "invalidSyntax";                          diagnostics: EditorDiagnostic[] };

type EditorDiagnostic = {
  kind: "orphanedAnnotation" | "duplicateAnnotation" | "missingAnnotation" | "malformedAnnotation";
  message: string;
  elementId?: string;
};
```

- `DiagramTree` is the whole source file in typed tree form — source-faithful, lossless, durable. It preserves even constructs Shiny cannot yet visually edit. Its field shape is owned by the model module (`domain/classDiagram/model/`) and specified there.
- `ParseResult` is the delivery envelope: it carries the tree on `ready` / `missingAnnotations`, withholds it on `invalidSyntax`, and always carries diagnostics. The ring shows `DiagramTree` because that is the artifact; the status discriminant is control flow the ring omits.

### `ElementViews` — Derivator output

```ts
type ElementViews = {
  classes: ClassBoxView[];
  namespaces: NamespaceBoxView[];
  relationships: RelationshipView[];
  notes: NoteView[];
  legend: LegendView;
  diagnostics: EditorDiagnostic[];
};

type ClassBoxView = {
  classId: ClassId;
  x: number; y: number; w: number; h: number;
  header: { label: string; stereotype?: string };
  members: { memberId: MemberId; prefix: string; text: string }[];
  style?: { fill?: string; stroke?: string; color?: string };
};

type NamespaceBoxView = {
  namespaceId: NamespaceId;
  bounds: Rect;                 // derived from member-class rectangles
  label: string;
  style?: { fill?: string; stroke?: string; color?: string };
};

type RelationshipView = {
  viewId: RelationshipViewId;   // stable, derived — not a source fact
  sourceClassId: ClassId;
  targetClassId: ClassId;
  relationType: RelationshipType;
  sourceMultiplicity?: string;
  targetMultiplicity?: string;
  label?: string;
  sourceLocation: SourceLocation;
};

type NoteView = {
  noteId: NoteId;
  text: string;
  x?: number; y?: number; w?: number; h?: number;
  attachedTo?: ClassId;
};

type LegendView = {
  entries: { label: string; style: { fill?: string; stroke?: string; color?: string } }[];
};
```

- Derived, lossy, transient render descriptors — exactly what the canvas draws, plus facts absent from source (`bounds`, default note placement, stable `viewId`s, the generated `legend`).
- One-directional: source cannot be reconstructed from it. Recomputed each parse; owned by no file.

### `EditorCommand` — Interaction Controllers output

```ts
type EditorCommand =
  | { type: "class.move";                   classId: ClassId; rect: Rect }
  | { type: "class.resize";                 classId: ClassId; rect: Rect }
  | { type: "class.header.setLabel";        classId: ClassId; label: string }
  | { type: "class.member.setText";         classId: ClassId; memberId: MemberId; text: string }
  | { type: "class.member.setPrefix";       classId: ClassId; memberId: MemberId; prefix: MemberPrefix }
  | { type: "style.setClassProperty";       classId: ClassId; property: StyleProperty; value: string }
  | { type: "namespace.move";               namespaceId: NamespaceId; delta: Point }
  | { type: "namespace.setStyle";           namespaceId: NamespaceId; property: StyleProperty; value: string }
  | { type: "relationship.setType";         relationshipId: RelationshipViewId; relationType: RelationshipType }
  | { type: "relationship.setMultiplicity"; relationshipId: RelationshipViewId; endpoint: "source" | "target"; value: string | null }
  | { type: "relationship.setLabel";        relationshipId: RelationshipViewId; label: string | null }
  | { type: "note.move";                    noteId: NoteId; rect: Rect }
  | { type: "note.resize";                  noteId: NoteId; rect: Rect }
  | { type: "note.setText";                 noteId: NoteId; text: string }
  | { type: "generate" };
```

- A named product intent — one variant per editable behavior, in domain terms, never text terms. Transient, in-flight only.
- The union the write families key off: each variant routes to one Command Handler. Adding a feature-map behavior adds a variant here.

### `SourceEdit[]` — Command Handlers output

```ts
type SourceEdit =
  | { kind: "replaceLine";  lineNumber: number; newText: string }
  | { kind: "insertLine";   lineNumber: number; newText: string }
  | { kind: "deleteLine";   lineNumber: number }
  | { kind: "replaceRange"; startLine: number; endLine: number; newText: string };
```

- A line-oriented patch in source coordinates (line numbers), not domain terms — the crossing-back point from intent to text.
- The only artifact that leaves the webview; App posts it to the host.

### Shared atoms

Referenced above, defined across `domain/classDiagram/` (model, commands); created in Sprint 2.

- `ClassId`, `NamespaceId`, `NoteId` — element identity (Mermaid IDs where stable, else Shiny-assigned).
- `MemberId` — branded string; member identity within a class body.
- `RelationshipViewId` — stable, derived relationship id; a render fact, not a source fact.
- `MemberPrefix` — member marker: none, `+`, `-`, `#`, `~`, `$`, `*`.
- `StyleProperty`, `RelationshipType` — enumerations of style properties and relationship kinds.
- `Rect`, `Point`, `SourceLocation` — geometry and source-position primitives.
