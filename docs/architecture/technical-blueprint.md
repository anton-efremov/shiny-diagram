# Technical Blueprint

## Stack

| Concern                 | Technology                                   |
| ----------------------- | -------------------------------------------- |
| Extension host runtime  | Node.js / VS Code Extension API              |
| Extension host language | TypeScript 5, compiled to CommonJS via `tsc` |
| Webview runtime         | Chromium (VS Code WebView)                   |
| Webview language        | TypeScript 5 + React 19, bundled via Vite    |
| Diagram rendering       | Mermaid 11                                   |
| Visual editor canvas    | React Flow (`@xyflow/react` 12)              |
| Formatter               | Prettier                                     |
| Linter                  | ESLint 9 (flat config)                       |

## Runtime architecture

Shiny follows the standard VS Code extension model: an extension host process running in Node.js, paired with a Chromium WebView for the visual interface. These are isolated runtimes with no shared memory. All communication crosses the boundary via `postMessage` as JSON messages with a `type` discriminant field.

The boundary is hard. `extension-host/` has no browser APIs. `webview/src/` has no `vscode` module imports.

### Data flow

```
Extension Host (Node.js)                  WebView (Chromium)
────────────────────────                  ──────────────────────────────────────

 .mmd file                                 ┌─ Shiny parser ──► DiagramModel
     │                                     │        │
     └────── raw source ──────────────────►│        ▼
                                           │  toReactFlowNodes() ──► React Flow
     ▲                                     │
     │                                     └─ mermaid.render() ──► SVG (Autorender)
     │                                              │
     └──────────── source diffs ───────────────────┘
```

**Extension host → webview:** raw Mermaid source text. The extension host has no knowledge of Mermaid semantics.

**Webview → extension host:** source diffs describing the minimal text changes required by a user edit. The extension host applies diffs to disk and nothing else.

**Webview internal pipeline:**

1. Receives raw Mermaid source
2. Shiny's own parser produces a `DiagramModel` — see `parsers/diagramModel.ts`
3. `DiagramModel` is transformed into React Flow nodes for the Editor
4. `mermaid.render()` converts raw source to SVG for Autorender mode
5. On user edit, the webview computes a source diff using `SourceLocation` data from `DiagramModel` and sends it to the extension host

All Mermaid knowledge — parsing, diagram model, spatial logic, patch computation — lives exclusively in the webview.

### Extension host

The extension host is intentionally dumb. It owns document access, file writes, webview lifecycle, and command registration. It sends raw source to the webview and applies diffs it receives back. It has no knowledge of Mermaid syntax or diagram structure.

`extension.ts` is a wiring file only — it registers commands and sets up listeners. All substantive logic lives in dedicated modules.

### Webview

Owns everything Mermaid-related: parsing, diagram model, spatial annotation logic, React Flow rendering, user interactions, and source diff computation. Sends diffs to the extension host and never touches the filesystem directly.

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

**`extension-host/`** — extension host. `extension.ts` wires the extension. Dedicated modules handle document listening, webview lifecycle, and diff application. No Mermaid knowledge lives here.

**`webview/src/`** — five categories:

- `modes/` — top-level mode views, one per mode, not nested further
- `components/` — UI components; a component with sub-components owns a folder, a standalone component is a flat file pair with a colocated hook if needed
- `parsers/` — Shiny's Mermaid parser; produces `DiagramModel` from raw source; one subfolder per diagram type; no React, no VS Code dependencies
- `utils/` — pure helpers with no domain specificity
- `styles.css` — global stylesheet; Shiny design tokens and React Flow base import only

Folders are introduced when a separation is real, not preemptively.

### Parser structure

The parser lives in `webview/src/parsers/classDiagram/` and is organized as follows:

```
parsers/
├── diagramModel.ts              ← parser output types and component input contract
└── classDiagram/
    ├── index.ts                 ← public API: parseDiagram(source) → DiagramModel
    ├── tokenizer.ts             ← splits source into TokenizedLine[]; identifies line types and block boundaries
    └── rules/
        ├── parseClasses.ts      ← class declarations and members
        ├── parseRelationships.ts ← relationship edges
        ├── parseStyles.ts       ← classDef definitions and class:::Style applications
        ├── parseSpatial.ts      ← @spatial annotations
        └── parseNamespaces.ts   ← namespace blocks
```

**`diagramModel.ts`** defines `DiagramModel` — the contract between parser and components. Read it before touching any parser or component code.

**`tokenizer.ts`** produces `TokenizedLine[]` from raw source. It identifies line types (class declaration, relationship, annotation, etc.) and groups multi-line block constructs (class bodies, namespaces) before rules run. Every rule receives tokenizer output, not raw source strings.

**Each rule** is a pure function with the signature `(lines: TokenizedLine[]) => T`. Rules are independent — they do not call each other.

**`index.ts`** orchestrates: calls the tokenizer, runs all rules, assembles and returns `DiagramModel`.

Future diagram types add a sibling folder: `parsers/sequenceDiagram/`, `parsers/flowchart/`, etc. Shared tokenizer utilities live in `parsers/shared/` when genuine reuse emerges.

## Design decisions

### Shiny owns its own Mermaid parser

**Decision:** Shiny parses Mermaid source directly using its own rule-based parser rather than Mermaid's internal APIs.

**Rationale:** Mermaid's public commitment is to the language spec, not its internal `db`/`parser`/`renderer` architecture. Internal APIs (`mermaidAPI`, `Diagram.fromText`, `diagram.db`) are deprecated, unstable, or unexported. Shiny's parser targets the language syntax directly, making it immune to Mermaid internal refactors. The Mermaid class diagram grammar is small enough that owning the parser is a reasonable investment.

**Alternative considered:** Use `mermaidAPI.getDiagramFromText()` to access Mermaid's internal parsed db. Rejected because `mermaidAPI` is deprecated in Mermaid 11, `Diagram` is not publicly exported, and the internal API surface has no stability guarantee.

### Rule-based parsing over line-by-line or formal grammar

**Decision:** The parser uses a tokenizer-first, rule-based approach. The tokenizer identifies line types and groups block constructs. Independent rule functions process the token stream per concern.

**Rationale:** Mermaid class diagram syntax is line-oriented and unambiguous — each line's type is determinable from its first token. This makes rule-based parsing genuinely appropriate, not a hack. Rules are independently testable and a new diagram concept requires only a new rule file. A formal grammar parser (PEG, LALR) would be over-engineering for this language's complexity.

**Alternative considered:** Pure line-by-line stateful parsing. Rejected because multi-line constructs (class bodies, namespaces) require tracking open/close state inline, which degrades readability as the parser grows.

### SourceLocation on every parsed construct

**Decision:** Every type in `DiagramModel` carries a `SourceLocation` with line number and raw text.

**Rationale:** The diff patcher needs to locate and update exact source lines when the user makes an edit (move box, change color). Without `SourceLocation`, the patcher would need a second parse pass or a regex search at patch time. Capturing location during the initial parse eliminates that cost and makes patching precise.

### DiagramModel as the parser-to-component contract

**Decision:** `parsers/diagramModel.ts` defines all types that flow from the parser to components. Components never receive raw source text.

**Rationale:** A stable typed contract lets both sides evolve independently. Components are tested against model types, not source strings. The compiler enforces the contract — any parser output change that breaks a component is a compile error, not a runtime surprise.

### All Mermaid knowledge lives in the webview

**Decision:** The extension host is a dumb pipe. It sends raw source to the webview and applies diffs it receives back. All parsing, diagram model construction, spatial logic, and diff computation live in the webview.

**Rationale:** Keeping all Mermaid knowledge in one runtime eliminates duplication across the postMessage boundary and means adding a new diagram type requires no extension host changes.

### Diff-based edit protocol

**Decision:** The webview sends source diffs to the extension host, not full patched source strings.

**Rationale:** The webview has full model context at edit time and can compute the minimal surgical change using `SourceLocation` data. Sending a diff keeps the protocol precise and decoupled from file size.

**Alternative considered:** Webview sends the complete patched source string. Rejected because it is imprecise and couples payload size to file size unnecessarily.

### Extension host as the sole file writer

**Decision:** The extension host is the only layer that writes `.mmd` files.

**Rationale:** Centralizing file mutation makes the source-of-truth contract enforceable and ensures Shiny-originated edits can be distinguished from manual edits, preventing re-render loops.

### Presentational components with colocated hooks

**Decision:** Components are props-in/JSX-out. Non-trivial logic lives in a colocated `use*.ts` hook. Pure transformations live in `parsers/` or `utils/`.

**Rationale:** Separates rendering concerns from logic concerns. Keeps components readable and independently testable.

**Alternative considered:** Logic inline in components. Rejected because it couples rendering and behavior, making both harder to reason about as the codebase grows.
