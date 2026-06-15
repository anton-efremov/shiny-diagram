# Shiny-diagram specification

Shiny is a software diagramming tool for AI-human co-creation around source-controlled diagrams. It is two things:

1. **An annotation syntax** — a Mermaid-compatible way of storing persistent visual layout (position and size) as comments alongside a diagram's semantic content.
2. **A live editor** — a visual surface, synchronized with that source, where a user and an AI collaborate on the same diagram.

The core product promise is that diagrams remain readable, versionable, and AI-editable as text, while also supporting direct visual operations such as moving, resizing, and adding or editing diagram elements.

## Product context

Current diagramming tools leave a gap between visual editing and source-based automation.

- **Human-first visual editors**, such as Excalidraw or whiteboarding tools, are optimized for manual layout and free-form manipulation. They are expressive and tactile, but the resulting artifact is difficult for AI to modify structurally and difficult for software teams to review meaningfully in version control.
- **Diagram-as-a-code tools** like Mermaid are AI friendly but do not allow user to edit resulting diagram visually and do not encode/preserve layout of a diagram (important for human perception)
- **AI-generated images** are even less suitable for software diagram workflows. They may look good, but they are not reliably editable - only through AI prompting with unstable outcomes

Shiny solution:

- Language for persistent visual annotations in Mermaid code
- Visual editor synchronized with Mermaid code, that stays the single source of truth The source file always remains a valid Mermaid. A standard Mermaid renderer should ignore Shiny annotations and still render the diagram. Shiny therefore extends Mermaid as a compatible authoring convention, not forking Mermaid syntax.

The end-state loop AI-human co-creation loop:

1. AI generates or edits Mermaid source.
2. Shiny renders it visually inside VS Code.
3. The user moves, resizes, and edits visual objects.
4. Shiny writes visual changes back into Mermaid-compatible comments.
5. AI sees the same source file, including visual annotations, and can continue editing without losing the user’s visual intent.

The durable artifact is the `.mmd` source file. The visual editor is a projection and manipulation surface over that file.

## 1. Annotation syntax

Shiny uses Mermaid-compatible comment annotations.

The base diagram remains normal Mermaid. Shiny annotations are comments that standard Mermaid renderers ignore.

#### Example

```js
classDiagram
direction TB
    class ConversationThread {
	    +UUID id
	    +List~TextMessage~ messages
	    +List~UserContact~ participants
	    +addMessage(TextMessage message) void
	    +addParticipant(UserContact participant) void
    }

    class TextMessage {
	    +UUID id
	    +String content
	    +DateTime timestamp
	    +UserContact sender
	    +List~FileAttachment~ attachments
	    +attachFile(FileAttachment attachment) void
	    +removeAttachment(UUID attachmentId) void
    }

    class UserContact {
	    +UUID id
	    +String name
	    +String emailAddress
	    +List~CommunicationChannel~ preferredChannels
	    +addCommunicationChannel(CommunicationChannel channel) void
	    +removeCommunicationChannel(UUID channelId) void
    }

    ConversationThread --> TextMessage : contains
    ConversationThread --> UserContact : involves

    %% Native Style Applications
    class ConversationThread:::Rose
    class TextMessage:::Pine
    class UserContact:::Pine

    %% Native Style Definitions
    classDef Rose stroke-width:1px,stroke-dasharray:none,stroke:#FF5978,fill:#FFDFE5,color:#8E2236
    classDef Pine stroke-width:1px,stroke-dasharray:none,stroke:#254336,fill:#27654A,color:#FFFFFF

    %% --- VISUAL ANNOTATIONS CORNERSTONE ---
    %% @spatial:ConversationThread x=100 y=150 w=320 h=210
    %% @spatial:TextMessage x=500 y=150 w=300 h=250
    %% @spatial:UserContact x=300 y=500 w=300 h=230
```

#### Spatial annotation format

A spatial annotation has this form:

```js
%% @spatial:<object-id> x=<number> y=<number> w=<number> h=<number>
```

Rules:

- each annotation is a Mermaid comment;
- line starts with `%% @spatial:`;
- object ID follows immediately after `@spatial:`;
- required keys are `x`, `y`, `w`, and `h`;
- values are numbers;
- coordinates use top-left origin;
- units are CSS pixels;
- for class diagrams, object identity is the class name;
- unknown future keys should be ignored;
- annotations might be placed anywhere, although canonical form should be grouping under `%% --- VISUAL ANNOTATIONS CORNERSTONE ---`; near the bottom of the file, close to Mermaid-native style declarations.

#### Object identity

For class diagrams, the object ID is the Mermaid class name:

```js
class ConversationThread {
  +UUID id
}
```

The corresponding spatial annotation is:

```js
%% @spatial:ConversationThread x=100 y=150 w=320 h=210
```

Shiny treats this class name as the stable visual identity for the class box.

#### Styling ownership

Mermaid owns styling. Shiny annotations own spatial layout.

Correct:

```js
class ConversationThread:::Rose
classDef Rose stroke-width:1px,stroke:#FF5978,fill:#FFDFE5,color:#8E2236

%% @spatial:ConversationThread x=100 y=150 w=320 h=210
```

Incorrect:

```js
%% @spatial:ConversationThread x=100 y=150 w=320 h=210 fill=#FFDFE5 stroke=#FF5978
```

If a visual property is representable in Mermaid syntax, it belongs in Mermaid syntax. If a visual property is not representable in Mermaid syntax and is required for manual layout persistence, it may belong in Shiny annotations.

Initial Shiny annotations are limited to position and size.

#### Annotation robustness

Shiny should tolerate:

- fully annotated files;
- partially annotated files;
- unannotated files;
- incomplete annotation sections;
- reordered annotation lines;
- unknown future keys;
- whitespace variations.

Shiny should normalize annotations when it writes them, but preserve non-annotation Mermaid source as much as possible.

If an annotation references a missing object, Shiny should not delete it automatically. It may mark it as orphaned.

If multiple annotations target the same object, Shiny should use a deterministic rule, such as last annotation wins, and surface a warning.

If an annotation is malformed, Shiny should ignore that annotation, preserve the source text, and generate or request valid layout data for the affected object.

## 2. Live editor

The Shiny webview is the product's visual editing surface. It should feel like a diagram editor embedded inside VS Code, not like an external web application.

It has one shared app shell and two mutually exclusive views:

```txt
View: Autorender | Editor
```

### App shell

The app shell is the persistent frame around both views.

```txt
┌──────────────────────────────────────────────────┐
│  Shiny Diagram            ( Autorender | Editor ) │
│                            ⚠ <status message>     │
├──────────────────────────────────────────────────┤
│                                                    │
│                    <active view>                  │
│                                                    │
└──────────────────────────────────────────────────┘
```

Elements:

- **Title** — identifies the panel as Shiny.
- **View toggle** — switches between `Autorender` and `Editor`.
- **Status message** — shown only in the Editor view, only when the source has a problem: invalid Mermaid syntax (with the parse error), or one or more classes missing a `@spatial` annotation (with a `Generate` action that adds them).

### Autorender view

The Autorender view displays the current Mermaid source using the standard Mermaid renderer. It is a compatibility and debugging view, not a visual editing surface.

It proves that Shiny files remain valid Mermaid files — the user can compare Shiny's source-backed editor against standard Mermaid rendering and quickly detect Mermaid syntax or style issues. Shiny annotations are ignored by the standard Mermaid renderer because they are Mermaid comments.

Contains:

- Mermaid-rendered diagram canvas;
- standard zoom/pan controls.

Does not contain: draggable objects, resize handles, creation tools, inspector controls, or style editing tools. It never modifies source code.

### Editor view

The Editor view is the core product experience. It gives humans direct manipulation while preserving Mermaid source as the durable artifact. For class diagrams, each class appears as a semantic class box, not merely as a rectangle.

```txt
┌──────────┬──────────────────────────────┬──────────┐
│          │                              │          │
│   Tool   │            Canvas            │  Style   │
│   pane   │   (class boxes + edges)       │  pane    │
│          │                              │          │
│          │                              │          │
└──────────┴──────────────────────────────┴──────────┘
```

#### Canvas

The canvas renders one box per class and one edge per relationship, positioned using each class's `@spatial` annotation. The user can pan and zoom the canvas, drag boxes to new positions, and click a box to select it (driving the style pane).

If one or more classes are missing a `@spatial` annotation, the canvas shows the list of affected classes instead, until `Generate` (in the status message) adds annotations for them.

#### Class box

```txt
┌─────────────────────────────┐
│        <<Stereotype>>        │   ← optional
│         ClassName             │   ← header
├───────────────────────────────┤
│ +fieldName: Type                │
│ +methodName(arg: Type): Return  │   ← members
│ -privateField: Type             │
├───────────────────────────────┤
│ +anotherMethod(): void          │
└─────────────────────────────────┘
```

- **Move** — drag the box; on drop, Shiny writes the new `x`/`y` to its `@spatial` annotation.
- **Resize** — drag a handle on any edge/corner to change `w`/`h` (writes back to `@spatial`).
- **Selection** — clicking a box selects it, showing its style in the style pane; clicking empty canvas clears selection.
- **Color** — fill, stroke, and text color come from the Mermaid-native `classDef`/`:::StyleName` the class is assigned to, not from Shiny annotations.

#### Tool pane

A palette of class-diagram element types, for adding new elements to the diagram:

```txt
┌──────┬──────────────┐
│ [C]  │ Class         │
│<<I>> │ Interface     │
│<<A>> │ Abstract class│
│<<E>> │ Enumeration   │
│ ...  │ ...           │
├──────┼──────────────┤
│ -->  │ Association   │
│ <|-- │ Inheritance   │
│ *--  │ Composition   │
│ ...  │ ...           │
└──────┴──────────────┘
```

#### Style pane

Shows the style of the currently selected class. Empty when no class is selected.

```txt
┌──────────────────────────┐
│ Styles                    │
├──────────────────────────┤
│ Class                     │
│ ClassName                 │
│ <<Stereotype>>            │  ← if present
│                           │
│ ┌───────────────────────┐ │
│ │ ClassName    [preview] │ │
│ │ StyleName | Default    │ │
│ └───────────────────────┘ │
│                           │
│ Fill    [swatch] #RRGGBB  │  ← editable
│ Stroke  [swatch] #RRGGBB  │
│ Text    [swatch] #RRGGBB  │
└──────────────────────────┘
```

Fill is editable via a color picker, which writes the corresponding `classDef` property in Mermaid source. Stroke and text are currently shown but not yet editable.

## Key journeys

### 1. Open a diagram

Shiny exposes two entry points to open a diagram panel beside the currently active Mermaid document:

- a VS Code command: `Shiny: Open Diagram`
- an icon on top of `.mmd` code panes

When a user opens a Mermaid diagram with Shiny, the extension reads the source, parses supported Mermaid objects, parses Shiny annotations, and opens the WebView beside the source editor.

If the file is fully annotated, the Editor view uses stored positions and sizes.

If the file is partially annotated, Shiny preserves existing positions and generates non-overlapping positions for missing objects according to the current annotation-completion policy.

If the file is unannotated, Shiny can generate initial spatial annotations and make the diagram visually editable. The exact trigger for writing missing annotations may be refined in sprint-level specifications.

Expected outcome: the diagram becomes editable in Shiny while remaining valid Mermaid.

### 2. Edit visually

When a user moves or resizes an object in the Editor view, Shiny updates the matching `@spatial` annotation in the Mermaid source.

Expected outcome:

- visual layout persists after reopening;
- Git diff shows layout changes as text;
- AI can see and preserve user layout;
- the WebView remains synchronized because the source edit was produced by Shiny.

### 3. Edit source manually

When a user edits the Mermaid source directly, Shiny does not re-render on every keystroke. Instead, it schedules a delayed automatic render so the user can finish typing.

Flow:

1. User edits the Mermaid source.
2. Extension host detects the document change.
3. The current canvas remains visible.
4. After a short debounce delay, Shiny re-reads the source.
5. Shiny re-parses Mermaid and annotations.
6. Shiny refreshes the active view.

Expected outcome: source editing remains automatic but stable; incomplete typing does not cause immediate unstable visual updates.

### 4. AI edits source

When AI adds or changes Mermaid source, Shiny treats it like any other external source edit.

Flow:

1. AI modifies the `.mmd` file.
2. Extension host detects the source change.
3. After the debounce delay, Shiny re-reads and re-renders the source.
4. If AI added a new object without annotation, Shiny handles it according to the current annotation-completion policy.
5. Existing annotated layout is preserved where possible.

Expected outcome: AI can modify diagram semantics without destroying manual visual layout.

### 5. Review in Git

Diagram changes are reviewed as text.

Expected distinction:

- Mermaid semantic changes show changed classes, relationships, labels, fields, or methods.
- Mermaid style changes show changed `class`, `classDef`, or style syntax.
- Shiny layout changes show changed `@spatial` coordinates.

Expected outcome: reviewers can distinguish semantic, styling, and layout-only changes.

### 6. Handle unsupported or invalid input

If source contains unsupported Mermaid syntax, Shiny should preserve source and render supported objects where safe.

If Mermaid rendering fails, the Autorender view should show the error.

If the Editor view cannot safely parse the source, it should not overwrite the file.

Malformed, duplicate, or orphaned annotations should be preserved and surfaced as diagnostics rather than silently deleted.

Expected outcome: Shiny degrades safely and avoids destructive rewrites.

## Product principles and boundaries

Shiny follows these product principles:

- **Source-first:** the `.mmd` file is the durable artifact.
- **Mermaid-compatible:** Shiny files remain valid Mermaid files.
- **Layout separate from semantics:** Mermaid owns meaning and supported styling; Shiny owns persistent layout metadata.
- **Human and AI symmetry:** humans edit visually; AI edits text; both work on the same artifact.
- **Safe degradation:** unsupported syntax and malformed annotations must not cause destructive rewrites.
- **Version-control readability:** Git diffs should reveal whether a change is semantic, stylistic, or spatial.

Product boundaries:

- Shiny is not a Mermaid replacement.
- Shiny is not a free-form drawing tool.
- Shiny is not an image-generation tool.
- Shiny is not initially a collaborative cloud whiteboard.

Shiny is a source-backed visual editing layer for structured Mermaid diagrams. The first supported diagram family is class diagrams. Future support may include flowcharts, sequence diagrams, entity-relationship diagrams, and architecture diagrams, but the product architecture should not assume all Mermaid diagram types have identical object identity or layout semantics.