# Shiny Contributor & Developer Guide

This document serves as the primary engineering entry point for human developers and the operational traffic controller for our AI agent team.

---

## 1. Repository Blueprint & File Map

```txt
├── README.md                       # Public user-facing landing page (product description & guide)
├── COLLABORATORS.md                # This file (engineering map & agent team routing)
│
├── node_modules/                   # Standard third-party dependencies (automated, do not commit/edit)
├── out/                            # Compiled extension build output directory (ignored by source control)
│
├── docs/
│   ├── product/
│   │   ├── specification.md        # WHAT the target product is: features, syntax, user journeys
│   │   └── sprints/
│   │       ├── 001-class-poc.md    # Sprint 1 details: goal, features, detailed specs
│   │       └── 002-class-full-not-started-yet.md
│   │
│   ├── engineering/
│   │   ├── technical-blueprint.md  # Stack and technical architecture overview
│   │   ├── design-system.md        # Style system description
│   │   ├── development-process.md  # Environment setup, build & test workflows
│   │   ├── coding-standards.md     # Code style and quality guidelines
│   │   └── architecture/
│   │       ├── architecture.md     # High-level system architecture
│   │       ├── stack.md            # Technology stack details
│   │       └── webview-architecture.md  # Webview layer design and conventions
│   │
│   └── work-in-progress/
│       └── feature-map.md          # In-flight feature tracking
│
├── examples/
│   └── thread.mmd                  # Sample .mmd file for testing
│
├── extension-host/                 # VS Code Extension Host (Node.js process)
│   ├── extension.ts                # Extension entry point: activation, command registration
│   ├── webviewProvider.ts          # WebviewPanel creation and lifecycle management
│   ├── diagramSession.ts           # Per-document session: file I/O, edit application
│   └── protocol.ts                 # Host↔webview message type definitions
│
└── webview/                        # React webview application (Vite + React 19)
    ├── index.html
    ├── tsconfig.json
    └── src/
        ├── main.tsx                # Vite entry: mounts ExtensionBridge into the DOM
        ├── styles.css              # Global CSS custom properties (tokens, classbox metrics)
        ├── vite-env.d.ts
        │
        ├── extensionBridge/        # Layer 1 — VS Code postMessage boundary
        │   ├── ExtensionBridge.tsx # Owns sourceText state, message listener, edit dispatch
        │   ├── initialData.ts      # Reads window.__INITIAL_DATA__ injected by the host
        │   ├── protocol.ts         # Webview-side message type definitions
        │   ├── typeGuards.ts       # Runtime narrowing for incoming host messages
        │   └── vscodeApi.ts        # acquireVsCodeApi() singleton
        │
        ├── controller/             # Layer 2 — pure domain logic, no React/DOM/VS Code
        │   ├── index.ts            # Public API barrel — view imports only from here
        │   ├── primitives.ts       # Shared types: branded IDs, DiagramTree, geometry (Rect/Point), EditorDiagnostic
        │   ├── canvasState.ts      # CanvasState type + defaultCanvasState
        │   ├── AppController.tsx   # Root context provider; owns parse→derive→dispatch pipeline
        │   │
        │   ├── contexts/           # React contexts (controller infrastructure)
        │   │   ├── CanvasStateContext.ts    # canvasState + setCanvasState
        │   │   ├── EditorDispatchContext.ts # dispatch(EditorCommand)
        │   │   └── EditorStateContext.ts    # sourceText, parseStatus, elementViews
        │   │
        │   ├── parse/              # parseDiagram(source) → ParseResult
        │   │   ├── index.ts        # ParseResult type + parseDiagram entry point
        │   │   ├── tokenizer.ts    # Line-by-line lexer → ParseToken[]
        │   │   ├── diagramTreeBuilders.ts  # Token→DiagramTree assembly
        │   │   └── builders/       # One builder per token kind
        │   │       ├── buildAppliesStyleEdge.ts
        │   │       ├── buildClassNode.ts
        │   │       ├── buildInNamespaceEdge.ts
        │   │       ├── buildNamespaceNode.ts
        │   │       ├── buildRelationshipEdge.ts
        │   │       ├── buildSpatialData.ts
        │   │       ├── buildStyleDefNode.ts
        │   │       └── toSourceLocation.ts
        │   │
        │   ├── derive/             # deriveElementViews(model) → ElementViews
        │   │   └── index.ts        # View model types + derivation logic
        │   │
        │   ├── commands/           # applyCommand(cmd, ctx) → CommandResult
        │   │   ├── index.ts        # EditorCommand/CommandContext/CommandResult types + applyCommand dispatcher
        │   │   ├── classBoxCommandHandler.ts
        │   │   ├── generateCommandHandler.ts
        │   │   ├── memberCommandHandler.ts
        │   │   ├── namespaceCommandHandler.ts
        │   │   ├── noteCommandHandler.ts
        │   │   ├── relationshipCommandHandler.ts
        │   │   ├── styleCommandHandler.ts
        │   │   └── layoutAlgorithm/
        │   │       ├── layoutConstants.ts      # Hardcoded classbox sizing values
        │   │       ├── gridPlacement.ts        # Grid layout math
        │   │       ├── computeNewBoxLayout.ts
        │   │       └── computeMalformedBoxLayout.ts
        │   │
        │   └── source/             # Source text formatting utilities
        │       ├── index.ts        # SourceEdit type + re-exports
        │       └── formatLines.ts  # formatSpatialAnnotation, formatStyleProperty
        │
        ├── view/                   # Layer 3 — React rendering, imports only from controller/index
        │   ├── App.tsx             # Root view: mode state, AppHeader + AutorenderView/EditorView
        │   ├── App.module.css
        │   ├── AppHeader/
        │   │   ├── AppHeader.tsx   # Toggle (autorender/editor) + parse status + Generate button
        │   │   └── AppHeader.module.css
        │   ├── AutorenderView/
        │   │   ├── AutorenderView.tsx
        │   │   ├── AutorenderView.module.css
        │   │   └── useAutorender.ts
        │   └── editor/
        │       ├── EditorView/
        │       │   ├── EditorView.tsx          # Editor shell: error/missing/ready branches
        │       │   └── EditorView.module.css
        │       ├── ClassDiagram/
        │       │   ├── ClassDiagram.tsx         # ReactFlow canvas; reads elementViews + canvasState from context
        │       │   ├── ClassDiagram.module.css
        │       │   ├── reactFlowAdapters.ts     # ClassBoxView → RF node/edge descriptors
        │       │   ├── useClassBoxController.ts # node drag/click → dispatch + setCanvasState
        │       │   └── useCanvasController.ts   # pane click → clear selection
        │       ├── ClassBox/
        │       │   ├── ClassBox.tsx             # RF custom node: header + members + handles
        │       │   ├── ClassBox.module.css
        │       │   ├── NamespaceBox.tsx         # Stub
        │       │   ├── Note.tsx                 # Stub
        │       │   ├── useNamespaceController.ts  # Stub
        │       │   ├── useNoteController.ts       # Stub
        │       │   └── MemberTable/
        │       │       ├── MemberTable.tsx
        │       │       └── useMemberTableController.ts  # Stub
        │       ├── RelationshipEdge/
        │       │   ├── RelationshipEdge.tsx       # Stub (uses RF default edge)
        │       │   └── useRelationshipController.ts  # Stub
        │       ├── StylePane/
        │       │   ├── StylePane.tsx              # Selected class style inspector
        │       │   ├── StylePane.module.css
        │       │   └── useStylePaneController.ts  # Fill color change → dispatch
        │       └── ToolPane/
        │           ├── ToolPane.tsx
        │           ├── ToolPane.module.css
        │           └── useToolPaneController.ts   # Stub
        │
        └── ui/                     # Generic reusable UI components (no controller deps)
            └── Toggle/
                ├── Toggle.tsx
                └── Toggle.module.css
```

## 2. Multi-Agent Team Operations

This repository utilizes Strict Multi-Agent Team Architecture. Every AI assistant spawned in this workspace must be strictly assigned to a single persona and must read its corresponding playbook before executing code:

### 1. The Feature Builder

Playbook: docs/agents/feature-builder.md

Job: Responsible for defining next incremental milestone, planning/specifying proposed changes, implementing this changes in code, debugging and proposing commits.

Constraint: It is strictly forbidden from reorganizing directories, renaming core shared modules, or performing out-of-scope architectural refactoring.

### 2. The Refactorer

Playbook: docs/agents/refactorer.md

Job: Invoked upon accumulation of tech debt. Responsible for analysis of current repo state, proposing refactoring steps, e.g. extracting bloated code into pure utilities, enforcing architectural decoupling and implementing those steps

Constraint: It is strictly forbidden from changing functional program behavior. Code modifications must maintain 100% equivalent input/output correctness, focusing purely on structural optimization and code cleanups.

### 3. The Expert Explainer

Playbook: docs/agents/expert-explainer.md

Job: Review current state of the code and increment since the last review and interact with programmer to answer implementation questions and support problemsolving process

Constraint: It has zero file-write permissions. It must never alter the workspace files directly.
