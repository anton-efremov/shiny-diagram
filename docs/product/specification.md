# Shiny-diagram specification

Shiny is a software diagramming tool for AI-human co-creation around source-controlled diagrams. It lets a user and an AI collaborate on the same Mermaid diagram through two synchronized representations: Mermaid source code as the durable semantic artifact, and a visual editor as the human-friendly manipulation surface. The core product promise is that diagrams remain readable, versionable, and AI-editable as text, while also supporting direct visual operations such as moving, resizing, and adding or editing diagram elements.

## Product context

Current diagramming tools leave a gap between visual editing and source-based automation.
- **Human-first visual editors**, such as Excalidraw or whiteboarding tools, are optimized for manual layout and free-form manipulation. They are expressive and tactile, but the resulting artifact is difficult for AI to modify structurally and difficult for software teams to review meaningfully in version control.
- **Diagram-as-a-code tools** like Mermaid are AI friendly but do not allow user to edit resulting diagram visually and do not encode/preserve layout of a diagram (important for human perception)
- **AI-generated images** are even less suitable for software diagram workflows. They may look good, but they are not reliably editable - only through AI prompting with unstable outcomes

Shiny solution:
- Language for persistent visual annotations in Mermaid code
- Visual editor synchronized with Mermaid code, that stays the single source of truth 
The source file always remains a valid Mermaid. A standard Mermaid renderer should ignore Shiny annotations and still render the diagram. Shiny therefore extends Mermaid as a compatible authoring convention, not forking Mermaid syntax.

The end-state loop AI-human co-creation loop:
1. AI generates or edits Mermaid source.
2. Shiny renders it visually inside VS Code.
3. The user moves, resizes, and edits visual objects.
4. Shiny writes visual changes back into Mermaid-compatible comments.
5. AI sees the same source file, including visual annotations, and can continue editing without losing the user’s visual intent.

The durable artifact is the `.mmd` source file. The visual editor is a projection and manipulation surface over that file.

## Product architecture

Shiny is a VS Code extension with a source-backed visual editor.

The product has three conceptual layers:

1. **Mermaid source layer**
   The `.mmd` file contains the semantic diagram and Shiny visual annotations. This file is the source of truth.

2. **Extension host layer**
   The VS Code extension owns document access, file mutation, command registration, webview lifecycle, and communication with the editor UI.

3. **WebView editor layer**
   The webview owns the visual interface: rendering modes, diagram canvas, drag/resize interactions, stale-state display, and user controls.

The core editing loop should not require a backend server, external database, cloud storage, or non-local runtime.
## 1. Mermaid source layer

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

* each annotation is a Mermaid comment;
* line starts with `%% @spatial:`;
* object ID follows immediately after `@spatial:`;
* required keys are `x`, `y`, `w`, and `h`;
* values are numbers;
* coordinates use top-left origin;
* units are CSS pixels;
* for class diagrams, object identity is the class name;
* unknown future keys should be ignored;
* annotations might be placed anywhere, although canonical form should be grouping under `%% --- VISUAL ANNOTATIONS CORNERSTONE ---`; near the bottom of the file, close to Mermaid-native style declarations.
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

* fully annotated files;
* partially annotated files;
* unannotated files;
* incomplete annotation sections;
* reordered annotation lines;
* unknown future keys;
* whitespace variations.

Shiny should normalize annotations when it writes them, but preserve non-annotation Mermaid source as much as possible.

If an annotation references a missing object, Shiny should not delete it automatically. It may mark it as orphaned.

If multiple annotations target the same object, Shiny should use a deterministic rule, such as last annotation wins, and surface a warning.

If an annotation is malformed, Shiny should ignore that annotation, preserve the source text, and generate or request valid layout data for the affected object.

## 2. Extension host layer

Shiny exposes two entry points to open a diagram panel beside the currently active Mermaid document:

- a VS Code command: `Shiny: Open Diagram`
- an icon on top of `.mmd` code panes

The extension host is responsible for:

* reading the active `.mmd` document;
* validating supported Mermaid diagram types;
* parsing supported Mermaid structures into a diagram model;
* parsing Shiny visual annotations;
* completing missing visual annotations when required;
* creating and managing the webview panel;
* sending diagram/source data to the webview;
* receiving visual edit messages from the webview;
* patching the source file with updated annotations;
* distinguishing manual source edits from Shiny-originated edits;
* notifying the webview when its visual state is stale.

The extension host is the only layer that mutates source files. The webview must not directly access the filesystem.
## 3 WebView editor layer

The Shiny webview is the product’s visual editing surface. It should feel like a diagram editor embedded inside VS Code, not like an external web application.

The webview has one shared layout and two mutually exclusive display modes:

```txt
Mode: Autorender | Editor
Status: Rendered | Rendering | Error
```
### Layout

#### What it is

The WebView layout is the persistent frame around all Shiny diagram views. It contains shared controls, status indicators, and the main diagram canvas.

**Elements**:

* **File header** — shows active file name and relevant metadata.
* **Mode toggle** — switches between `Autorender` and `Editor`.
* **Render status** — shows whether the current view matches the current source. Updated with some delay to let user finish typing (status: Rendering). After some time status becomes either "Rendered" or "Error"
* **Canvas region** — hosts the active mode.
* **Diagnostics region** — eventually shows parse errors, unsupported syntax, orphaned annotations, duplicate annotations, and Mermaid render errors.

In Future elements may include:

* canvas minimap;
* command/search palette;

#### How it interacts with source code

Manual source edits update in the the visual canvas with certain delay to let user finish typing.

When source changes manually:

1. Extension host detects document change.
2. Extension host determines the change was not produced by Shiny visual editing.
3. WebView status changes to `Rendering`.
4. Stale state of canvas remains visible.
5. Given time elapses
6. Extension host re-reads source.
7. Shiny re-parses Mermaid and annotations.
8. Missing annotations are completed if needed.
9. Active mode is refreshed.
10. Status becomes `Rendered` or `Error`.

Editor-originated source updates are different.

When the user moves or resizes an object in Editor mode:

1. WebView sends the visual edit to the extension host.
2. Extension host patches the matching `@spatial` annotation.
3. Extension host marks the source change as Shiny-originated.
4. WebView remains `Rendered`.

### Autorender mode

#### What it is

Autorender mode displays the current Mermaid source using the standard Mermaid renderer. 
It is a compatibility and debugging view, not a visual editing surface.

#### Why we need it

Autorender mode proves that Shiny files remain valid Mermaid files. It lets the user compare Shiny’s source-backed editor with standard Mermaid rendering and quickly detect Mermaid syntax or style issues.

#### Elements

Autorender mode contains:

* Mermaid-rendered diagram canvas;
* standard zoom/pan controls 

It does not contain draggable objects, resize handles, creation tools, inspector controls, or style editing tools.

#### How it interacts with source code

Autorender mode does not modify source code.

When user switches to Autorender mode:

1. Extension host reads the current `.mmd` source.
2. WebView status becomes `Rendering`.
3. Mermaid renderer attempts to render the source.
4. On success, rendered Mermaid SVG is displayed and status becomes `Rendered`.
5. On failure, the error is displayed and status becomes `Error`.

Shiny annotations are ignored by the standard Mermaid renderer because they are Mermaid comments.

### Editor mode

#### What it is

Editor mode displays a Shiny-controlled visual editor over the Mermaid source. It uses Mermaid semantics plus Shiny spatial annotations to render manipulable diagram objects.

For class diagrams, each class appears as a semantic class box, not merely as a rectangle.

#### Why we need it

Editor mode is the core product experience. It gives humans direct manipulation while preserving Mermaid source as the durable artifact.

The goal is to let a user:

* move objects;
* resize objects;
* inspect objects;
* add, delete, and edit semantic diagram elements;
* preserve visual intent across AI edits and Git commits.

#### Elements

Initial Editor mode elements:

* diagram canvas;
* class boxes;
* relationship edges;
* move interaction;
* resize interaction;
* selection state;
* zoom/pan controls.

Future Editor mode elements:

* shape/class creation toolbar;
* relationship creation tool;
* color/style toolbar mapped to Mermaid-native style syntax;
* object inspector panel;
* diagnostics panel;
* alignment/distribution tools;
* snapping/grid controls;
* AI instruction panel;
* minimap.

For class diagrams, a class box should eventually display:

* class name;
* fields;
* methods;
* class styling derived from Mermaid-native style declarations where feasible;
* resize affordance;
* selection state;
* diagnostic state if relevant.

#### How it interacts with source code

Editor mode writes visual layout changes into Shiny annotations.

When a user moves a box:

1. WebView computes the new `x` and `y`.
2. WebView sends target object ID and updated position to the extension host.
3. Extension host patches the matching `@spatial` annotation.
4. Source file changes.
5. WebView remains synchronized.

When a user resizes a box:

1. WebView computes the new `w` and `h`.
2. WebView sends target object ID and updated size to the extension host.
3. Extension host patches the matching `@spatial` annotation.
4. Source file changes.
5. WebView remains synchronized.

Expected annotation shape:

```js
%% @spatial:TextMessage x=540 y=220 w=300 h=250
```

If the user eventually changes fill, stroke, color, or class styling through the visual UI, Shiny should write Mermaid-native style syntax, not Shiny spatial metadata.

If Editor mode detects missing spatial annotations, it may generate them during render. Existing annotated positions must be preserved.

If Editor mode detects unsupported Mermaid syntax, it should preserve source and render supported objects where safe. Unsupported content must not be deleted or rewritten silently.

## Key journeys

### 1. Open a diagram

When a user opens a Mermaid diagram with Shiny, the extension reads the source, parses supported Mermaid objects, parses Shiny annotations, and opens the WebView beside the source editor.

If the file is fully annotated, Editor mode uses stored positions and sizes.

If the file is partially annotated, Shiny preserves existing positions and generates non-overlapping positions for missing objects according to the current annotation-completion policy.

If the file is unannotated, Shiny can generate initial spatial annotations and make the diagram visually editable. The exact trigger for writing missing annotations may be refined in sprint-level specifications.

Expected outcome: the diagram becomes editable in Shiny while remaining valid Mermaid.

### 2. Edit visually

When a user moves or resizes an object in Editor mode, Shiny updates the matching `@spatial` annotation in the Mermaid source.

Expected outcome:

* visual layout persists after reopening;
* Git diff shows layout changes as text;
* AI can see and preserve user layout;
* the WebView remains synchronized because the source edit was produced by Shiny.

### 3. Edit source manually

When a user edits the Mermaid source directly, Shiny does not re-render on every keystroke. Instead, it schedules a delayed automatic render so the user can finish typing.

Flow:

1. User edits the Mermaid source.
2. Extension host detects the document change.
3. WebView status becomes `Pending render`.
4. The current canvas remains visible.
5. After a short debounce delay, Shiny re-reads the source.
6. Shiny re-parses Mermaid and annotations.
7. Shiny refreshes the active mode.
8. Status becomes `Rendered` or `Error`.

Expected outcome: source editing remains automatic but stable; incomplete typing does not cause immediate unstable visual updates.

### 4. AI edits source

When AI adds or changes Mermaid source, Shiny treats it like any other external source edit.

Flow:

1. AI modifies the `.mmd` file.
2. Extension host detects the source change.
3. WebView status becomes `Pending render`.
4. After the debounce delay, Shiny re-reads and re-renders the source.
5. If AI added a new object without annotation, Shiny handles it according to the current annotation-completion policy.
6. Existing annotated layout is preserved where possible.

Expected outcome: AI can modify diagram semantics without destroying manual visual layout.

### 5. Review in Git

Diagram changes are reviewed as text.

Expected distinction:

* Mermaid semantic changes show changed classes, relationships, labels, fields, or methods.
* Mermaid style changes show changed `class`, `classDef`, or style syntax.
* Shiny layout changes show changed `@spatial` coordinates.

Expected outcome: reviewers can distinguish semantic, styling, and layout-only changes.

### 6. Handle unsupported or invalid input

If source contains unsupported Mermaid syntax, Shiny should preserve source and render supported objects where safe.

If Mermaid rendering fails, Autorender mode should show the error.

If Editor mode cannot safely parse the source, it should not overwrite the file.

Malformed, duplicate, or orphaned annotations should be preserved and surfaced as diagnostics rather than silently deleted.

Expected outcome: Shiny degrades safely and avoids destructive rewrites.


## Product principles and boundaries

Shiny follows these product principles:

* **Source-first:** the `.mmd` file is the durable artifact.
* **Mermaid-compatible:** Shiny files remain valid Mermaid files.
* **Layout separate from semantics:** Mermaid owns meaning and supported styling; Shiny owns persistent layout metadata.
* **Human and AI symmetry:** humans edit visually; AI edits text; both work on the same artifact.
* **Safe degradation:** unsupported syntax and malformed annotations must not cause destructive rewrites.
* **Version-control readability:** Git diffs should reveal whether a change is semantic, stylistic, or spatial.

Product boundaries:

* Shiny is not a Mermaid replacement.
* Shiny is not a free-form drawing tool.
* Shiny is not an image-generation tool.
* Shiny is not initially a collaborative cloud whiteboard.

Shiny is a source-backed visual editing layer for structured Mermaid diagrams. The first supported diagram family is class diagrams. Future support may include flowcharts, sequence diagrams, entity-relationship diagrams, and architecture diagrams, but the product architecture should not assume all Mermaid diagram types have identical object identity or layout semantics.
