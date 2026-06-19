# Refactor: Webview Layer Boundary Cleanup

## Role
You are the Refactorer. Your job is structural reorganization only.
**Zero functional changes.** Every component must behave identically before and after.
Do not rename types, change logic, add features, or modify any file outside `webview/src/`.

---

## Context

The webview has three layers: `extensionBridge/`, `controller/`, and `view/`.
This refactor enforces strict ownership and import direction rules between them.
All changes are moves, renames, and import path updates — nothing else.

---

## Invariant (the law this refactor enforces)

**A layer only imports from layers below it.**

The one exception: if an upper layer passes data to a lower layer, the lower layer
may import the type needed to interpret that data — but nothing else from the upper layer.

Layer order, high to low: 
`extensionBridge/`
`controller/`
`view/`

`primitives.ts` is a shared library of primitive types — not part of the layer
hierarchy. Any layer may import from it directly.

---

## Import discipline rules (enforce these while updating every import)

These rules must hold in the final state. While updating import paths, verify each
import you touch satisfies them. Do not introduce any import that violates them.

### Rule 1 — index.ts is the component's only public surface

Every component that has a folder (`parse/`, `deriveViews/`, `commands/`) on a Controller layer exposes
its public API exclusively through its `index.ts`. No file outside that folder may
import from any internal file within it — only from `index.ts`.

```ts
// CORRECT — consuming a component's public surface
import { deriveElementViews } from "./deriveViews";

// WRONG — reaching into a component's internals
import { deriveElementViews } from "./deriveViews/deriveElementViews";
```

The one exception in this codebase: `commands/` internal files (`classBoxCommandHandler.ts`
etc.) import from `commands/formatters/formatLines.ts` and `commands/layoutAlgorithm/`.
These are private sub-utilities of `commands/` — they are not accessible from outside
`commands/`. `AppController` and `view/` must never import from them.

### Rule 2 — cross-layer imports flow downward only

A layer imports objects and functions from layers below it. It never imports objects and functions from layers above it.

Layer order, high to low: 
`extensionBridge/`
`controller/`
`view/`

`primitives.ts` is a shared library of primitive types — it has no position in the
layer hierarchy. Any layer may import from it directly.

The one permitted exception: if an upper layer passes data to a lower layer, the
lower layer may import the *type* needed to interpret that data using `import type`.
No runtime imports from above, ever.

```ts
// CORRECT — controller importing type from extensionBridge (above)
import type { LineEdit } from "../extensionBridge/protocol.ts";

// CORRECT — extensionBridge importing function (React component) from controller (below)
import { AppController } from "../controller/AppController";

// WRONG — View importing from controller an object (above)
import { useEditorState } from "../controller";
```

### Rule 3 — cross-layer upward imports use `import type` always

When importing from a higher layer to use in a lower layer, always use `import type`.
Runtime imports (`import { someFunction }`) are only permitted within the same layer or from the layer below.

```ts
// CORRECT — view importing a type from controller
import type { EditorCommand } from "../../controller/commands";

// CORRECT — controller importing runtime from same-layer component
import { applyCommand } from "./commands";

// WRONG — view importing runtime from controller
import { applyCommand } from "../../controller/commands";
```

Note: `AppController` (controller layer) importing `App` from `view/` and importing
context objects from `view/contexts/` are correct — `view/` is below `controller/`,
and `extensionBridge/` is the top layer that renders imports and renders `AppController`. Controller
must import from View, which is why contexts are owned by `view/`
and passed up to `AppController` .
These imports are `import` not `import type` because they are runtime dependencies
(React components and context objects).

### Rule 4 — primitives.ts is imported directly by anyone who needs it

`primitives.ts` is shared foundation. It has no layer owner. Any file at any layer
may import from it directly. No barrel or re-export wrapping needed.

---

## Target folder structure

```
webview/src/
├── primitives.ts                        ← MOVED from controller/primitives.ts
│
├── extensionBridge/                     ← unchanged except import paths
│   ├── ExtensionBridge.tsx
│   ├── protocol.ts                      ← owns LineEdit, ApplyEditsMessage, HostToWebviewMessage
│   ├── initialData.ts
│   ├── typeGuards.ts
│   └── vscodeApi.ts
│
└── controller/
    ├── AppController.tsx                ← unchanged except import paths
    ├── parse/                           ← unchanged except import paths
    ├── deriveViews/                     ← RENAMED from derive/
    │   └── index.ts
    ├── commands/
    │   ├── index.ts
    │   ├── classBoxCommandHandler.ts
    │   ├── styleCommandHandler.ts
    │   ├── generateCommandHandler.ts
    │   ├── memberCommandHandler.ts
    │   ├── namespaceCommandHandler.ts
    │   ├── noteCommandHandler.ts
    │   ├── relationshipCommandHandler.ts
    │   ├── formatters/                  ← MOVED from source/formatLines.ts
    │   │   └── formatLines.ts          ← private to commands/, nothing outside imports this
    │   └── layoutAlgorithm/
    │       ├── layoutConstants.ts
    │       ├── gridPlacement.ts
    │       ├── computeNewBoxLayout.ts
    │       └── computeMalformedBoxLayout.ts
    │
    └── (source/ deleted entirely)
│
└── view/
    ├── contexts/                        ← MOVED from controller/contexts/
    │   ├── EditorStateContext.ts
    │   ├── EditorDispatchContext.ts
    │   └── CanvasStateContext.ts
    ├── App.tsx
    ├── AppHeader/
    ├── AutorenderView/
    ├── editor/
    └── ui/
```

---

## Changes, one by one

### 1. Move `primitives.ts` out of `controller/`

**Move:** `webview/src/controller/primitives.ts` → `webview/src/primitives.ts`

Update every file that imports from `../primitives`, `./primitives`, or
`../../primitives` (relative to their old location) to point to the new path.

Files to update (exhaustive):
- `webview/src/controller/parse/index.ts`
- `webview/src/controller/parse/tokenizer.ts`
- `webview/src/controller/parse/diagramTreeBuilders.ts`
- `webview/src/controller/parse/builders/buildClassNode.ts`
- `webview/src/controller/parse/builders/buildRelationshipEdge.ts`
- `webview/src/controller/parse/builders/buildSpatialData.ts`
- `webview/src/controller/parse/builders/buildAppliesStyleEdge.ts`
- `webview/src/controller/parse/builders/buildNamespaceNode.ts`
- `webview/src/controller/parse/builders/buildInNamespaceEdge.ts`
- `webview/src/controller/parse/builders/buildStyleDefNode.ts`
- `webview/src/controller/parse/builders/toSourceLocation.ts`
- `webview/src/controller/deriveViews/index.ts` (after rename in step 2)
- `webview/src/controller/commands/index.ts`
- `webview/src/controller/commands/classBoxCommandHandler.ts`
- `webview/src/controller/commands/styleCommandHandler.ts`
- `webview/src/controller/commands/generateCommandHandler.ts`
- `webview/src/controller/commands/layoutAlgorithm/gridPlacement.ts`
- `webview/src/controller/canvasState.ts`
- `webview/src/extensionBridge/ExtensionBridge.tsx`

Delete `webview/src/controller/primitives.ts` after all imports are updated.

---

### 2. Rename `derive/` → `deriveViews/`

**Rename directory:** `webview/src/controller/derive/` → `webview/src/controller/deriveViews/`

No file contents change inside the directory — only the folder name changes.

Update every import of `"./derive"`, `"../derive"`, or `"../../derive"` to use
`"./deriveViews"`, `"../deriveViews"`, or `"../../deriveViews"` respectively.

Files to update:
- `webview/src/controller/AppController.tsx`
- `webview/src/controller/commands/index.ts`
- `webview/src/controller/index.ts`

---

### 3. Move `source/formatLines.ts` into `commands/` and delete `source/`

`formatLines.ts` is a utility used exclusively by command handlers. It is internal
to `commands/` and nothing outside `commands/` imports it. It belongs inside
`commands/` as a private utility, not at the controller level.

`SourceEdit` (the only other export from `source/`) moves to `primitives.ts` in step 4.
After both moves, `source/` has no remaining content and is deleted entirely.

**Move:** `webview/src/controller/source/formatLines.ts`
→ `webview/src/controller/commands/formatters/formatLines.ts`

No index file for `formatters/` — command handlers import directly from the file.

Update imports in:
- `webview/src/controller/commands/classBoxCommandHandler.ts`
  - `from "../source/formatLines"` → `from "./formatters/formatLines"`
- `webview/src/controller/commands/styleCommandHandler.ts`
  - `from "../source/formatLines"` → `from "./formatters/formatLines"`
- `webview/src/controller/commands/generateCommandHandler.ts`
  - `from "../source/formatLines"` → `from "./formatters/formatLines"`

**Delete** `webview/src/controller/source/index.ts` and the entire
`webview/src/controller/source/` directory.

---

### 4. Move `SourceEdit` into `primitives.ts`

`SourceEdit` is shared between `controller/` and `extensionBridge/` — no single
layer owns it. It belongs in `primitives.ts` alongside the other shared types.

**Add** the `SourceEdit` type to `webview/src/primitives.ts`:

```ts
export type SourceEdit =
  | { readonly kind: "replaceLine"; readonly lineNumber: number; readonly newText: string }
  | { readonly kind: "insertLine"; readonly lineNumber: number; readonly newText: string }
  | { readonly kind: "deleteLine"; readonly lineNumber: number }
  | { readonly kind: "replaceRange"; readonly startLine: number; readonly endLine: number; readonly newText: string };
```

Update every file that imported `SourceEdit` from `"../source"` or `"./source"` to
import it from the new `primitives.ts` path instead.

Files to update:
- `webview/src/controller/AppController.tsx`
- `webview/src/controller/commands/index.ts`
- `webview/src/controller/commands/generateCommandHandler.ts`
- `webview/src/extensionBridge/ExtensionBridge.tsx`

---

### 5. Move `contexts/` from `controller/` to `view/`

`contexts/` defines the communication contract between `controller/` and `view/`.
`view/` owns this contract — it defines the context objects and hooks that controller
populates. Moving `contexts/` to `view/` enforces two boundaries at once:

- **Layer boundary:** `controller/` importing from `view/contexts/` is a legitimate
  downward import (view is above controller). The current location inside `controller/`
  obscures this relationship.
- **Component boundary within `controller/`:** with `contexts/` gone, nothing inside
  `controller/` owns or leaks context concerns. `AppController.tsx` imports contexts
  from `view/` explicitly, making the dependency visible rather than implicit.

**Move directory:** `webview/src/controller/contexts/`
→ `webview/src/view/contexts/`

Move all three files:
- `EditorStateContext.ts`
- `EditorDispatchContext.ts`
- `CanvasStateContext.ts`

Update imports in files that currently import from `"./contexts/..."` or
`"../contexts/..."`:

`webview/src/controller/AppController.tsx` — update three imports:
- `from "./contexts/CanvasStateContext"` → `from "../view/contexts/CanvasStateContext"`
- `from "./contexts/EditorDispatchContext"` → `from "../view/contexts/EditorDispatchContext"`
- `from "./contexts/EditorStateContext"` → `from "../view/contexts/EditorStateContext"`

View files that import hooks from `"../controller"` or `"../../controller"` or
`"../../../controller"` — update to import directly from the contexts files.
See step 6 for the full view import cleanup.

Also update the context files themselves — they currently import from
`"../primitives"` and `"../derive"`. After this move their paths change:
- `primitives.ts` imports: `"../primitives"` → `"../../primitives"`
- `deriveViews/` imports: `"../derive"` → `"../../controller/deriveViews"`

---

### 6. Delete `controller/index.ts` and fix all view imports

`controller/index.ts` is a barrel that exists to give `view/` a single import point.
Under the new rules, view imports directly from the modules it depends on.
The barrel has no remaining job and must be deleted.

**Delete:** `webview/src/controller/index.ts`

Update every view file that imports from `"../controller"`, `"../../controller"`,
or `"../../../controller"` to import from the specific module that owns what it needs.

Complete mapping of what moves where. All imports from `view/` into `controller/`
are downward (controller is below view in the layer order) and use `import type`:

| What | Old import | New import |
|---|---|---|
| `useEditorState` | `"../../../controller"` | `"../../contexts/EditorStateContext"` |
| `useEditorDispatch` | `"../../../controller"` | `"../../contexts/EditorDispatchContext"` |
| `useCanvasState` | `"../../../controller"` | `"../../contexts/CanvasStateContext"` |
| `EditorHeaderState` | `"../../../controller"` | `"../../contexts/EditorStateContext"` |
| `ElementViews` | `"../../../controller"` | `"../../../controller/deriveViews"` |
| `ClassBoxView` | `"../../../controller"` | `"../../../controller/deriveViews"` |
| `ClassBoxMemberView` | `"../../../controller"` | `"../../../controller/deriveViews"` |
| `RelationshipView` | `"../../../controller"` | `"../../../controller/deriveViews"` |
| `ClassId` | `"../../../controller"` | `"../../../primitives"` |

Note: relative paths in the table are written from the perspective of a file three
levels deep in `view/` (e.g. `view/editor/ClassDiagram/`). Resolve correctly per
each file's actual depth. All of these are `import type` — no runtime imports from
`view/` into `controller/`.

Files to update:
- `webview/src/view/App.tsx`
- `webview/src/view/AppHeader/AppHeader.tsx`
- `webview/src/view/editor/EditorView/EditorView.tsx`
- `webview/src/view/editor/ClassDiagram/ClassDiagram.tsx`
- `webview/src/view/editor/ClassDiagram/useClassBoxController.ts`
- `webview/src/view/editor/ClassDiagram/useCanvasController.ts`
- `webview/src/view/editor/ClassDiagram/reactFlowAdapters.ts`
- `webview/src/view/editor/StylePane/StylePane.tsx`
- `webview/src/view/editor/StylePane/useStylePaneController.ts`
- `webview/src/view/editor/ClassBox/ClassBox.tsx`
- `webview/src/view/editor/ClassBox/MemberTable/MemberTable.tsx`

Also update `webview/src/extensionBridge/ExtensionBridge.tsx` which currently
imports `AppController` from `"../controller"` — update to
`from "../controller/AppController"`.

---

### 7. Move `canvasState.ts` into `view/contexts/`

`canvasState.ts` defines `CanvasState` and `defaultCanvasState`. This type
describes UI selection state — it is view concern, not a controller concern.
It belongs alongside the contexts that expose it.

**Move:** `webview/src/controller/canvasState.ts`
→ `webview/src/view/contexts/canvasState.ts`

Update imports:
- `webview/src/view/contexts/CanvasStateContext.ts` — update import of `CanvasState`
- `webview/src/controller/AppController.tsx` — update import of `defaultCanvasState`
  and `CanvasState` to `from "../view/contexts/canvasState"`

---

## Verification checklist

After all changes, run:

```bash
npm run typecheck
```

This must pass with zero errors. No new errors are acceptable.

Additionally verify manually:

**Structure:**
- `webview/src/controller/` contains no `index.ts` at its root
- `webview/src/controller/source/` directory does not exist
- `webview/src/controller/derive/` directory does not exist
- `webview/src/controller/contexts/` directory does not exist
- `webview/src/controller/primitives.ts` does not exist
- `webview/src/controller/canvasState.ts` does not exist
- `webview/src/primitives.ts` exists and exports `SourceEdit`
- `webview/src/view/contexts/` contains the three context files and `canvasState.ts`
- `webview/src/controller/deriveViews/` exists
- `webview/src/controller/commands/formatters/formatLines.ts` exists
- No file outside `webview/src/` was modified

**Import discipline:**
- No file in `view/` uses plain `import` (non-type) from `controller/` — all cross-layer imports into controller are `import type`
- No file in `controller/` imports from `view/` except `AppController.tsx` (which imports `App` and the three context objects — these are legitimate downward runtime imports)
- No file outside `commands/` imports from `commands/formatters/` or `commands/layoutAlgorithm/`
- No file outside a component folder imports from that folder's internal files (only `index.ts` is the valid import target from outside)

## No-go conditions

Stop and report if you encounter any of the following:
- A file imports from a path that does not resolve after your changes
- `npm run typecheck` reports errors you cannot resolve by updating import paths alone
- Any change would require modifying logic, not just paths
