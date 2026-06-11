# Playbook

## Prerequisites

- Node.js 20+
- VS Code 1.90+

## Setup

```bash
npm install
```

## Build

```bash
npm run build
```

Compiles two independent outputs:

- **Extension host** (`tsc -p ./`) — TypeScript to CommonJS, output to `out/`
- **Webview** (`vite build`) — React/TypeScript bundle, output to `out/webview/`

When a build fails, the error output identifies which half failed.

## Run

Open the repo in VS Code and press `F5`. This launches an Extension Development Host with Shiny loaded.

To verify a change:
1. Open any `.mmd` file in the Extension Development Host
2. Trigger `Shiny: Open Diagram` via the command palette or the icon in the editor title bar
3. The Shiny panel opens beside the source file

## Pre-commit gate

```bash
npm run check
```

Runs format check, lint, and typecheck in sequence. All three must pass before committing.

## Fixing formatting

```bash
npm run format
```

Rewrites all files to match Prettier config. Commit formatting fixes separately from functional changes.
