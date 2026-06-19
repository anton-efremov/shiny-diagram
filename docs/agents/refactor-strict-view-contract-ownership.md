# Refactor Brief: Strict Webview Layers and View-Owned Contracts

## Role

Refactor the current `spring-poc` branch of `shiny-diagram` so the webview follows a strict layered dependency model:

```text
extensionBridge → controller → view
extensionBridge, controller, and view → shared
shared → nothing
```

Dependencies include runtime imports, type imports, and re-exports. No reverse-import exception is permitted.

Work from the current repository state. The architecture documentation has intentionally not been updated yet and is **not** a source of truth for this task.

Read and follow:

- `docs/engineering/coding-standards.md`
- the current source under `webview/src/`
- `scripts/check-webview-boundaries.mjs`

Do not update `docs/`, `COLLABORATORS.md`, or other documentation in this refactor.

---

## 1. Goal

Move View-facing contracts to the View layer while preserving their local semantic ownership:

- render contracts are defined beside the View components they serve;
- editor commands are defined beside the View components that emit or semantically own them;
- View-level semantic barrels flatten the nested component tree for Controller consumers;
- Controller imports only stable View facades and does not know the physical React component hierarchy;
- View imports nothing from Controller, including types;
- Controller continues to own parsing, derivation, command execution, and source edits.

The target interaction is:

```text
Controller model ──deriveViews──> View-owned render contracts ──> View
View ──View-owned EditorCommand──> Controller commands ──> SourceEdit[]
```

The ownership distinction is intentional:

- View owns the language of normalized UI intent (`EditorCommand`).
- View owns the data shapes it requires for rendering (`ElementViews` and nested view types).
- Controller implements the transformations that produce and consume those View contracts.
- Controller owns `SourceEdit`, because it is Controller output toward `extensionBridge`.

---

## 2. Non-negotiable architectural rules

### 2.1 Strict layer direction

```text
extensionBridge → controller → view
```

- An upper layer may import a lower layer.
- A lower layer must not import an upper layer.
- `import type` is still an architectural dependency and follows the same rule.
- Runtime control may flow upward through lower-layer contracts implemented by the composing upper layer.
- `shared/` is a dependency-free foundation, not a layer.

### 2.2 View contract ownership

- A View component owns the render data it accepts.
- A View component owns the normalized editor intent it emits or semantically represents.
- Definitions live near their semantic View owner.
- Physical construction of a value does not determine ownership.
- Controller may construct View-owned render contracts and consume View-owned commands.

### 2.3 Stable View facades

Controller must not know the nested View folder structure.

Controller may import View only through:

```text
view/index.ts
view/commands/index.ts
view/views/index.ts
```

The facades have distinct responsibilities:

```text
view/index.ts           runtime composition API
view/commands/index.ts  flattened editor-command API
view/views/index.ts     flattened render-contract API
```

Do not re-export command or render types again through `view/index.ts`; each contract must have one canonical public import path.

### 2.4 Local ownership and flattening

- Local `commands.ts` and `views.ts` files contain definitions; they are not barrels.
- `view/commands/index.ts` and `view/views/index.ts` flatten the nested ownership tree for Controller.
- View implementation files should import nearby definitions directly, not route through public layer facades.
- Do not create empty React component folders solely to host future contracts.
- A command or view without a dedicated child component stays with the nearest real semantic owner.

### 2.5 Facade discipline

These files must contain only `@fileoverview`, concise export-group comments, and export declarations:

```text
view/index.ts
view/commands/index.ts
view/views/index.ts
controller/parse/index.ts
controller/deriveViews/index.ts
controller/commands/index.ts
```

No implementation, local declarations, helper functions, or imports used for computation may live in a facade.

---

## 3. Target View structure

Create the following contract files while preserving the existing React tree:

```text
webview/src/view/
├── index.ts
├── commands/
│   ├── index.ts
│   └── editorCommand.ts
├── views/
│   └── index.ts
├── App.tsx
├── AppHeader/
│   ├── commands.ts
│   ├── views.ts
│   └── ...existing files
├── EditorView/
│   ├── views.ts
│   ├── EditorView.tsx
│   ├── ClassDiagram/
│   │   ├── commands.ts
│   │   ├── views.ts
│   │   ├── ...existing files
│   │   └── ClassBox/
│   │       ├── commands.ts
│   │       ├── views.ts
│   │       ├── ...existing files
│   │       └── MemberTable/
│   │           ├── commands.ts
│   │           ├── views.ts
│   │           └── ...existing files
│   ├── StylePane/
│   │   ├── commands.ts
│   │   └── ...existing files
│   └── ToolPane/
│       └── ...existing files
├── contexts/
└── ui/
```

Do not create:

```text
view/contracts/
view/commands/classDiagram/       # not needed yet
view/views/classDiagram/          # not needed yet
component-local index.ts barrels
empty NamespaceBox/ or RelationshipEdge/ component folders
```

The semantic barrels may be subdivided later when their export lists become difficult to scan. Do not pre-split them in this task.

---

## 4. Move editor commands into View ownership

Delete after migration:

```text
webview/src/controller/commands/editorCommand.ts
```

Preserve every existing command discriminant, payload field, payload type, and union member.

### 4.1 MemberTable commands

Create:

```text
view/EditorView/ClassDiagram/ClassBox/MemberTable/commands.ts
```

Move here:

- `MemberPrefix`
- the `class.member.setText` variant
- the `class.member.setPrefix` variant

Define:

```ts
export type MemberCommand =
  | /* existing class.member.setText variant */
  | /* existing class.member.setPrefix variant */;
```

Use a concise file annotation:

```ts
/**
 * @fileoverview Editor commands owned by the class-member table.
 */
```

### 4.2 ClassBox commands

Create:

```text
view/EditorView/ClassDiagram/ClassBox/commands.ts
```

Move here:

- `ClassBoxCommand` with `class.move` and `class.resize` unchanged;
- the `class.header.setLabel` variant.

Import `MemberCommand` directly from `./MemberTable/commands`.

Preserve the existing Controller handler grouping by defining:

```ts
export type ClassHeaderCommand = /* existing class.header.setLabel variant */;

export type ClassContentCommand = ClassHeaderCommand | MemberCommand;
```

`ClassHeaderCommand` may remain local to this file and does not need to be exposed through the View command facade unless a real external consumer requires it.

Use:

```ts
/**
 * @fileoverview Editor commands owned by class-box rendering and content.
 */
```

### 4.3 ClassDiagram commands

Create:

```text
view/EditorView/ClassDiagram/commands.ts
```

Move here unchanged:

- `NamespaceCommand`
- `RelationshipCommand`
- `NoteCommand`

These command families currently have no dedicated working View component. Keep them at the nearest real semantic owner, `ClassDiagram`, rather than creating placeholder component folders.

Import `ClassBoxCommand` and `ClassContentCommand` from `./ClassBox/commands` and define:

```ts
export type ClassDiagramCommand =
  | ClassBoxCommand
  | ClassContentCommand
  | NamespaceCommand
  | RelationshipCommand
  | NoteCommand;
```

Use:

```ts
/**
 * @fileoverview Diagram-level editor commands and command-family aggregation.
 */
```

### 4.4 StylePane commands

Create:

```text
view/EditorView/StylePane/commands.ts
```

Move `StyleCommand` here unchanged.

Use:

```ts
/**
 * @fileoverview Editor commands owned by the class style inspector.
 */
```

### 4.5 AppHeader commands

Create:

```text
view/AppHeader/commands.ts
```

Move `GenerateCommand` here unchanged because the current Generate action is emitted by `AppHeader`.

Use:

```ts
/**
 * @fileoverview Editor commands emitted by the application header.
 */
```

### 4.6 Aggregate EditorCommand

Create:

```text
view/commands/editorCommand.ts
```

This file owns only the layer-wide aggregate command language:

```ts
import type { GenerateCommand } from "../AppHeader/commands";
import type { ClassDiagramCommand } from "../EditorView/ClassDiagram/commands";
import type { StyleCommand } from "../EditorView/StylePane/commands";

export type EditorCommand = GenerateCommand | ClassDiagramCommand | StyleCommand;
```

Use:

```ts
/**
 * @fileoverview Aggregate command language emitted by the View layer.
 */
```

Do not duplicate command variants in this file.

### 4.7 Command semantic barrel

Create `view/commands/index.ts` as a facade only.

Expected public types:

```text
EditorCommand
GenerateCommand
ClassDiagramCommand
ClassBoxCommand
ClassContentCommand
MemberCommand
MemberPrefix
StyleCommand
NamespaceCommand
RelationshipCommand
NoteCommand
```

Re-export each type from its actual owner. Do not redefine aliases in the barrel.

Suggested annotation:

```ts
/**
 * @fileoverview Public command contract of the View layer.
 * Flattens component-owned command definitions for Controller consumers.
 */
```

---

## 5. Move render contracts into View ownership

Delete after migration:

```text
webview/src/controller/deriveViews/viewModels.ts
```

Preserve all existing field names, optionality, readonly modifiers, nested shapes, and value semantics.

### 5.1 MemberTable views

Create:

```text
view/EditorView/ClassDiagram/ClassBox/MemberTable/views.ts
```

Move `ClassBoxMemberView` here unchanged.

Use:

```ts
/**
 * @fileoverview Render contract for class-member rows.
 */
```

Retain the existing concise explanation for the `kind` field only if it still reduces cognitive load.

### 5.2 ClassBox views

Create:

```text
view/EditorView/ClassDiagram/ClassBox/views.ts
```

Move `ClassBoxView` here unchanged.

Import `ClassBoxMemberView` directly from `./MemberTable/views`.

Use:

```ts
/**
 * @fileoverview Render contract for class-box nodes.
 */
```

Retain the existing concise explanation for the style name only if useful.

### 5.3 ClassDiagram views

Create:

```text
view/EditorView/ClassDiagram/views.ts
```

Move here unchanged:

- `NamespaceBoxView`
- `RelationshipView`

These types are currently consumed or semantically owned at the `ClassDiagram` level; do not create empty child component folders solely for them.

Use:

```ts
/**
 * @fileoverview Diagram-level render contracts for namespaces and relationships.
 */
```

### 5.4 EditorView aggregate view

Create:

```text
view/EditorView/views.ts
```

Move `ElementViews` here unchanged.

Import its constituent types directly from their local owners:

```text
ClassBoxView       → ClassDiagram/ClassBox/views
NamespaceBoxView   → ClassDiagram/views
RelationshipView  → ClassDiagram/views
```

Use:

```ts
/**
 * @fileoverview Aggregate render contract consumed by the visual editor.
 */
```

### 5.5 AppHeader view state

Move `EditorHeaderState` out of:

```text
view/contexts/EditorStateContext.ts
```

into:

```text
view/AppHeader/views.ts
```

Its shape must remain unchanged.

Use:

```ts
/**
 * @fileoverview Render state for editor status shown by the application header.
 */
```

`EditorStateContext.ts` should import `EditorHeaderState` from `../AppHeader/views`.
`AppHeader.tsx` should import it from `./views`.

### 5.6 View semantic barrel

Create `view/views/index.ts` as a facade only.

Expected public types:

```text
EditorHeaderState
ElementViews
ClassBoxView
ClassBoxMemberView
NamespaceBoxView
RelationshipView
```

Re-export each type from its local owner.

Suggested annotation:

```ts
/**
 * @fileoverview Public render contract of the View layer.
 * Flattens component-owned view definitions for Controller consumers.
 */
```

---

## 6. Extract cross-layer value vocabulary into shared

The moved View contracts must not import Controller model types.

### 6.1 Relationship type

Create:

```text
webview/src/shared/relationshipTypes.ts
```

Move `RelationshipType` from `controller/model/diagramTree.ts` without changing its union.

Use:

```ts
/**
 * @fileoverview Relationship value vocabulary shared by Controller and View.
 */
```

Update all consumers to import directly from `shared/relationshipTypes`.
Do not re-export it through `diagramTree.ts`, View barrels, or another shared barrel.

### 6.2 Style property name

Create:

```text
webview/src/shared/styleTypes.ts
```

Define the named union currently embedded in `StyleProperty["property"]`:

```ts
export type StylePropertyName =
  | "fill"
  | "stroke"
  | "color"
  | "strokeWidth"
  | "strokeDasharray";
```

Use:

```ts
/**
 * @fileoverview Style value vocabulary shared by Controller and View.
 */
```

Update `controller/model/diagramTree.ts`:

```ts
export type StyleProperty = {
  readonly property: StylePropertyName;
  readonly value: string;
};
```

Update View `StyleCommand` and `NamespaceCommand` to use `StylePropertyName` directly.

Remove all use of:

```ts
StyleProperty["property"]
```

Do not create `shared/index.ts`.

---

## 7. Create the View runtime facade

Create:

```text
webview/src/view/index.ts
```

It is the only View runtime surface imported by Controller.

Re-export only what `AppController` needs to compose and provide the View:

```ts
export { default as App } from "./App";
export { CanvasStateContext } from "./contexts/CanvasStateContext";
export { EditorDispatchContext } from "./contexts/EditorDispatchContext";
export { EditorStateContext } from "./contexts/EditorStateContext";
export { defaultCanvasState } from "./contexts/canvasState";
export type { CanvasState } from "./contexts/canvasState";
```

Adjust only if inspection proves an item is unnecessary or another current runtime dependency is genuinely required.

Do not export View hooks, component internals, commands, or render types from this facade.

Use:

```ts
/**
 * @fileoverview Public runtime API of the View layer.
 */
```

---

## 8. Update View implementation imports

After this refactor, no file under `webview/src/view/` may import from `controller/`.

Update at least the currently known consumers:

```text
view/contexts/EditorDispatchContext.ts
view/contexts/EditorStateContext.ts
view/EditorView/ClassDiagram/useClassBoxController.ts
view/EditorView/ClassDiagram/reactFlowAdapters.ts
view/EditorView/ClassDiagram/ClassBox/ClassBox.tsx
view/EditorView/ClassDiagram/ClassBox/MemberTable/MemberTable.tsx
view/EditorView/StylePane/useStylePaneController.ts
```

Inspect the entire View tree rather than treating this list as exhaustive.

### Internal View import rule

View implementation imports local definitions directly:

```ts
// ClassBox.tsx
import type { ClassBoxView } from "./views";

// MemberTable.tsx
import type { ClassBoxMemberView } from "./views";

// useStylePaneController.ts
import type { ClassBoxView } from "../ClassDiagram/ClassBox/views";
```

`EditorDispatchContext.ts` may import the aggregate directly from:

```ts
import type { EditorCommand } from "../commands/editorCommand";
```

Do not make View implementation files depend on `view/index.ts`, `view/commands/index.ts`, or `view/views/index.ts` merely for convenience.

---

## 9. Update Controller consumers

### 9.1 AppController

`AppController.tsx` must import:

```text
runtime composition and contexts → ../view
EditorCommand                    → ../view/commands
ElementViews, EditorHeaderState  → ../view/views
```

It must no longer import `EditorCommand` from `./commands` or `ElementViews` from `./deriveViews`.

Preserve all current parsing, memoization, state reconciliation, command dispatch, and rendering behavior.

### 9.2 deriveViews

Update:

```text
controller/deriveViews/deriveElementViews.ts
controller/deriveViews/workers/deriveClassBoxViews.ts
controller/deriveViews/workers/deriveNamespaceBoxViews.ts
controller/deriveViews/workers/deriveRelationshipViews.ts
```

All render-contract imports must come from:

```ts
import type { ... } from "../../view/views";
```

using the correct relative path.

Controller must not deep-import View component files.

Update `controller/deriveViews/index.ts` so it exports only:

```ts
export { deriveElementViews } from "./deriveElementViews";
```

Update its annotation to state that it projects the Controller model into View-owned render contracts.

### 9.3 commands

Update:

```text
controller/commands/applyCommand.ts
controller/commands/workers/handlers/*.ts
```

All editor-command imports must come from the View command facade:

```ts
import type { ... } from "../../view/commands";
```

using the correct relative path.

Controller must not deep-import View component files.

Update `controller/commands/index.ts` so it exports only:

```ts
export { applyCommand } from "./applyCommand";
export type { SourceEdit } from "./sourceEdit";
```

Remove `EditorCommand` and `MemberPrefix` re-exports.

Update annotations so Commands is described as applying View intent to the Controller model and producing source edits.

### 9.4 ExtensionBridge

Keep `SourceEdit` imported from the Controller Commands facade.

Do not make `extensionBridge` import View directly.

---

## 10. Strengthen the boundary checker

Update:

```text
scripts/check-webview-boundaries.mjs
```

The checker must enforce the strict architecture, including type imports.

### 10.1 Remove the current reverse-type exception

Delete the rule that permits View to type-import the Controller `deriveViews` or `commands` facades.

Replace it with:

```text
View must not import Controller or ExtensionBridge in any form.
```

### 10.2 Enforce Controller access to View facades

Controller may import View only through:

```text
view
view/commands
view/views
```

including the corresponding `/index` resolutions.

Apply narrower ownership rules where practical:

```text
controller/AppController.tsx    may import view, view/commands, view/views
controller/deriveViews/**       may import view/views only
controller/commands/**          may import view/commands only
controller/parse/**             must not import view
controller/model/**             must not import view
```

### 10.3 Enforce ExtensionBridge isolation

- `extensionBridge` may import `controller/AppController` at runtime.
- `extensionBridge` may type-import `SourceEdit` through the Controller Commands facade.
- `extensionBridge` must not import View directly.

### 10.4 Enforce View facade-only files

Add these to the facade-only checks:

```text
view/index.ts
view/commands/index.ts
view/views/index.ts
```

### 10.5 Prevent View self-facade coupling

View implementation files must not import the public layer facades:

```text
view/index.ts
view/commands/index.ts
view/views/index.ts
```

They should use local definitions or the specific internal aggregate module (`commands/editorCommand.ts`).
The facade files themselves are exempt while re-exporting definitions.

### 10.6 Retain existing rules

Preserve enforcement for:

- sibling Controller component isolation;
- Controller component public facades;
- `controller/model` importing only model/shared;
- `shared` importing no webview layers;
- forbidden `controller/model/index.ts`;
- forbidden `shared/index.ts`;
- facade-only Controller indexes.

Update checker annotations and error messages to describe strict webview layer boundaries, not only Controller component boundaries.

Do not add a new dependency for the checker.

---

## 11. Annotations and coding standards

Follow `docs/engineering/coding-standards.md` for every created or modified file.

- Every new non-component `.ts` file starts with a concise `@fileoverview`.
- Exported functions retain or receive concise JSDoc.
- Type declarations do not need repetitive comments.
- Comments explain ownership or non-obvious semantics only.
- Use `import type` for type-only imports.
- Prefer named types such as `StylePropertyName` over indexed-access types.
- Do not add broad defensive checks or unrelated cleanup.

Update stale file annotations caused by ownership changes, especially in:

```text
controller/deriveViews/**
controller/commands/**
view/contexts/EditorDispatchContext.ts
view/contexts/EditorStateContext.ts
view/EditorView/ClassDiagram/reactFlowAdapters.ts
scripts/check-webview-boundaries.mjs
```

---

## 12. Behavior constraints

This refactor must not change:

- React output or user-visible behavior;
- command discriminants;
- command payload fields or optionality;
- `ElementViews` or nested render-contract shapes;
- shared ID or geometry value formats;
- parser behavior;
- deriveViews projection behavior;
- command dispatch routing;
- source-edit generation;
- command failure messages;
- Generate behavior;
- ReactFlow node or edge IDs;
- source formatting;
- Extension Host or webview protocol behavior.

Do not implement currently unsupported commands.
Do not remove speculative command variants in this task.
Do not rename existing public command or view type names unless a rename is explicitly required above.

---

## 13. Out of scope

Do not:

- update architecture or other documentation;
- modify `COLLABORATORS.md`;
- redesign `SourceEdit`;
- redesign host/webview synchronization;
- change parser confidence behavior;
- add tests unrelated to import-boundary verification;
- reorganize the React component tree;
- create placeholder components;
- add a state-management library;
- introduce dependency injection infrastructure;
- refactor Controller workers beyond import and annotation changes required here.

Report unrelated smells rather than fixing them.

---

## 14. Verification

Run:

```bash
npm run check
npm run build
git diff --check
```

Verify strict layer direction:

```bash
rg -n 'from .*controller/' webview/src/view
```

Expected: no matches.

Verify removed Controller-owned View contracts:

```bash
test ! -f webview/src/controller/commands/editorCommand.ts
test ! -f webview/src/controller/deriveViews/viewModels.ts
```

Verify View facades exist:

```bash
test -f webview/src/view/index.ts
test -f webview/src/view/commands/index.ts
test -f webview/src/view/views/index.ts
```

Verify shared vocabulary ownership:

```bash
test -f webview/src/shared/relationshipTypes.ts
test -f webview/src/shared/styleTypes.ts
rg -n 'StyleProperty\["property"\]' webview/src
rg -n 'export type RelationshipType' webview/src/controller
```

Expected: the two `rg` commands return no matches.

Verify obsolete imports and exports are gone:

```bash
rg -n 'controller/(commands|deriveViews)' webview/src/view
rg -n 'editorCommand|viewModels' webview/src/controller
```

Expected: no architectural violations; file-name mentions should be absent after deletion.

Verify Controller imports View through stable facades only:

```bash
rg -n 'from .*view' webview/src/controller
```

Inspect every match. Expected targets are only:

```text
../view
../view/commands
../view/views
```

with relative depth adjusted by file location.

Verify facade files manually:

```text
view/index.ts
view/commands/index.ts
view/views/index.ts
controller/parse/index.ts
controller/deriveViews/index.ts
controller/commands/index.ts
```

They must contain only annotations, optional export-group comments, and exports.

Run the boundary checker directly:

```bash
npm run check:boundaries
```

Finally inspect the diff and confirm no runtime expression, command payload, view-model field, or generated text changed unintentionally.

---

## 15. Return

Report:

1. Final View contract tree.
2. Command definitions moved and their new semantic owners.
3. Render definitions moved and their new semantic owners.
4. Shared vocabulary extracted from the Controller model.
5. Controller facade changes.
6. View facade exports.
7. Boundary-checker rules added or removed.
8. Confirmation that View has zero Controller imports, including type imports.
9. `npm run check` result.
10. `npm run build` result.
11. `git diff --check` result.
12. Any issue that prevented a behavior-preserving strict-layer implementation.
