# Technical Blueprint

## Stack

| Concern | Technology |
|---|---|
| Extension host runtime | Node.js / VS Code Extension API |
| Extension host language | TypeScript 5, compiled to CommonJS via `tsc` |
| Webview runtime | Chromium (VS Code WebView) |
| Webview language | TypeScript 5 + React 19, bundled via Vite |
| Diagram rendering | Mermaid 11 |
| Visual editor canvas | React Flow (`@xyflow/react` 12) |
| Formatter | Prettier |
| Linter | ESLint 9 (flat config) |

## Runtime architecture

Shiny follows the standard VS Code extension model: an extension host process running in Node.js, paired with a Chromium WebView for the visual interface. These are isolated runtimes with no shared memory. All communication crosses the boundary via `postMessage` as JSON messages with a `type` discriminant field.

The boundary is hard. `src/` has no browser APIs. `webview/src/` has no `vscode` module imports.

### Data flow

```
Extension Host (Node.js)                  WebView (Chromium)
────────────────────────                  ──────────────────────────────────────

 .mmd file                                 ┌─ mermaid.parse() ──► Mermaid AST
     │                                     │        │
     └────── raw source ──────────────────►│        ▼
                                           │  AST transformer ──► React Flow nodes
     ▲                                     │
     │                                     └─ mermaid.render() ──► SVG (Autorender)
     │                                              │
     └──────────── source diffs ───────────────────┘
```

**Extension host → webview:** raw Mermaid source text. The extension host has no knowledge of Mermaid semantics.

**Webview → extension host:** source diffs describing the minimal text changes required by a user edit. The extension host applies diffs to disk and nothing else.

**Webview internal pipeline:**
1. Receives raw Mermaid source
2. `mermaid.parse()` produces a Mermaid AST — Shiny uses Mermaid's own grammar rather than reimplementing it
3. An AST transformer converts the AST and spatial annotation data into React Flow nodes for the Editor
4. `mermaid.render()` converts raw source to SVG for Autorender mode
5. On user edit, the webview computes a source diff and sends it to the extension host

All Mermaid knowledge — parsing, AST interpretation, spatial logic, patch computation — lives exclusively in the webview.

### Extension host

The extension host is intentionally dumb. It owns document access, file writes, webview lifecycle, and command registration. It sends raw source to the webview and applies diffs it receives back. It has no knowledge of Mermaid syntax or diagram structure.

`extension.ts` is a wiring file only — it registers commands and sets up listeners. All substantive logic lives in dedicated modules.

### Webview

Owns everything Mermaid-related: parsing, AST transformation, spatial annotation logic, React Flow rendering, user interactions, and source diff computation. Sends diffs to the extension host and never touches the filesystem directly.

## Code structure

### State ownership

The source file is the single source of truth. The extension host owns all durable state. The webview holds only UI-local state — selected node, current mode, hover state — that is not persisted and not derivable from source.

### Component pattern

Components are presentational by default: props in, JSX out. A component that requires non-trivial logic owns a colocated hook:

```
components/
└── ClassBox/
    ├── ClassBox.tsx            ← props in, JSX out
    ├── ClassBox.module.css
    └── useClassBox.ts          ← state and side effects
```

Logic that does not involve React state or side effects is a pure function in `parsers/` or `utils/`.

### Folder structure

**`src/`** — extension host. `extension.ts` wires the extension. Dedicated modules handle document listening, webview lifecycle, and diff application. No Mermaid knowledge lives here.

**`webview/src/`** — five categories:

- `modes/` — top-level mode views, one per mode, not nested further
- `components/` — UI components; a component with sub-components owns a folder, a standalone component is a flat file pair with a colocated hook if needed
- `parsers/` — Mermaid AST transformers and spatial annotation logic; pure functions that convert a Mermaid AST into React Flow nodes and compute source diffs; one transformer per diagram type; no React, no VS Code dependencies
- `utils/` — pure helpers with no domain specificity
- `styles.css` — global stylesheet; Shiny design tokens and React Flow base import only

Folders are introduced when a separation is real, not preemptively.

## Design decisions

### All Mermaid knowledge lives in the webview

**Decision:** The extension host is a dumb pipe. It sends raw source to the webview and applies diffs it receives back. All Mermaid parsing, AST interpretation, spatial annotation logic, and source patch computation lives in the webview.

**Rationale:** Mermaid is a browser library — its parser runs in Chromium. The webview already has the full AST at the moment a user makes an edit; it is the natural place to compute what changed. Keeping all Mermaid knowledge in one runtime eliminates duplication across the boundary and means adding a new diagram type requires no extension host changes.

**Alternative considered:** Extension host owns a source patcher with line-level knowledge of `.mmd` structure. Rejected because it requires the host to partially reimplement structural knowledge the webview already has from the AST, creating ongoing duplication and coordination overhead.

### Diff-based edit protocol

**Decision:** The webview sends source diffs to the extension host, not full patched source strings.

**Rationale:** The webview has full AST context at edit time and can compute the minimal surgical change. Sending a diff keeps the protocol precise and decoupled from file size.

**Alternative considered:** Webview sends the complete patched source string. Rejected because it is imprecise — the host cannot distinguish intentional changes from incidental ones — and couples payload size to file size unnecessarily.

### Extension host as the sole file writer

**Decision:** The extension host is the only layer that writes `.mmd` files.

**Rationale:** Centralizing file mutation makes the source-of-truth contract enforceable and ensures Shiny-originated edits can be distinguished from manual edits, preventing re-render loops.

### Presentational components with colocated hooks

**Decision:** Components are props-in/JSX-out. Non-trivial logic lives in a colocated `use*.ts` hook. Pure transformations live in `parsers/` or `utils/`.

**Rationale:** Separates rendering concerns from logic concerns. Keeps components readable and independently testable. Makes it unambiguous where to look for each type of code.

**Alternative considered:** Logic inline in components. Rejected because it couples rendering and behavior, making both harder to reason about as the codebase grows.
