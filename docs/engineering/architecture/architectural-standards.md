# Architectural Standards

> **Implementation state:** Aspirational
> **Document state:** Maintained
> **Last reviewed:** 2026-06-22  
> **Scope:** Structural rules for production code in the Extension Host and Webview

## Index

1. [Context and scope](#1-context-and-scope)
2. [Architectural pattern catalogue](#2-architectural-pattern-catalogue)
3. [Extension runtime boundary](#3-extension-runtime-boundary)
4. [Webview layered architecture](#4-webview-layered-architecture)
5. [Controller component architecture](#5-controller-component-architecture)
6. [View component architecture](#6-view-component-architecture)
7. [Enforcement](#7-enforcement)
8. [Reference: terminology](#8-reference-terminology)

## 1. Context and scope

The Extension Host and Webview execute in isolated runtimes and communicate through an explicit message protocol. The Webview is a React application. The Extension Host mediates between the Webview and the authoritative `.mmd` document.

This document defines **how production code must be structured**. Target subsystem responsibilities and communication flows are defined in [System Architecture](./system-architecture.md).

Normative terms:

- **must / must not** — mandatory
- **should / should not** — expected unless a documented exception is justified
- **may** — optional

## 2. Architectural pattern catalogue

| Scope | Pattern | Project interpretation |
| --- | --- | --- |
| Extension | **Message-Based Integration across Isolated Runtimes** | Extension Host and Webview communicate only through an explicit, validated protocol. |
| Webview | **Strict Layered Architecture** | All dependencies, including type imports and re-exports, follow `extensionBridge → controller → view`; `shared` is a dependency-free foundation. |
| Controller | **Application Controller with a Functional Core** | `AppController` orchestrates independent functional components; sibling components do not orchestrate one another. |
| View | **Component-Based UI with Ownership-Based Composition** | React structure follows ownership; component contracts remain local and are exposed through semantic View facades. |

## 3. Extension runtime boundary

### 3.1 Runtime isolation

- The Extension Host and Webview must have separate runtime dependency graphs.
- Runtime communication must cross the boundary only through the message protocol.
- Neither runtime may import executable code from the other.
- Neither runtime may rely on mutable state owned by the other.
- Messages must contain JSON-compatible data.

### 3.2 Protocol boundary

The protocol is the complete wire vocabulary exchanged between the isolated runtimes. It is declared independently at both sides of the boundary:

```text
webview/src/extensionBridge/protocol.ts
extension-host/protocol.ts
```

- Each protocol module must define its complete message contracts locally.
- A protocol module must not import, re-export, alias, or extend project-owned, package, platform, or runtime-specific contracts. It defines; it does not reuse declarations from elsewhere.
- Protocol modules may contain only self-contained JSON-compatible data declarations, message unions, and explanatory comments.
- The two protocol modules intentionally duplicate the wire declarations and must remain structurally synchronized: message discriminants, payload fields, optionality, and field semantics must match.
- Synchronization must not be achieved by importing a protocol declaration across runtimes or by moving the wire contract into a shared application module.
- Protocol parsing and runtime validation must remain at the runtime boundary.
- Runtime-specific message representations must not enter application logic.

The source-edit payload is one canonical range replacement:

- `start` and `end` are zero-based source positions; the end position is exclusive.
- An empty range inserts `newText`.
- A non-empty range with empty `newText` deletes the range.
- A non-empty range with non-empty `newText` replaces the range.

### 3.3 Boundary adapters

- Boundary adapters own transport, serialization, runtime validation, and conversion between application contracts, protocol-owned wire contracts, and runtime-native contracts.
- The Webview Extension Bridge constructs protocol messages from Controller outputs; Controller must not import protocol modules.
- The Extension Host converts validated protocol payloads into VS Code-native operations; application semantics must not be inferred in the host.
- When an application contract and its wire representation currently have the same fields, their separate declarations still retain separate ownership.
- Translation across the boundary must preserve the semantics of supported operations.
- Transport failures and application outcomes must remain distinguishable.

## 4. Webview layered architecture

### 4.1 Dependency order

```text
extensionBridge
      ↓
controller
      ↓
view

shared  ← dependency-free foundation used by Webview layers
```

- Every module dependency must point within the same layer or downward.
- The rule applies equally to runtime imports, type imports, dynamic imports, and re-exports.
- A lower layer must remain unaware of every higher layer.
- Reverse-import exceptions are prohibited.
- `shared/` may be imported by any Webview layer and must not import from a layer.

Layering constrains **static knowledge**, not the direction of every runtime call. Runtime control may return upward through a callback supplied by a higher layer without creating a reverse dependency.

### 4.2 Layer boundary contracts and control inversion

- A lower layer owns the public boundary through which a higher layer uses it.
- That boundary defines accepted arguments, returned values, and callbacks the higher layer must provide.
- A higher layer may construct accepted arguments and implement required callbacks; doing so does not transfer ownership of the boundary contract.
- A lower layer may invoke an injected callback without importing the higher layer that implements it.
- Types used in a boundary signature belong to the layer whose semantics they express, or to `shared/` when their semantics are genuinely cross-layer.

Examples:

- Controller defines its `SourceEdit[]` output and the edit-application callback it requires; Extension Bridge implements that callback and constructs the corresponding protocol-owned edit payload.
- The Webview and Extension Host protocol modules independently define the same wire messages; neither imports the other or an application-owned contract.
- View defines `EditorCommand`, `CanvasState`, render contracts, contexts, and context handles; Controller supplies values and implementations conforming to those contracts.

### 4.3 Particular layer access rules

The table governs imports between Webview-owned modules. Platform APIs and third-party libraries are governed separately by layer responsibility.

| Consumer                              | Permitted dependencies                                                                                 |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `extensionBridge/protocol.ts`         | None; the protocol module defines its complete wire contract locally                                   |
| Other `extensionBridge` modules       | Own modules; Controller public API; `shared/`                                                          |
| `controller/AppController`            | Controller components and model; `view/App`; `view/commands`; `view/views`; `view/contexts`; `shared/` |
| Controller components                 | Own component internals; `controller/model`; relevant View contract facade; `shared/`                  |
| `view`                                | View modules; `shared/`                                                                                |
| `controller/model`                    | Sibling files within `controller/model/`; `shared/`                                                    |
| `shared`                              | Other dependency-free shared modules only                                                              |

Additional constraints:

- `extensionBridge/protocol.ts` must contain no imports or re-exports of any kind.
- The Webview and Extension Host protocol declarations must remain structurally synchronized.
- Controller must not deep-import the View component tree.
- Controller workers must not import React, React Flow, DOM, VS Code, or protocol modules.
- Extension Bridge must not import Controller model files, workers, or View modules.

### 4.4 Shared vocabulary areas

- `shared/` contains stable vocabulary whose semantics cross Webview layers, such as canonical identities and generic geometry.
- `controller/model/` contains source-derived vocabulary shared by Controller components.
- A shared area might be divided into submodules for namespace convenience 
- A narrower shared area may depend only on itself (e.g. own submodules) or more foundational shared areas.  
- A shared area must not depend on any layer or component that consumes it.
- `shared/` and `controller/model/` must not have root barrels.

## 5. Controller component architecture

### 5.1 Orchestrator and functional components

```text
                 ┌──────── parse
AppController ───┼──────── deriveViews
                 └──────── commands
```

- The orchestrator owns application sequencing and coordinates component outputs.
- Each functional component owns one transformation or decision boundary.
- Sibling components must not import or invoke one another.
- Data moves between sibling components through orchestrator-owned snapshots and contracts at their proper architectural owner.
- A component must not consume another component's private representation.

### 5.2 Component anatomy

```text
component/
├── index.ts          public facade
├── frontman.ts       public runtime entry point
├── contracts.ts      cohesive component-owned contracts, when needed
└── workers/          private implementation
```

The names are roles, not mandatory filenames.

- The component root must expose its boundary, frontman, and meaningful contracts.
- Private workers belong one level below the root.
- Deeper folders require a cohesive internal cluster.
- Components need not be structurally identical.
- Files must not be split for visual symmetry or one-export-per-file organization.

### 5.3 Component facade

- `index.ts` is the component's only external import target.
- `index.ts` may contain annotations, export-group comments, and re-export declarations only.
- `index.ts` must not contain declarations, initialization, implementation, or side effects.
- The public surface must be minimal and consumer-driven.
- A component must not re-export contracts owned elsewhere for convenience.
- External code must not deep-import workers or component contract files.

### 5.4 Frontman and workers

- The frontman is the component's public runtime operation.
- The frontman coordinates workers and owns component-level sequencing.
- Workers implement focused internal responsibilities.
- Workers may import directly within their component.
- Workers must not import through their own public facade.
- Helpers shared by several workers remain private to the component.

### 5.5 Shared Controller model

- Source-derived contracts consumed by multiple Controller components belong to `controller/model/`.
- The model is shared Controller vocabulary, not a component, and has no facade.
- Consumers import model declarations from their defining files.
- The model must not depend on Parse, Derive Views, Commands, View, or Extension Bridge.

## 6. View component architecture

### Section index

- [6.1 View root and public facades](#61-view-root-and-public-facades)
- [6.2 Ownership-based component structure](#62-ownership-based-component-structure)
- [6.3 View boundary](#63-view-boundary)

### 6.1 View root and public facades

#### 6.1.1 View root organization

```text
view/
├── App/
│   └── index.ts
├── commands/
│   ├── index.ts
│   └── editorCommand.ts
├── views/
│   └── index.ts
├── contexts/
│   └── index.ts
└── ui/
```

- `App/` owns the React application tree. Its `index.ts` exports only the `App` runtime entry point.
- `commands/`, `views/`, and `contexts/` expose stable semantic APIs to Controller.
- `ui/` contains visual primitives only after multiple legitimate View consumers exist.
- The View root must not contain `index.ts`.
- Controller must not import the nested React component tree directly.

#### 6.1.2 Semantic facade areas

- `view/commands/editorCommand.ts` defines `EditorCommand`, the single View-wide aggregate across command owners.
- `view/commands/index.ts` re-exports `EditorCommand` and selected owner-defined command contracts required by Controller; it does not define or aggregate commands.
- `view/views/index.ts` re-exports selected component-owned render contracts.
- `view/contexts/index.ts` re-exports View contexts and the contracts, defaults, and handles required to provide them.
- Facade `index.ts` files contain re-exports only.
- A facade area may contain dedicated layer-wide aggregate contract modules, but no rendering, state coordination, or interaction implementation.
- Controller must consume View APIs through `view/App`, `view/commands`, `view/views`, and `view/contexts`.
- Controller handlers should import the narrow owner-defined command contracts they handle through `view/commands`.
- View internals use direct imports from the defining modules and must not import their own public facades.

#### 6.1.3 Permitted deviations

- A new View-root area requires a View-wide semantic responsibility not owned by `App/`.
- A new root area must expose a purpose-specific API and must not become a miscellaneous shared folder.
- Convenience and anticipated growth are not sufficient reasons to add a root area.

### 6.2 Ownership-based component structure

A component folder may use the following roles:

| File or folder | Responsibility |
| --- | --- |
| `Component.tsx` | Renders the component and wires handlers to the DOM or framework surface it owns. |
| `Component.module.css` | Defines styles owned by the component. |
| `commands.ts` | Defines normalized editor commands emitted by event handlers owned by the component. |
| `views.ts` | Defines read-only render data accepted by the component. |
| `state.ts` | Defines transient state contracts and defaults owned by the component. |
| `useComponentInteractions.ts` | Constructs handlers registered on the component's own interaction surface. |
| `use<OwnedTarget><InteractionSurface>Interactions.ts` | Constructs handlers registered by the component for an owned child representation. |
| `OwnedChild/` | Contains a child component used exclusively by this component. |

- Files are optional; their responsibilities are fixed.
- Folder nesting represents ownership, not incidental DOM depth.
- Exclusive children are nested; independent features remain siblings.

#### 6.2.1 Command ownership

- A command is defined to normalize raw DOM or framework event into editor intent.
- Command ownership follows the event handler, not the entity targeted by the command.
- A parent-owned framework handler may emit a command concerning an owned child representation.
- A component may group several commands emitted by its own handlers into a local command family.
- A parent must not aggregate child-owned commands merely because the child is nested in its subtree.
- `EditorCommand` is the only aggregate spanning different command owners.

Examples:

- `ClassDiagram` owns classBox-move commands produced from React Flow node-drag events.
- `Member` owns edit event produced from member events.
- `MemberTable` owns reorder commands produced from member-row events.

#### 6.2.2 Render-contract ownership

- `views.ts` defines the read-only data accepted by the component's render boundary.
- A child component owns its render contract.
- A parent might aggregate child render contracts by importing them directly from their defining modules. View internals must not import through `view/views`; that facade is reserved for external consumers.

#### 6.2.3 State ownership

- `state.ts` defines transient state owned by the component.
- State shared by descendants is lifted to their nearest common owner.
- Context distributes state and handles; it does not determine semantic ownership.
- Persisted source-derived data must not be duplicated as independent View state.

#### 6.2.4 Interaction ownership

##### Registration ownership

- An interaction handler belongs to the component that owns the DOM or framework surface where the handler is registered.
- `useComponentInteractions.ts` constructs handlers for the component’s own interaction surface.
- A parent may own a child-targeted hook when the parent owns the registration surface, e.g. `ClassDiagram/useClassBoxNodeInteractions.ts` - `ClassDiagram` owns this hook because it registers React Flow node events, even though those events target class boxes.
- Child-targeted hooks use: `use<Target><InteractionSurface>Interactions.ts`
- Interaction hook names use the plural `Interactions` suffix.
##### Architectural interaction loops

- An interaction hook is required when an event enters either of data loops:
	- **events with effect on source:** emit a View-owned command;
	- **events with effect on other components**: update shared View state through its public update handle.
- Handlers whose effects remain local to one component may remain in `Component.tsx`.
- A local interaction may be extracted into a hook when it coordinates multiple handlers, state, effects, or refs. Pure event-data transformations belong in ordinary functions.
##### Event arbitration

- The deepest handler assigning semantic meaning to an event owns that gesture.
- If no nested handler claims the gesture, it may propagate to the owning ancestor or framework handler.
- A nested handler must stop propagation when an ancestor must not interpret the same gesture.
- Any required ancestor effect must then be invoked explicitly by the nested handler.

#### 6.2.6 Permitted deviations

- A component owning a third-party framework boundary may define `<framework>Adapters.ts`, such as `reactFlowAdapters.ts`. A framework adapter must remain private to its component subtree and must not expose framework types through View contracts.
- Additional file roles require an existing cohesive responsibility that the standard roles do not cover.

### 6.3 View boundary

- View modules may import only View modules and `shared/`.
- View contracts must not expose React, DOM, React Flow, Controller-model, or source-edit types.
- View may update transient state and emit normalized commands.
- View must not parse Mermaid or construct source edits.

## 7. Enforcement

`scripts/check-webview-boundaries.mjs` validates project-owned Webview dependencies and the protocol invariants at the Extension runtime boundary.

### 7.1 Analysis scope

The checker analyzes:

- `.ts` and `.tsx` files under `webview/src/`, excluding `.d.ts` files
- runtime imports
- `import type` declarations
- side-effect imports
- `export ... from` and `export type ... from` declarations
- relative imports and configured aliases that resolve inside `webview/src/`
- all dependency syntax in `webview/src/extensionBridge/protocol.ts` and `extension-host/protocol.ts`, including package and platform imports
- exported protocol declarations in both protocol modules

All analyzed imports and re-exports are dependencies. Package and platform imports are outside the normal Webview dependency matrix, but they are prohibited in protocol modules.

### 7.2 Permitted project dependencies

| Importer                              | Permitted targets                                                                                                            |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `main.tsx`                            | Extension Bridge runtime entry                                                                                               |
| `extensionBridge/protocol.ts`         | None                                                                                                                         |
| Other `extensionBridge/**` modules    | Own modules; `controller/AppController`; type-only exports from `controller/commands`; `shared/**`                           |
| `controller/AppController.tsx`        | Controller component facades; `controller/model/**`; `view/App`; `view/commands`; `view/views`; `view/contexts`; `shared/**` |
| `controller/parse/**`                 | Own component modules; `controller/model/**`; `shared/**`                                                                    |
| `controller/deriveViews/**`           | Own component modules; `controller/model/**`; `view/views`; `shared/**`                                                      |
| `controller/commands/**`              | Own component modules; `controller/model/**`; `view/commands`; `shared/**`                                                   |
| `controller/model/**`                 | Other `controller/model/**` modules; `shared/**`                                                                             |
| `view/**`                             | Other View modules; `shared/**`                                                                                              |
| `shared/**`                           | Other `shared/**` modules                                                                                                    |

Controller components may not import one another. Data shared between them passes through `AppController`, `controller/model/`, or `shared/` according to semantic ownership.

Protocol enforcement:

- `webview/src/extensionBridge/protocol.ts` and `extension-host/protocol.ts` must contain no imports, re-exports, dynamic imports, `require` calls, or import-type expressions.
- Their exported protocol declarations must remain structurally synchronized. Comments and formatting need not match; the wire contract must.

### 7.3 Facade configuration

The boundary checker recognizes these facade files:

```text
controller/parse/index.ts
controller/deriveViews/index.ts
controller/commands/index.ts
view/App/index.ts
view/commands/index.ts
view/views/index.ts
view/contexts/index.ts
```

Facade rules:
- Imports from outside a Controller component must target that component's root facade.
- View implementation modules use direct local imports and must not import through View facades.
- Facade files may contain only comments and re-export declarations.
- `view/App/index.ts` may expose only the `App` runtime entry.
- These root barrels are prohibited:
	  - `view/index.ts`
	  - `controller/model/index.ts`
	  - `shared/index.ts`

### 7.4 Execution

```text
npm run check:boundaries
```

The command exits with a non-zero status and reports each violating file, module specifier, and rule. It is included in `npm run check`.

The checker verifies module structure, protocol self-containment, and synchronization of the duplicated protocol declarations. Semantic ownership, component cohesion, interaction arbitration, and whether the protocol expresses the correct product semantics remain review concerns.

## 8. Reference: terminology

### 8.1 Structural terms

| Term | Meaning |
|---|---|
| **Module** | One source file with its own import and export scope. |
| **Layer** | An ordered group of modules governed by one dependency direction. |
| **Component** | A cohesive group of modules with one public boundary and private implementation. |
| **React component subtree** | A React component and the child components, state, contracts, styles, and interactions it semantically owns. |
| **Shared contract area** | A non-layer component that defines vocabulary used by several consumers, such as `shared/` or `controller/model/`. |
| **Boundary** | The public interaction point through which one runtime, layer, or component uses another. |
| **Contract** | The types and callable signatures that define a boundary. |
| **Protocol contract** | A self-contained JSON-compatible wire declaration defined independently and kept synchronized at both isolated runtimes. |
| **Facade** | A stable import surface that exposes selected definitions while hiding their physical location. |
| **Frontman** | The public runtime operation that coordinates a Controller component’s workers. |
| **Worker** | A private module implementing one part of a Controller component. |

### 8.2 Ownership

**Owns** means “is the authoritative semantic home.” The owner determines meaning, invariants, and evolution. The owner may be a module, component, layer, or shared contract area.

| Subject | Ownership means |
|---|---|
| **Type or contract** | Authority over its semantics, valid shape, and evolution. |
| **State** | Authority over its meaning, lifecycle, and valid transitions. Physical storage may be lifted elsewhere. |
| **Interaction** | Authority over the DOM or framework event surface where the handler is registered and interpreted. |
| **Command** | Authority at the View interaction boundary where a raw event is normalized into editor intent. |
| **Behavior** | Authority over the rule or decision being implemented, independent of where it is invoked. |

Ownership is not established by importing, constructing, storing, implementing, or re-exporting an artifact.

### 8.3 Definition and runtime verbs

| Verb | Meaning |
|---|---|
| **Defines** | Contains the source declaration or implementation. A facade that re-exports a declaration does not define it. |
| **Declares** | States a required contract, such as accepted arguments or an injected callback signature. |
| **Constructs / creates** | Produces a runtime value conforming to a contract. Construction does not imply ownership. |
| **Stores** | Retains a runtime value. Storage does not imply semantic ownership. |
| **Hosts state** | Stores state on behalf of its semantic owner, usually at a composition boundary. |
| **Manages state** | Applies the state’s lifecycle and transition rules. |
| **Implements** | Supplies executable behavior conforming to a declared contract. Implementation does not transfer contract ownership. |
| **Provides / injects** | Passes a value or callback implementation to another module. |
| **Registers** | Attaches a callback to a DOM, framework, or protocol event source. |
| **Handles** | Interprets an event and chooses the resulting state update or command. |
| **Invokes** | Calls a function or injected callback. |
| **Emits** | Sends a normalized value through a callback, dispatch function, or event boundary. |
| **Returns** | Produces the direct result of a function call. |
| **Consumes** | Accepts and uses a public contract or value. |
| **Exposes** | Makes a definition available through a public boundary. |
| **Re-exports** | Exposes a definition from another module without acquiring ownership. |
| **Coordinates / orchestrates** | Sequences components and transfers data between them without absorbing their responsibilities. |
| **Translates / adapts** | Converts between representations at a boundary while preserving the represented semantics. |
| **Persists** | Writes a value to the authoritative durable store. |

Avoid **controls** in architectural descriptions unless its exact meaning is stated. Prefer **owns**, **stores**, **hosts**, **manages**, **provides**, **invokes**, or **coordinates**.

### 8.4 Applied examples

| Artifact | Defined by | Owned by | Constructed or hosted by | Consumed by |
|---|---|---|---|---|
| `EditorCommand` | Owner-local `commands.ts` files; aggregate in `view/commands/editorCommand.ts` | View | View interaction handlers | Controller Commands |
| `ElementViews` and nested render contracts | Component-local `views.ts` files | View | Controller Derive Views | View components |
| `CanvasState` | The owning View component’s `state.ts` | Owning View component | May be hosted by `AppController`; distributed through View context | View components |
| `SourceEdit` | Controller Commands | Controller Commands | Command handlers | Extension Bridge |
| Protocol message contracts | Independently in `webview/src/extensionBridge/protocol.ts` and `extension-host/protocol.ts` | Extension runtime boundary | Boundary adapters construct and validate protocol values | Opposite runtime boundary adapter |
