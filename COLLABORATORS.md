# Shiny Contributor & Developer Guide

> **Implementation state:** Current  
> **Document state:** Maintained
> **Last reviewed:** 2026-06-19  
> **Scope:** High-level map of repository without technical implementation details

This document is the primary engineering entry point for human developers and the operational traffic controller for the AI agent team. Documents marked **Document state: Maintained** are authoritative. When code conflicts with a maintained document, report the deviation instead of copying it into documentation as the intended design.

---

## Repository Blueprint & File Map

```txt
├── README.MD                       # Public user-facing landing page and usage guide
├── COLLABORATORS.md                # This file: engineering map and AI-role routing
├── package.json                    # Workspace scripts, dependencies, and extension metadata
├── eslint.config.mjs               # ESLint flat configuration
├── tsconfig.json                   # Extension Host TypeScript configuration
├── tsconfig.webview.json           # Webview TypeScript configuration
├── vite.config.ts                  # Webview bundle configuration
│
├── node_modules/                   # Generated third-party dependencies; do not commit or edit
├── out/                            # Generated extension build output; do not commit or edit
│
├── docs/
│   ├── product/
│   │   ├── specification.md        # Target product behavior, syntax, and user journeys
│   │   └── sprints/
│   │       ├── 0.1-class-poc.md    # Sprint 1 delivery record
│   │       └── 1.1-class-box.md
│   │
│   ├── engineering/
│   │   ├── coding-standards.md     # Maintained code-quality and style rules
│   │   ├── design-system.md        # Maintained visual-system rules and UI vocabulary
│   │   ├── development-process.md  # Environment, build, validation, and commit workflow
│   │   └── architecture/
│   │       ├── architectural-standards.md # Maintained structural source of truth
│   │       ├── UI-library-architecture.md # Maintained UI library: tiers, index, and boundaries
│   │       ├── stack.md            # Technology choices and runtime/tooling stack
│   │       └── system-architecture.md     # Target responsibilities, contracts, and calculations
│   │
│   └── work-in-progress/
│       └── feature-map.md          # In-flight feature tracking
│
├── examples/
│   └── thread.mmd                  # Sample Mermaid class diagram for manual testing
│
├── extension-host/                 # VS Code Extension Host runtime
│
├── scripts/
│   └── check-webview-boundaries.mjs # Static Webview dependency/facade enforcement
│
└── webview/                        # Sandboxed React application bundled by Vite
 
```

## Document metadata

Each document in `docs/` and current document carries metadata fields at the top. State of the document is described by two of them:

- **Implementation state** describes how closely the code reflects the document.
	- `aspirational` — the document describes the intended design; the code has not yet caught up
	- `current` — the code is supposed to match what the document describes

- **Document state** describes the editorial status of the document itself.
	- `maintained` — kept up to date as decisions evolve; treat as reliable
	- `work-in-progress` — actively being revised; content may be incomplete or unstable
	- `stale` — known to lag behind current decisions; read with caution for the context

A document can be `aspirational` and `maintained` at the same time — the target is stable and trusted, but the code hasn't reached it yet. Implementation state and document state are independent.

If `current` and `maintained` is not in line with codebase, it means a bug either in code base or in docs - **report it immediately**
