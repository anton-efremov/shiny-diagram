# Architecture

Shiny follows the standard VS Code extension model consisting of:
- an extension host process running in Node.js
- a Chromium WebView for the visual interface

These are isolated runtimes with a hard boundary:
- all communication crosses the boundary via `postMessage`, as JSON messages.
- `extension-host/` has no browser APIs, and `webview/src/` has no `vscode` module imports.

# 1. Holistic view 

## 1.1 Runtime view

### Extension Host

A Node.js process managed by VS Code:
- has the sole write access to the `.mmd` document on disk.
- reacts to events, debounces and routes messages.
- holds no Mermaid or diagram-semantic knowledge.

### Webview

A React app rendered inside a sandboxed Chromium iframe:
- responsible for the editor's UI
- fully owns Mermaid-related logic: parsing, the diagram tree, spatial annotation logic, rendering for both the Editor and Autorender views, user interactions, and edit computation
- isolated from the filesystem — communicates through `postMessage` with the extension host
- organized as a three-layer architecture (extensionBridge / controller / view); see `webview-architecture.md` for a full deep dive

### Protocol

All messages cross the `postMessage` boundary as JSON objects with a `type` discriminant field.

**Host → Webview**

- `SourceUpdateMessage`: `{ type: "sourceUpdate", sourceText: string }`. Carries the complete current source text. Sent when:
	  - A manual document edit's debounce settles.
	  - The host has just applied a Shiny-originated edit, to resync the webview immediately without waiting for the debounce.
- **Initial load** — different mechanism, not a `postMessage`: the host serializes the initial source text into a `#shiny-initial-data` `<script type="application/json">` tag in the webview's HTML (`webviewProvider.ts`). The webview reads it once on startup via `readInitialData()`.

**Webview → Host**

- `ApplyEditsMessage`: `{ type: "applyEdits", edits: LineEdit[] }`. Sent when a visual edit (drag, style change, Generate) needs to be written back to source.
- `LineEdit` is a discriminated union of three edit operations:
    - `{ kind: "replaceLine", lineNumber: number, newText: string }` — replaces the entire line at `lineNumber`
    - `{ kind: "insertLine", lineNumber: number, newText: string }` — inserts a new line after `lineNumber`
    - `{ kind: "deleteLine", lineNumber: number }` — deletes the line at `lineNumber`
- The host applies all edits in one transaction (`vscode.WorkspaceEdit`), in order.

## 1.2 Data flow view

Two distinct loops drive all Webview behavior.

### Source loop

Every change that must persist to the `.mmd` file travels this loop. Source is the single source of truth — the canvas is always a projection of it.

```
                         ┌──────────────────────┐
                         │     .mmd source      │
                         │  (host owns writes)  │
                         └──────────────────────┘
              sourceText │                      ▲ LineEdit[]
             postMessage │                      │ postMessage
                         ▼                      │
               ┌─────────────────┐    ┌─────────────────┐
               │     Parser      │    │    Command      │
               └─────────────────┘    │    Handlers     │
             DiagramTree │            └─────────────────┘
                         ▼                      ▲ EditorCommand
               ┌─────────────────┐    ┌─────────────────┐
               │    Derivator    │    │  Event handlers │
               └─────────────────┘    └─────────────────┘
            ElementViews │                      ▲
                         ▼                      | UI event
               ┌─────────────────────────────────────────┐
               │              React component            │
               └─────────────────────────────────────────┘
```

### Transient state loop

Ephemeral canvas state that does not touch source — hover highlights, drag previews, active tool — travels a shorter loop entirely within the webview. No round-trip to the host.

```
                    ┌──────────────────────┐
                    │    AppController     │
                    │  (canvasState owner) │
                    └──────────────────────┘
                     │                      ▲ 
                     |                      │ setCanvasState()
         canvasState │           ┌──────────────────┐
         via context │           │  Event handler   │
                     |           └──────────────────┘
                     ▼                       ▲ UI event
          ┌──────────────────────────────────────────┐
          │                React component           │
          └──────────────────────────────────────────┘
```

## 1.3 Code structure

```
project/
├── extension-host/
└── webview/src/
```

**Note:** to keep folders isolated, the communication protocol is not shared from a common module. Type definitions are duplicated and kept in sync manually in:
- `extension-host/protocol.ts`
- `webview/src/extensionBridge/protocol.ts`

## 1.4 Design decisions made

### All Mermaid knowledge lives in the webview

**Decision:** The extension host is a dumb pipe. It sends raw source to the webview and applies the `LineEdit[]` it receives back. All parsing, diagram tree construction, spatial logic, and edit computation live in the webview.

**Rationale:** The Autorender view needs the full raw source in the webview regardless (to call `mermaid.render()`). Given the host already sends the whole source, keeping all Mermaid knowledge there too avoids splitting parsing/logic across the boundary and duplicating it on both sides.

### Line-edit based protocol

**Decision:** The webview sends `LineEdit[]` (`{ lineNumber, newText }` — whole-line replacements) to the extension host via `ApplyEditsMessage`, not full patched source strings or generic diffs.

**Rationale:**
- keeps the extension host dumb — no diffing or merging logic on the host side
- still flexible enough: `newText` can itself contain embedded newlines, so a single `LineEdit` can insert or replace multiple lines

**Alternative considered:** Webview sends the complete new file content; host overwrites the file wholesale. Rejected because:
- single edit requires full-file size message
- undermines the "review in Git" feature — diffs are not local and thus not useful

---

## 2. Extension host architecture

### 2.1 Host runtime behavior

#### Launching

When the user runs `shiny.openDiagram` or clicks the Shiny extension button, the extension host:

- Creates a `WebviewPanel` — a sandboxed Chromium iframe alongside the editor.
- Generates the initial HTML and injects the source text into it.
- Obtains a reference to the active `.mmd` `TextDocument` — VS Code's in-memory representation of the file.
- Instantiates a `DiagramSession` object in memory — a stateful collection of event handlers that holds references to both the document and the webview panel.

#### Managing session

`DiagramSession` routes messages between the document and the webview with minimal logic:

- Listens for `onDidReceiveMessage` (webview → host) and `onDidChangeTextDocument` (VS Code → host).
- On `applyEdits` message: builds a `vscode.WorkspaceEdit`, applies all line replacements as one transaction, marks the change as Shiny-originated (`shinyOriginatedEdit` flag), then immediately pushes a `sourceUpdate` back to resync the webview.
- On a document change: if it's the just-applied Shiny-originated edit, the flag `shinyOriginatedEdit` is consumed and the change is skipped — preventing a re-render feedback loop. Otherwise, the change schedules a debounced (500ms) `sourceUpdate` push.

**Known caveat:** the Shiny-originated flag isn't race-condition-safe if a user edit and a Shiny edit land in the same event-loop tick. Safe in practice, but worth revisiting if sync issues arise.

#### Cleaning up

On panel close (`panel.onDidDispose`), the session's `dispose()` cancels any pending debounce timer and releases both registered listeners.

### 2.2 Code structure

- `extension.ts` — wiring only: registers `shiny.openDiagram`, creates the `WebviewPanel`, instantiates `DiagramSession`, registers disposables.
- `diagramSession.ts` — `DiagramSession` class: all session state and message routing logic.
- `webviewProvider.ts` — `getWebviewHtml()`: CSP headers, asset URI resolution, nonce generation, initial source text serialization.
- `protocol.ts` — `SourceUpdateMessage`, `ApplyEditsMessage`, `LineEdit`, `HostToWebviewMessage`, `WebviewToHostMessage`.

### 2.3 Design decisions made

#### DiagramSession as a stateful session object

**Decision:** All per-panel state and logic (debounce timer, `shinyOriginatedEdit` flag, message listeners) is encapsulated in a `DiagramSession` class instantiated per panel open, disposed on panel close.

**Rationale:** `extension.ts` stays wiring-only. State that must survive across multiple message events (debounce timer, loop-prevention flag) has a clear, disposable owner. Multiple panels open simultaneously each get their own isolated session.

# 3. Webview architecture

See `architecture/webview-architecture.md`