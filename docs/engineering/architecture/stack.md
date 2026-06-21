# Stack

> **Implementation state:** Current
> **Document state:** Maintained
> **Last reviewed:** 2026-06-19
> **Scope:** Stack of technologies used in Shiny

## 1.1 Stack list

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

## 1.2 Design decisions made

### React Flow as the visual editor canvas

**Decision:** Use React Flow (`@xyflow/react` 12) as the rendering/interaction substrate for the Editor view canvas — node/edge graph model, pan/zoom, drag, and selection.

**Rationale:** Provides canvas mechanics (pan/zoom, drag-to-move, a node/edge graph model) without building them from scratch.

**Known constraints:** Fits node/edge-style diagrams naturally, but a poor fit for diagram types with different visual grammars — e.g. Gantt charts, sequence diagrams. Could be forced in, but at increasing cost; revisit with the second diagram type.

### Shiny owns its own Mermaid parser

**Decision:** Shiny parses Mermaid source directly using its own tokenizer/builder pipeline rather than Mermaid's internal APIs.

**Rationale:** Mermaid's public commitment is to the language spec, not its internal `db`/`parser`/`renderer` architecture. Internal APIs (`mermaidAPI`, `Diagram.fromText`, `diagram.db`) are deprecated, unstable, or unexported. Shiny's parser targets the language syntax directly, making it immune to Mermaid internal refactors. The Mermaid class diagram grammar is small enough that owning the parser is a reasonable investment.

**Alternative considered:** Use `mermaidAPI.getDiagramFromText()` to access Mermaid's internal parsed db. Rejected because `mermaidAPI` is deprecated in Mermaid 11, `Diagram` is not publicly exported, and the internal API surface has no stability guarantee.
