# Debugging workflow

> **Kind:** Defining  
> **Document state:** Maintained  
> **Implementation state:** Aspirational  
> **Last reviewed:** 2026-08-19  
> **Scope:** Setting up and running live debugging of Shiny webview interactions  

A debug session is a TypeScript scenario executed by `vscode-custom-editor-harness` against a real VS Code instance running Shiny.

The workflow combines two APIs:

- **`vscode-custom-editor-harness`** — generic VS Code and webview operations: opening a document, gestures, commands, document inspection, screenshots, and scenario execution.
- **Shiny target library** (`debug/targets/`) — semantic targets for Shiny editor elements. Its design is defined in [Target Library](../system/tooling/target-library.md).

The harness README is the reference for the generic harness API.

## 1. Setup

`vscode-custom-editor-harness` is a development dependency of Shiny.

The harness runs against a dedicated VS Code executable configured through:

```text
VSCODE_EXECUTABLE_PATH
```

A graphical display must be available to that VS Code instance.

Debug assets live under:

```text
debug/
├── targets/
├── scenarios/
└── fixtures/
```

- `targets/` — reusable Shiny target library.
- `scenarios/` — disposable TypeScript debug scenarios.
- `fixtures/` — reusable source documents opened by scenarios.

## 2. Scenario

A scenario describes one debug session. It imports generic operations from the harness and semantic targets from Shiny.

```ts
import {
  openWith,
  drag,
  at,
  readSource,
  screenshot,
} from "vscode-custom-editor-harness";
import { classBox } from "../targets";

await openWith("../fixtures/case.mmd", "shiny.diagram");
await drag(classBox("Order").header(), at(400, 200));

console.log(await readSource());
await screenshot("after-drag");
```

Top-level `await` is supported.

The target vocabulary and address composition are defined by `docs/product/editor-interface.md` and implemented by the target library. Scenario code composes those targets with generic harness operations.

## 3. Running

From the repository root:

```text
npm run debug -- debug/scenarios/<scenario>.ts
```

For an attended run:

```text
npm run debug -- debug/scenarios/<scenario>.ts --attended
```

An attended run leaves VS Code open after the scenario finishes. A normal run closes VS Code when the scenario completes.

Each run uses a fresh workspace. Files opened through `openWith` are copied into that workspace, so fixtures remain unchanged.

In unattended scenarios, save edited temporary documents before explicitly closing
their tabs or switching editors in a way that closes them. Await the save before
the close operation so VS Code does not interrupt the user with a save prompt.

## 4. Evidence from a run

The terminal receives:

- scenario `console` output;
- the run workspace path;
- launch or runtime errors;
- the process exit code.

The run workspace is kept after completion. Relevant artifacts include:

- the `.mmd` documents as left by the scenario;
- `.shiny/session.log`, written by Shiny during the session;
- screenshots explicitly created by the scenario.

`readSource()` returns the in-memory document text, including unsaved edits. To inspect persisted content, save the document through a VS Code command before reading the workspace file.

The session log retains prior activations when the window reloads. Each activation
has a full timestamp. Once a document has opened in Shiny, its source changes and
saves are recorded for the rest of that activation, including while editing its
text with the Shiny tab hidden or closed.

- `document-snapshot` contains the document URI, version, and exact source as JSON.
  Unlike the readable initial-source block, it preserves CRLF and escaped characters.
- `document-change` contains the URI, previous and resulting versions, the change
  reason (`edit`, `undo`, or `redo`), and all range replacements. Each replacement
  records zero-based line/character positions, UTF-16 offsets and lengths, removed
  text, and inserted text. Changes are captured before the webview update debounce,
  including unsaved and temporarily invalid source.
- To reconstruct a document, start at its latest snapshot and apply each event's
  replacements in descending offset order against the previous document version.
  Check the removed text against that version. All replacements within an event
  refer to the same pre-change source; process events in log order.

These host records describe actual applied changes, whether initiated by Shiny,
the source editor, or another editor command. The existing behavior and controller
entries provide context for Shiny actions; an `edit` reason alone does not identify
which editor initiated it.

## 5. Shiny-specific operations

Shiny's custom-editor view type is:

```text
shiny.diagram
```

so a fixture is opened with:

```ts
await openWith("../fixtures/case.mmd", "shiny.diagram");
```

Shiny VS Code commands can be invoked through the harness `runCommand` operation. In particular:

- `shiny.mark` writes a user mark into `.shiny/session.log`;
- `shiny.exportPng` runs Shiny's PNG export command.

The full harness operation set and target waiting semantics are defined by the `vscode-custom-editor-harness` README.
