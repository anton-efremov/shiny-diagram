# Shiny Contributor & Developer Guide

This document serves as the primary engineering entry point for human developers and the operational traffic controller for our AI agent team.

---

## 1. Repository Blueprint & File Map

```txt
├── README.md                       # Public user-facing landing page (product description & guide)
├── COLLABORATORS.md                # This file (engineering map & agent team routing)
│
├── node_modules/                   # Standard third-party dependencies (automated, do not commit/edit)
|
├── out/                            # Compiled extension build output directory (ignored by source control)
|
├── docs/                           # Central Documentation Vault
│   ├── product/
│   │   ├── specification.md        # WHAT the target product is: features, syntax, user journeys
│   │   └── sprints/
│   │       └── 001-class-poc.md    # sprint details: goal, features and detailed specs
│   │
│   ├── engineering/
│   │   ├── technical-blueprint.md  # Stack and technical architecture
│   │   ├── design-system.md        # Detailed description of style system 
│   │   ├── development-process.md  # environment setup, build & test workflows
│   │   └── coding-standards.md     # Code style and quality guidelines
│   │
│   └── agents/                     # Guidelines and rules for agents: file per role
│       ├── feature-builder.md      # Incremental developer: formulates milestones and writes code
│       ├── refactorer.md           # Refactoring of existing base aimed at preserving functioning
│       └── expert-explainer.md     # Read-only code analysis and problemsolving partner
│
├── examples/                       # .mmd files for testing
|
├── extension-host/                 # VS Code Extension Host code 
│
└── webview/                        # React application and helper functions
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
