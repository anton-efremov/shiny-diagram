# Shiny — specification

## 1. Summary

Shiny is a software diagramming tool for AI-human co-creation around source-controlled diagrams. It is two things:

- **An annotation syntax** — a Mermaid-compatible way of storing persistent visual layout and style as comments alongside a diagram's semantic content.
- **A live editor** — a visual surface, synchronized with that source, where a user and an AI collaborate on the same diagram.

The durable artifact is the `.mmd` source file. The visual editor is a projection and manipulation surface over that file.

---

## 2. Product context

**Current diagramming tools leave a gap** between visual editing and source-based automation:

- **Human-first visual editors** (Excalidraw, whiteboarding tools) — expressive and tactile, but the resulting artifact is difficult for AI to modify structurally and difficult to review meaningfully in version control.
- **Diagram-as-code tools** (Mermaid) — AI-friendly and version-control-friendly, but do not support visual editing and do not preserve layout.
- **AI-generated images** — not reliably editable; only through prompting with unstable outcomes.

**Shiny closes the gap**:

- defines annotation syntax as a comment for persistent visual metadata in Mermaid source, so file stays valid Mermaid.
- visual editor in VS Code synchronized with Mermaid source, which remains the single source of truth.
- a standard Mermaid renderer ignores Shiny annotations and still renders the diagram correctly — Shiny extends Mermaid as a compatible authoring convention, not a fork.

**Thus Shiny enables smooth AI-human co-creation loop**:

1. AI generates or edits Mermaid source.
2. Shiny renders it visually inside VS Code.
3. The user moves, resizes, and edits visual objects.
4. Shiny writes visual changes back into Mermaid-compatible comments.
5. AI sees the same source file — including visual annotations — and can continue editing without losing the user's visual intent.

---

## 3. Annotation syntax

Shiny uses Mermaid comment lines (`%% ...`) to store visual metadata. The base diagram remains standard Mermaid. Shiny annotations are invisible to any standard Mermaid renderer.

### 3.1 Example

```
classDiagram
direction TB

    namespace Messaging {
        class ConversationThread {
            +UUID id
            +List~TextMessage~ messages
            +addMessage(TextMessage message) void
        }

        class TextMessage {
            +UUID id
            +String content
            +DateTime timestamp
            +attachFile(FileAttachment attachment) void
        }
    }

    ConversationThread --> TextMessage : contains

    %% Native style definitions
    classDef Rose stroke-width:1px,stroke-dasharray:none,stroke:#FF5978,fill:#FFDFE5,color:#8E2236
    classDef Pine stroke-width:1px,stroke-dasharray:none,stroke:#254336,fill:#27654A,color:#FFFFFF

    %% Native style applications
    class ConversationThread:::Rose
    class TextMessage:::Pine

    %% --- SHINY ANNOTATIONS ---
    %% @spatial:ConversationThread x=100 y=150 w=320 h=210
    %% @spatial:TextMessage x=500 y=150 w=300 h=250
    %% @style:Messaging fill=#E8F0FF stroke=#6699CC color=#003366 strokeWidth=1px strokeDasharray=none
```

### 3.2 Class box annotations

#### Format

```
%% @spatial:<ClassId> x=<n> y=<n> w=<n> h=<n>
```

#### Rules

- `@spatial` + class ID + key=value pairs on a single comment line
- required keys: `x`, `y`, `w`, `h` — all numeric, in canvas units
- class ID is the Mermaid class name (e.g. `ConversationThread`)
- styling of class boxes belongs to Mermaid-native `classDef`/`:::StyleName` — not to `@spatial`
- unknown keys are ignored (forward compatibility)
- annotations anywhere are valid but canonical placement is: grouped under `%% --- SHINY ANNOTATIONS ---` near the bottom of the file, close to native style declarations

### 3.3 Namespace annotations

#### Format

Unlike for class boxes, Mermaid does not support per-namespace styling natively — `@style` is a Shiny extension stored as a comment

```
%% @style:<NamespaceId> fill=<value> stroke=<value> color=<value> strokeWidth=<value> strokeDasharray=<value>
```

#### Rules

- `@style` + namespace ID + key=value pairs on a single comment line
- namespace ID is the Mermaid namespace name
- supported properties mirror Mermaid's `classDef` properties: `fill`, `stroke`, `color`, `strokeWidth`, `strokeDasharray`
- **no position annotation for namespaces** — the namespace box is always derived automatically as the bounding box of its member classes' spatial rectangles plus a fixed margin; this ensures namespace geometry is never out of sync with its members

### 3.4 Annotation robustness

The parser handles all annotation states without destructive rewrites:

- **Missing annotations** — if one or more classes lack a valid `@spatial`, the editor shows the affected class IDs and offers Generate to compute and write positions for them. The canvas does not render until all classes are positioned.
- **Malformed annotation** — the affected class is treated as missing; its source line is preserved and offered for replacement by Generate.
- **Unknown keys** — silently ignored.
- **Reordered or whitespace-varied annotations** — accepted without normalisation until Shiny writes them back.
- **Orphaned annotation** (references a class that no longer exists) — preserved in source, surfaced as a diagnostic; not silently deleted.
- **Duplicate annotations** for the same class — last annotation wins; a warning is surfaced.

---

## 4. Live editor

The Shiny webview is the product's visual editing surface. It feels like a diagram editor embedded inside VS Code.

It has one persistent app shell and two mutually exclusive views.

### 4.1 App shell

```
┌─────────────────────────────────────────────────────────────┐
│  Shiny Diagram                                              │
│  [ Autorender | Editor ]  <status message>   [ Generate ]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                         <active view>                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

- **Title** — identifies the panel as Shiny
- **View toggle** — switches between Autorender and Editor
- **Status message** — shown when action is needed (malformed annotations, invalid syntax, orphaned annotations, duplicated annotations):
	- if annotations are malformed, **Generate** button renders, to add annotations to source code automatically
	- if state prevents rendering (malformed annotations, invalid syntax), then in place of active view, the list of problems is printed

### 4.2 Autorender view

Displays standard Mermaid diagram using Mermaid renderer. An informational view — not a visual editing surface.

- Shiny annotations are ignored by the renderer (they are comments)
- contains: Mermaid-rendered canvas, zoom/pan controls
- never modifies source

### 4.3 Editor view

The core product experience. Gives humans direct manipulation while preserving Mermaid source as the durable artifact.

```
┌──────────┬──────────────────────────────┬──────────┐
│          │                     (Legend) │          │
│   Tool   │           Canvas             │  Style   │
│   pane   │         (Diagram)            │  pane    │
│          │                              │          │
└──────────┴──────────────────────────────┴──────────┘
```

#### 4.3.1 Canvas

- renders one box per class and one edge per relationship, positioned from each class's `@spatial` annotation
- namespaces rendered as derived bounding boxes around their member classes, styled from `@style` annotation if present
- user can pan, zoom, drag boxes, resize boxes, and click to select
- if any class is missing a `@spatial`, the canvas shows the list of affected classes until Generate resolves them
- legend is generated automatically from the types of classes present in diagram and styles defined for classes and namespaces

#### 4.3.1.a Class box

```
┌───────────────────────────────┐
│        <<Stereotype>>         │   ← optional
│         ClassName             │   ← header
├───────────────────────────────┤
│ +fieldName: Type              │
│ +methodName(arg: Type): Return│   ← members
│ -privateField: Type           │
└───────────────────────────────┘
```

Actions:
- **Move** — drag the box; on drop, Shiny writes the new `x`/`y` to its `@spatial` annotation
- **Resize** — drag a handle on the border to change `w`/`h`; writes back to `@spatial`
- **Select** — click to select; drives the style pane; click empty canvas to deselect
- **Edit fields** - click on one text area (members or header) and edit the text inside

#### 4.3.1.b Namespace box
rendered as a labeled border around its member classes

Actions
- **Move** — drag the namespace box; all member classes move by the same delta; each member's `@spatial` is updated
- **Style** — fill, stroke, text color, stroke width, and dash pattern editable via style pane; writes back to `@style` annotation

#### 4.3.2 Tool pane

Palette of diagram elements for adding new content:

```
┌──────┬───────────────────┐
│ [C]  │ Class             │
│<<I>> │ Interface         │
│<<A>> │ Abstract class    │
│<<E>> │ Enumeration       │
├──────┼───────────────────┤
│ -->  │ Association       │
│ <|-- │ Inheritance       │
│ *--  │ Composition       │
│ ...  │ ...               │
├──────┼───────────────────┤
│ [NS] │ Namespace         │
├──────┼───────────────────┤
│ [L]  │ Add legend        │
└──────┴───────────────────┘
```

#### 4.3.5 Style pane

Shows the style of the currently selected element. Empty when nothing is selected.

```
┌───────────────────────────┐
│ ClassName / NamespaceName │
│ Change <<Stereotype>>     │  ← if present
├───────────────────────────┤
│ Fill         [●] #RRGGBB  │
│ Stroke       [●] #RRGGBB  │
│ Text color   [●] #RRGGBB  │
│ Stroke width [___] px     │
│ Stroke dash  [___]        │
├───────────────────────────┤
│ [ Fit to content ]        │
│ [ Delete element ]        │
└───────────────────────────┘
```

- all color properties editable via color picker
- changes write to `classDef` (for class boxes) or `@style` annotation (for namespaces)
- **Fit to content** — resizes the box to fit its current content; writes back to `@spatial`
- **Delete element** — removes the element and its annotations from source

---
## 5. Key journeys

### 5.1 Open a diagram

- user runs `Shiny: Open Diagram` command or clicks the Shiny icon on a `.mmd` editor pane
- Shiny opens the webview beside the source editor
- source is parsed; if fully annotated, Editor view renders immediately
- if any class is missing a `@spatial`, the canvas shows the missing class list and offers Generate

### 5.2 Edit visually

- user drags or resizes a class box or namespace
- Shiny writes the updated annotation back to source immediately on drop
- outcomes:
    - visual layout persists after reopening
    - Git diff shows layout changes as text
    - AI can see and preserve user layout
    - webview stays in sync — no re-render needed for Shiny-originated edits

### 5.3 Edit source manually

- user edits `.mmd` source directly in VS Code
- Shiny detects the change, holds the current canvas visible, and waits for a short debounce delay
- after the delay, Shiny re-parses source and refreshes the active view
- outcome: source editing is smooth; incomplete typing does not cause unstable visual updates

### 5.4 AI edits source

- AI modifies the `.mmd` file
- Shiny treats it identically to a manual source edit — debounce, re-parse, re-render
- existing annotated layout is preserved where possible
- if AI adds a new class without `@spatial`, it appears in the missing class list; Generate resolves it
- outcome: AI can modify diagram semantics without destroying manual visual layout

### 5.5 Review in Git

- semantic changes: modified classes, relationships, labels, fields, methods
- style changes: modified `classDef` or `:::StyleName` lines
- layout changes: modified `@spatial` coordinates
- namespace style changes: modified `@style` annotation lines
- outcome: reviewers can distinguish semantic, styling, and layout-only changes at a glance

### 5.6 Handle invalid input

- unsupported Mermaid syntax: Shiny preserves source and does not overwrite the file
- Mermaid rendering failure: Autorender view shows the error
- malformed or orphaned annotations: preserved in source, surfaced as diagnostics, not silently deleted
- outcome: Shiny degrades safely; no destructive rewrites

---

## 6. Product principles and boundaries

**Principles:**

- **Source-first** — the `.mmd` file is the durable artifact
- **Mermaid-compatible** — Shiny files remain valid Mermaid files
- **Layout and style separate from semantics** — Mermaid owns meaning and native styling; Shiny owns persistent layout metadata and namespace style extensions
- **Human and AI symmetry** — humans edit visually; AI edits text; both work on the same artifact
- **Safe degradation** — unsupported syntax and malformed annotations never cause destructive rewrites
- **Version-control readability** — Git diffs reveal whether a change is semantic, stylistic, or spatial

**Boundaries:**

- Shiny is not a Mermaid replacement
- Shiny is not a free-form drawing tool
- Shiny is not an image-generation tool
- Shiny is not a collaborative cloud whiteboard