# Shiny PoC Spec

We are building a 1-day proof-of-concept repo for a VS Code extension called **Shiny**.

## Product context

Shiny is a software diagramming tool for AI-human co-creation.

Current diagramming tools have a gap:

* human-first visual editors like Excalidraw are high-effort and not naturally source-controlled;
* AI-generated diagrams like Mermaid are source-controlled but hard to visually edit;
* AI-generated pictures are not structurally editable.

Shiny’s idea:

> Keep Mermaid as the semantic source of truth, but add persistent visual annotations in Mermaid comments, so humans can visually edit positions/sizes while AI can keep editing the same source file.

The source file must always remain valid Mermaid. Standard Mermaid renderers should ignore our annotations.

For this PoC, we focus on **class diagrams**, not flowcharts, because class diagrams are semantically richer and better test the real product idea.

## Core PoC goal

Prove this loop:

1. User has a Mermaid class diagram in a `.mmd` file.
2. User opens Shiny visual editor from VS Code.
3. Shiny renders the diagram in two modes:

   * standard Mermaid autorender mode;
   * Shiny editor mode with draggable/resizable boxes.
4. In editor mode, moving/resizing boxes updates `%% @spatial:<ClassName> ...` annotations in the Mermaid source file.
5. If user manually edits source code, the visual view becomes stale.
6. User presses Render to re-parse source and refresh visual view.
7. If some classes are missing annotations, Shiny fills them with simple non-overlapping default positions.

This is a PoC, not production architecture. Prioritize working vertical slice.

## Tech stack

Use:

* TypeScript everywhere.
* VS Code extension API.
* React + Vite for webview UI.
* React Flow / `@xyflow/react` for draggable/resizable class boxes.
* Mermaid package for standard Mermaid autorender mode.
* No backend.
* No database.
* No Docker.
* Development environment: VS Code + WSL.

## Expected repo shape

Create a whole PoC repo. Suggested structure:

```txt
shiny-poc/
  package.json
  tsconfig.json
  vite.config.ts
  CLAUDE.md
  README.md

  examples/
    thread.mmd

  src/
    extension.ts
    panel/ShinyPanel.ts
    document/mermaidDocument.ts
    parser/classDiagramParser.ts
    serializer/spatialSerializer.ts
    layout/layoutCompletion.ts
    model/types.ts

  webview/
    index.html
    src/
      main.tsx
      App.tsx
      vscodeApi.ts
      modes/AutorenderView.tsx
      modes/EditorView.tsx
      components/ClassNode.tsx
      types.ts
```

Adjust structure if needed, but keep modules separated.

## Initial example file

Create `examples/thread.mmd` with this exact content:

```mermaid
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

## Annotation syntax

For PoC, use this exact syntax:

```mermaid
%% --- VISUAL ANNOTATIONS CORNERSTONE ---
%% @spatial:ConversationThread x=100 y=150 w=320 h=210
%% @spatial:TextMessage x=500 y=150 w=300 h=250
%% @spatial:UserContact x=300 y=500 w=300 h=230
```

Rules:

* Each annotation is a Mermaid comment.
* Line starts with `%% @spatial:`.
* The object ID follows immediately after `@spatial:`.
* Then key-value pairs follow.
* Required keys: `x`, `y`, `w`, `h`.
* Values are numbers.
* Coordinates use top-left origin, pixels.
* For class diagrams, object identity is the class name.
* Unknown future keys should be ignored.
* Keep all spatial annotations grouped under `%% --- VISUAL ANNOTATIONS CORNERSTONE ---`.

Important design rule:

* Mermaid native syntax owns styles.
* Shiny annotations own only position and size.
* Do not duplicate Mermaid style in Shiny annotations.

So this is correct:

```mermaid
class ConversationThread:::Rose
classDef Rose stroke-width:1px,stroke:#FF5978,fill:#FFDFE5,color:#8E2236

%% @spatial:ConversationThread x=100 y=150 w=320 h=210
```

Do not store `fill`, `stroke`, `color`, etc. inside `@spatial`.

## Functional requirements

### VS Code extension

Implement a VS Code command:

```txt
Shiny: Open Diagram
```

Behavior:

* It opens a webview panel beside the currently active `.mmd` document.
* It reads the active editor text.
* It parses Mermaid class diagram content.
* It sends the parsed model and raw source to the webview.
* It listens for document changes.
* If document changes manually, tell webview that current render is stale.
* If document changes because Shiny patched annotations after drag/resize, do not mark stale.

### Webview UI

The webview should have two rendering modes/buttons:

```txt
[Autorender] [Editor] [Render]
```

Mode 1: **Autorender**

* Use standard Mermaid renderer.
* Render raw Mermaid source.
* Purpose: prove file is still valid Mermaid.
* No drag/resize in this mode.

Mode 2: **Editor**

* Use React Flow.
* Render class boxes from parsed Mermaid model.
* Use `@spatial` annotations for node position and size.
* Allow moving boxes.
* Allow resizing boxes.
* On move/resize, send message to extension:

  * class ID;
  * new x;
  * new y;
  * new w;
  * new h.

Render button:

* Re-read/re-parse current source.
* Refresh current view.
* Clear stale indicator.

### Stale behavior

Do not live-sync manual code edits into the visual view.

Instead:

* If user manually edits code, show a clear stale message in webview:

```txt
Source changed. Press Render to refresh.
```

* User presses Render.
* Extension reads current source again.
* Webview updates.

But editor-originated changes should be immediate:

* User drags/resizes in React Flow.
* Webview sends update to extension.
* Extension patches source annotation.
* View should not become stale.

### Parser requirements

Do not implement full Mermaid parser. Use pragmatic regex parsing sufficient for PoC.

Support:

```mermaid
classDiagram
direction TB
class ConversationThread { ... }
ConversationThread --> TextMessage : contains
class ConversationThread:::Rose
classDef Rose ...
%% @spatial:ConversationThread x=100 y=150 w=320 h=210
```

Extract:

```ts
type ShinyDiagram = {
  diagramType: "classDiagram";
  direction?: string;
  classes: ShinyClass[];
  relations: ShinyRelation[];
  styleApplications: Record<string, string>; // classId -> styleName
  styleDefinitions: Record<string, string>;  // styleName -> raw Mermaid style string
  spatial: Record<string, SpatialAnnotation>;
  rawSource: string;
};

type ShinyClass = {
  id: string;
  members: string[];
};

type ShinyRelation = {
  from: string;
  to: string;
  arrow: string;
  label?: string;
};

type SpatialAnnotation = {
  x: number;
  y: number;
  w: number;
  h: number;
};
```

### Layout completion

If a class lacks spatial annotation, generate one.

Do not rely on Mermaid auto-layout for this PoC.

Use a simple non-overlapping grid algorithm:

* Estimate default box width: `320`.
* Estimate height from member count:

  * `h = max(160, 70 + 24 * members.length)`.
* Start at `x=100`, `y=100`.
* Gap: `80`.
* Use 3 columns.
* Skip positions that overlap existing annotated boxes.
* Add missing `@spatial` lines to source.

This lets Shiny handle partially annotated files.

### Source patching

Implement serializer functions:

* parse spatial annotations from source;
* update one class annotation;
* insert missing annotation section if absent;
* replace only the visual annotation section when possible;
* preserve rest of Mermaid source exactly.

Preferred source section:

```mermaid
    %% --- VISUAL ANNOTATIONS CORNERSTONE ---
    %% @spatial:ConversationThread x=100 y=150 w=320 h=210
```

When updating, keep formatting simple and deterministic.

### Editor rendering

In editor mode:

* Use React Flow.
* Each class is a custom node.
* Node content should roughly show:

  * class name as header;
  * members as lines.
* Use basic visual style.
* Nice-to-have: apply native Mermaid classDef styles approximately if easy, but do not spend much time on it. Core is layout persistence.
* Relationships can be drawn using React Flow edges or simple SVG/React Flow edges.
* Edge routing does not need to be good.
* Edge editing is out of scope.

### Resizing

Use the simplest React Flow-compatible resize implementation.

Acceptable options:

* use React Flow node resize controls if available;
* or implement a small bottom-right resize handle inside custom node.

Requirements:

* resize updates `w/h`;
* source annotation updates accordingly;
* manual `w/h` edit in source, then pressing Render, changes box size.

## Non-goals

Do not implement:

* adding new classes from UI;
* deleting classes from UI;
* editing class text from UI;
* color/style editor;
* edge layout persistence;
* edge styling annotations;
* full Mermaid grammar support;
* multi-file annotations;
* collaboration;
* production-grade extension packaging.

## Acceptance criteria

The PoC is successful when this works:

1. Open `examples/thread.mmd`.
2. Run `Shiny: Open Diagram`.
3. Webview opens beside source.
4. Autorender mode renders standard Mermaid diagram.
5. Editor mode renders 3 class boxes.
6. Drag `TextMessage`.
7. Source changes line:

```mermaid
%% @spatial:TextMessage x=... y=... w=300 h=250
```

8. Resize `UserContact`.
9. Source changes line:

```mermaid
%% @spatial:UserContact x=... y=... w=... h=...
```

10. Manually edit `ConversationThread` annotation in source.
11. Webview shows stale state.
12. Press Render.
13. Box moves/resizes according to manual source change.
14. Remove one `@spatial` line manually.
15. Press Render.
16. Shiny generates a non-overlapping annotation for the missing class.

## Development instructions

Please implement in milestones. After each milestone, run build/tests if available and summarize what changed.

Suggested milestones:

1. Scaffold VS Code extension + React/Vite webview.
2. Add `examples/thread.mmd`.
3. Implement parser and serializer.
4. Implement webview open command and message passing.
5. Implement editor mode with React Flow class boxes.
6. Implement drag-to-source update.
7. Implement resize-to-source update.
8. Implement stale/render behavior.
9. Implement autorender mode with Mermaid.
10. Clean up README with how to run/debug.

Keep the code simple. This is a one-day PoC. Avoid overengineering.
