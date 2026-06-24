# Shiny View React Architecture

> **Implementation state:** Aspirational
> **Document state:** Maintained, being tested and updated
> **Scope:** `webview/src/shinyView/**`  
> **Runtime root:** `webview/src/shinyView/EditorView/`  
> **Audience:** Humans and coding agents  
> **Last reviewed:** 2026-06-24  
> **Normative language:** **must** / **must not** are mandatory; **should** / **should not** are defaults requiring an explicit reason to violate.  
> **Change control:** Job tags and component roles are a closed set. Additions require updating this document first.

## 1. Boundary

- **Entry point:** `shinyView` is the top of the standardized React tree. `EditorView` is its runtime component entry.
- **Inputs:** immutable Shiny View contracts and an `EditorDispatch` implementation supplied by `ShinyController`.
- **Outputs:** normalized `EditorCommand` values sent through `EditorDispatch`.
- **Calls outside the Shiny View tree:**
  - **`shared/`:** dependency-free IDs, geometry, and shared data vocabulary.
  - **React and browser APIs:** rendering, lifecycle, focus, measurement, and event registration.
  - **Approved UI/framework packages:** used only inside the adapting component folder.

`shinyView` must not import Controller, Shell, Extension Bridge, source text, parser models, source edits, or host protocol types. `EditorView/index.ts` is its sole public facade; code outside `shinyView` may import only `EditorView`, its root View, `EditorCommand`, and `EditorDispatch` through it.

A **View** is immutable render data. A **state action** is an internal request to change component-owned state. A **Command** is the View-to-Controller protocol.

## 2. Mental model

### 2.1. Jobs

A React component has three job families: `logic:*` decides, `render:*` presents, and `connect:*` moves data or intent without decisions. Job tags below are used for code annotations defined in section 4.1.

#### `logic:*`

Owns a state lifecycle or derives Shiny/editor meaning.

- `logic:state:initialize` — create and store authoritative component state.
- `logic:state:transform` — compute and commit the next owned state from a semantic request or framework change.
- `logic:state:reconcile` — derive a valid effective value and repair stored state after authoritative props or Views change.
- `logic:state:transport` — expose a controlled state-change request channel beyond the owner.
- `logic:view:child` — construct a child-owned View by filtering, combining, defaulting, or deriving data.
- `logic:view:prop` — derive a render-facing value by applying a Shiny/editor decision, such as combining inputs, gating behavior, choosing a fallback, or enforcing an invariant.
- `logic:view:route` — choose which child interface branch renders.
- `logic:command:derive` — choose command versus no-op and construct the complete `EditorCommand`.

Validation, gating, and invariants use the tag for the output they control; do not invent separate job names.

#### `render:*`

Produces visual output from already-decided values.

- `render:ui` — render UI owned by the component using native DOM, UI/framework primitives, text, styles, interaction affordances, or accessibility metadata. Merely returning child interfaces is not `render:ui`.
- `render:layout` — arrange child interfaces into structural regions; wrappers used only for placement remain layout.

#### `connect:*`

Moves data or intent through the pipeline without Shiny/editor decisions.

- `connect:adapt:view` — pass a View branch or mechanically select a fixed field, rename, repackage, or trivially format already-decided data.
- `connect:adapt:framework` — mechanically reshape or convert units for already-decided framework props or descriptors; feature decisions remain `logic:view:prop`.
- `connect:adapt:event` — convert a raw DOM, browser, React, or framework event into plain typed data; branching or intent selection is Logic.
- `connect:wire:action` — invoke an already-selected callback or dispatch an already-determined state action.
- `connect:wire:command` — dispatch a fixed or already-derived `EditorCommand`.

If required code does not fit an existing job—for example, `ResizeObserver` registration, imperative focus, or framework-instance synchronization—the agent must flag the missing classification and must not implement it under an approximate tag.

### 2.2. Roles

There are two component roles.

#### `[P] Presentational`

Contains no `logic:*` job.

Allowed jobs:

- `render:*`
- `connect:*`

A Presentational component may trivially adapt already-decided View data and wire fixed effects; any state lifecycle or Shiny/editor decision makes it Logic.

#### `[L] Logic`

Contains at least one `logic:*` job.

Allowed jobs:

- `logic:*`
- `render:*`
- `connect:*`

A Logic component may render directly. Extract a Presentational child only for a separately owned interface or UI reused by two or more route branches.

#### Variations

1. **Logic with presentation** — `[L]` plus `render:*`; no separate Presentational child is required by default.
2. **State hub** — `[L]` that owns state used by independent descendants and provides `logic:state:transport` through a scoped Context. Hub is a variation, not a third role.
3. **Framework adapter** — a component with `connect:adapt:framework` and/or `connect:adapt:event`. Framework use alone does not make it Logic; owned state or Shiny/editor decisions do.

## 3. Structure

Each component folder has one exported interface component named after the folder. Nested folders represent exclusively owned child interfaces. Shared Shiny View primitives live under `shinyView/ui/`.

Keep one pure, single-use helper in the component. Create a support file when a job has two or more helpers, a helper is independently tested, or framework imports must be isolated. A support file serves one job family; `useInteractions.ts` may contain only event adaptation, command derivation, and wiring. Do not create files for symmetry.

Component file order is fixed:

1. role header;
2. imports;
3. props and local types;
4. annotated helpers;
5. exported component.

Helpers stay above the component so the file ends with the rendered interface.

### 3.1. Presentational component

```text
Component/
├── Component.tsx               # render:*; connect:*
├── views.ts                    # immutable input contract, when domain-specific
├── adapters.ts                 # connect:adapt:view helpers (optional)
├── useInteractions.ts          # connect:adapt:event; connect:wire:* (optional)
├── Component.module.css        # render:* (optional)
└── OwnedChild/                 # exclusively owned interface (optional)
```

A Presentational component must not contain `state.ts`, a reducer, or a state Context.

### 3.2. Logic component

```text
Component/
├── Component.tsx               # visible job orchestration; optional render:*
├── views.ts                    # immutable input contract
├── state.ts                    # pure logic:state:* model/helpers (optional)
├── useStateReconciliation.ts   # logic:state:reconcile effect only (optional)
├── childViews.ts               # logic:view:child helpers (optional)
├── commands.ts                 # logic:command:derive helpers (optional)
├── <Framework>Adapters.ts      # connect:adapt:framework / connect:adapt:event (optional)
├── useInteractions.ts          # connect:adapt:event; logic:command:derive; connect:wire:* (optional)
├── contexts/                   # logic:state:transport; state hub only (optional)
├── Component.module.css        # render:* when the component presents UI (optional)
└── OwnedChild/                 # exclusively owned interface (optional)
```

`state.ts` defines state vocabulary and pure transformations; runtime storage remains in the component.

When present, component-body jobs follow this order:

```text
logic:state:initialize
logic:state:transform
logic:state:reconcile
logic:view:child / logic:view:prop / connect:adapt:view
connect:adapt:framework
logic:state:transport
connect:adapt:event / logic:command:derive / connect:wire:*
logic:view:route
render:*
```

A component may have one `useInteractions.ts` for handler pipelines only. It must not own or reconcile state, derive child Views, route interfaces, or render output.

## 4. Rules

### 4.1. Annotations

#### Component file header

Every React component file starts with one of these exact shapes.

Presentational:

```ts
/**
 * @role [P] Presentational
 * @adapts <framework or boundary>. // optional
 * @presents <interface or surface>.
 */
```

Logic:

```ts
/**
 * @role [L] Logic
 * @logic <owned state lifecycle or decision>.
 * @transports <state-action channel and descendant scope>. // state hub only
 * @adapts <framework or boundary>. // optional
 * @presents <interface or surface>. // optional
 */
```

Include only applicable lines. Do not list job tags in the header. Do not add a second function JSDoc that repeats the header.

Non-component support files use:

```ts
/**
 * @fileoverview <owner and single responsibility>.
 */
```

#### Inline job annotations

A job annotation starts a contiguous region in the current lexical scope and covers following executable code until the next annotation in that scope or the scope ends. Adjacent functions with the same job may share one region. A nested scope inherits the active job unless it starts a different annotated region.

```ts
// @job logic:state:initialize
```

```tsx
{/* @job render:ui */}
```

A helper region uses:

```ts
// @job-helper logic:view:child
```

Rules:

- Use only tags from section 2.1.
- Annotate both an extracted helper and its call site.
- Split mixed-job regions before annotating them.
- Do not annotate imports, types or interfaces, static module constants, prop destructuring, braces, dependency arrays, direct JSX prop attachment, direct fixed JSX wiring such as `onClick={() => onSelect(view.id)}`, or JSX nodes already covered by a render region.
- Inline JSX callbacks may perform only direct fixed wiring. Extract and annotate any callback that adapts an event, transforms data, validates, branches, or derives an action or Command.

### 4.2. Dependencies

1. **Views flow down.** Pass View data through props or a framework descriptor such as `node.data.view`.
2. **Views are data-only.** They contain no callbacks, setters, dispatch functions, services, React elements, raw events, or framework instances.
3. **The receiving component owns its View contract.** A parent may import a child component and its View contract to construct or aggregate that input.
4. **State has one owner.** Raw setters never leave the owner. Descendants and frameworks receive typed actions or named owner callbacks.
5. **State transport is not state delivery.** Context may carry only a typed state-action dispatch function; current state still flows through Views and props.
6. **Contexts are transport-only.** Context files contain context creation, a consumer hook, and its fail-fast guard—no state, reducer, View, reconciliation, or wrapper Provider component.
7. **State actions and Commands are distinct.** Use `dispatch<Owner>StateAction` for internal state transport and `dispatchCommand` for the View-to-Controller protocol. Never use an unqualified `dispatch`.
8. **Owner reconciliation is internal.** Reconciliation hooks receive semantic owner modifiers, never raw setters or generic action dispatch.
9. **Commands are normalized.** `logic:command:derive` produces a complete Command or no-op. `connect:wire:command` only sends an already-determined Command.
10. **Raw events stay local.** Normalize DOM/framework events before passing data across the binding component boundary.
11. **Framework details stay local.** Framework imports may appear only in the adapting component file and explicitly framework-named support files in its folder. Framework types must not escape through Views, Commands, state-action or Context contracts, or child props. Callbacks may be passed directly at the framework binding site, never inside data descriptors.
12. **Do not mirror Views into state.** Store only values requiring persistence across renders or framework-local transient state; derive everything else during render.
13. **Dependencies point inward.** `shinyView` may import its own modules, `shared`, React/browser APIs, and approved frameworks—never Controller, Shell, Bridge, or source-processing modules.
14. **Shared vocabulary lives at the narrowest owner.** Descendants may type-import an ancestor-owned state/action vocabulary but must not import ancestor implementation or current state.
15. **No generic logic hooks.** Do not create hooks such as `useComponentLogic` that hide the component’s job regions.

### 4.3. Patterns

#### `logic:state:*`

| Job | Required pattern |
| --- | --- |
| `logic:state:initialize` | Use `useReducer` when one transition atomically changes multiple fields or its typed dispatch is transported through Context; otherwise use `useState`. Never add a reducer for symmetry. |
| `logic:state:transform` | With `useState`, keep the raw setter private and expose named semantic modifiers. With `useReducer`, define `State`, `StateAction`, initial state, and reducer in `state.ts`. Pure transformations belong in `state.ts`. |
| `logic:state:reconcile` | Derive and render from a synchronously valid effective value, then repair invalid stored state in an owner-local effect or `useStateReconciliation.ts`. The effect calls semantic modifiers, never a raw setter or generic dispatch. |
| `logic:state:transport` | For one consumer path or a framework, pass a named owner callback. Use scoped action-only Context only when the same actions are consumed in two or more descendant branches and neither branch owns the other. Render the raw `.Provider` at the owner. |

A reducer dispatch may remain private inside a semantic owner modifier. It becomes transport only when exposed beyond the owner.

#### `logic:view:*`

- `logic:view:child` — use a pure `to<ChildName>View(...)` helper and follow the support-file rule in section 3.
- `logic:view:prop` — name the result by the rendered prop, not its cause: `isResizeVisible`, not `isSoleSelection`. Trivial selection or formatting is `connect:adapt:view`.
- `logic:view:route` — after all hooks, use an exhaustive variant switch in the Logic component. Route to child interfaces; do not return React elements or component types from helpers.

#### `logic:command:derive` and `connect:wire:command`

- Derive a Command in a pure helper in `commands.ts` when the payload depends on current Views, owned state, validation, or variant choice.
- Dispatch through `dispatchCommand`.
- A fixed Command or an already-derived Command may be sent directly under `connect:wire:command`, including from a Presentational component.
- Commands never mutate View-local state directly; state actions never cross into the Controller protocol.

#### `connect:adapt:framework`

- Keep framework projection in `<Framework>Adapters.ts` when it requires a helper or isolates framework imports.
- Framework-created child descriptors carry data-only child Views.
- Normalize framework events under `connect:adapt:event` before invoking state transport, callbacks, or command logic.
- Framework-controlled state follows the same deterministic `logic:state:*` rules above.
- Do not add Context when framework callbacks already provide sufficient local transport.

#### Approved hooks

- Built-in hooks are limited to `useState`, `useReducer`, `useEffect`, `useMemo`, and `useCallback`; `useContext` may appear only inside a Context consumer hook.
- Custom hooks are limited to `useInteractions`, `useStateReconciliation`, and Context consumer hooks defined by this standard. `useRef` and all unlisted hooks are prohibited. Use current event data, direct callback refs, or owned state; otherwise flag the missing pattern.
