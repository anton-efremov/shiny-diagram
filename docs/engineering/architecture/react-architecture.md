# Shiny View React Architecture

> **Implementation state:** Aspirational   
> **Document state:** Maintained   
> **Scope:** `webview/src/shinyView/**`  
> **Runtime root:** `webview/src/shinyView/EditorView/`  
> **Audience:** Humans and coding agents  
> **Last reviewed:** 2026-06-26  
> **Change control:** Job tags and component roles are a closed set. Additions require updating this document first.

Every bold two-part index in chapters 3–7 identifies **a rule that must be followed**. Unindexed text provides scope, definitions, rationale, or examples.

The document can be updated if rules imposed are too rigid to finish a development task or self-contradictory. All this cases might be flagged before the work continues

## 1. Context

### 1.1. Place in a full layered architecture

`shinyView` is the layer in the 4-layered Shiny architecture that renders UI from diagram state and emits editor command transactions for persistent diagram changes handled above the View layer.
- `shinyView/EditorView/index.ts` is the runtime component facade.
- `shinyView/views/index.ts` is the View-contract facade.
- `shinyView/commands/index.ts` is the command-registry facade.
- `shinyView/state/editorStates.ts` is the View state ledger.

### 1.2. Boundaries

- **Entry point:** `webview/src/shinyView/**` is the Shiny View layer; the standardized editor React tree starts at `webview/src/shinyView/EditorView/`, whose root component is `EditorView`.
- **Inputs:** immutable `view` contracts (a data object shaped for one component interface) and an `EditorDispatch` function supplied by `ShinyController`.
- **Outputs:** normalized `EditorCommandTransaction` values, each representing one user/editor action as one or more primitive editor-domain commands sent through `EditorDispatch`.
- **State vocabulary:** semantic View state shapes are declared in `shinyView/state/editorStates.ts`; runtime ownership stays with the component that owns the state.
- **Editor facts:** View may decide source-agnostic editor facts available from interaction and render context, such as position and size. New persisted identities and source names are assigned by Controller.
- **Calls outside the Shiny View tree:**
	  - **`shared/`:** dependency-free IDs, geometry, and shared data vocabulary.
	  - **React and browser APIs:** rendering, lifecycle, focus, measurement, and event registration.
	  - **Approved UI/framework packages:** `@xyflow/react` / React Flow.

### 1.3. Key concepts

- **view** - immutable render data shaped as component interface (Controller -> ShinyView via props). 
- **command** - a primitive editor-domain data object from the canonical command registry; it describes editor intent without source syntax or source-edit operations.
- **command transaction** - one user/editor action sent through `EditorDispatch` as one or more primitive commands.
- **state ledger** - the canonical list of semantic View state shapes; it defines state vocabulary, not runtime defaults, reducers, helpers, or consumer-specific projections.
- **state action** - an internal request to change component-owned state (e.g. selection group) through internal dispatch or callback
- **state reconciliation** - an internal update of state, triggered by view props (e.g. excluding deleted id from selection group)

## 2. Mental model

### 2.1. Jobs

A React component has three job families: `logic:*` decides, `render:*` presents, and `connect:*` moves and changes shape of data or intent without decisions. Job tags below are used for code annotations defined in chapter 7.

#### `logic:*`

Jobs that **encode editor behavior** or manage component-owned state lifecycles.

- `logic:state:initialize` — create and store authoritative component state.
- `logic:state:update` — compute and commit the next owned state triggered by user interaction, through a typed *state action* or named owner callback.
- `logic:state:reconcile` — repair owned state after Controller-supplied `view` props change.
- `logic:child:view` — construct a child-owned `view` by filtering, combining, defaulting, or deriving data.
- `logic:child:route` — choose which child interface branch renders.
- `logic:action:derive` — translate normalized interaction intent into the component-owned state action that should happen next.
- `logic:command:derive` — translate normalized interaction intent into the complete `EditorCommandTransaction` that should be sent to the Controller.

#### `render:*`

Job that produces visual output from already-decided values.

- `render:structure` — define visual surface structure by arranging native DOM elements, UI/framework visual primitives, text/content, etc.  Merely composing child interfaces in order is not `render:structure`. It is `connect:child:compose`.
- `render:style` — apply CSS styling to visual surface.

#### `connect:*`

Jobs that move data through the pipeline without Shiny/editor decisions.

- `connect:child:view` — pass a View branch or mechanically select a fixed field, rename, repackage, or trivially format already-decided data.
- `connect:framework:props` — mechanically reshape Shiny standard contract into framework contract.
- `connect:child:compose` — assemble owned child interfaces by passing already-derived views and transport callbacks. Passive wrappers used only to group children or satisfy React/framework structure belong here.
- `connect:event:normalize` — convert a raw DOM, browser, React, or framework event into plain typed data; branching or intent selection belongs to `logic:action:derive` or `logic:command:derive`.
- `connect:event:wire` — control event delivery at the boundary, such as preventing default behavior, stopping propagation, setting or releasing pointer capture, or attaching an already-defined handler to an event prop.
- `connect:state:wire` — expose or invoke a controlled state-update channel through a typed state-action dispatch or named owner callback.
- `connect:command:wire` — provide `EditorDispatch` transport or invoke it with a fixed or already-derived `EditorCommandTransaction`.

### 2.2. Roles

There are three component roles.
#### `[L] Logic`

Owns state or editor decisions and composes child interfaces.
Contains at least one `logic:*` job and no `render:*` jobs
**Allowed jobs:** `logic:*`, `connect:*`
#### `[P] Presentational`

Owns a visual surface.
Contains at least one `render:*` job and no no `logic:*` job.
**Allowed jobs:** `render:*`, `connect:*`

#### `[A] Framework adapter`

Binds an approved framework contract and contains only `connect:*` jobs. Owns no Shiny state, editor decisions, or Shiny visual surface.
**Allowed jobs:** `connect:*`

## 3. Component composition rules

**3.1 Logic component** contains at least one `logic:*` job, no `render:*` jobs, and any `connect:*` jobs.

**3.2 Presentational component** contains at least one `render:*` job, no `logic:*` jobs, and any `connect:*` jobs. It follows, that presentational component cannot own state or contain `state.ts`, a reducer, or a state-action Context.

**3.3 Framework adapter** binds an approved framework contract and contains only `connect:*` jobs. It follows that Framework adapter must not own state or contain `state.ts`, `actions.ts`, `commands.ts`, a reducer, or a Context.

**3.4 Dual role.** A component may play `[L]+[P]` when either role is thin and separating it would add unjustified indirection.

**3.5 Adapter purity.** A Framework adapter always remains pure `[A]`; it may not combine with `[L]` or `[P]`.

## 4. Component organization

### General rules

**4.1 Component folder.** Each component has a dedicated folder named after it, with one exported interface component in `ComponentName.tsx`.

**4.2 Child component folders.** Folders for exclusively owned child interfaces are nested in the parent component folder.

**4.3 Shared components.** Shared Shiny View primitives live under `shinyView/ui/`.

**4.4 Support files.** A pure, single-use helper stays in the component file. A support file exists only for multiple same-job helpers or independently tested helpers. Support files are not created for symmetry. Exceptions are `useInteractions.ts`, `useStateReconciliation.ts`, `views.ts` and `state.ts` 

**4.5 Support-file grouping.** Support files remain siblings of the file they support. A nested folder exists only when a support concern becomes a multi-file module; its entry file has the same name as the folder.

### Presentational component

**4.6 Folder structure** of a Presentational component:

```text
Component/
├── Component.tsx               # render:*; connect:*
├── views.ts                    # immutable input contract, when domain-specific
├── childViews.ts               # connect:child:view helpers (optional)
├── useInteractions.ts          # connect:event:normalize; connect:event:wire; connect:state:wire (optional)
├── Component.module.css        # render:style (optional)
└── OwnedChild/                 # exclusively owned interface (optional)
```

### Logic component

**4.7 Folder structure** of a Logic component:

```text
Component/
├── Component.tsx               # logic:*; connect:*
├── views.ts                    # immutable input contract
├── state.ts                    # owner-local state actions, defaults, reducers, and pure transformations (optional)
├── useStateReconciliation.ts   # logic:state:reconcile hook and local helpers (optional)
├── childViews.ts               # logic:child:view and connect:child:view helpers (optional)
├── actions.ts                  # logic:action:derive helpers (optional)
├── commands.ts                 # logic:command:derive helpers; constructs transactions from the canonical command registry (optional)
├── useInteractions.ts          # # connect:event:normalize; logic:action:derive; logic:command:derive; connect:*:wire (optional)
├── contexts/                   # connect:state:wire; or EditorDispatch at EditorView (optional)
└── OwnedChild/                 # exclusively owned interface (optional)
```

**4.8 State module.** `state.ts` defines owner-local state actions, defaults, reducers, and pure transformations; runtime storage remains in the Logic component. Semantic editor state shapes are imported from the View state ledger when the state domain is listed there.

### Framework adapter

**4.9 Folder structure.** Use this structure for a Framework adapter:

```text
<Framework><Interface>Adapter/
├── <Framework><Interface>Adapter.tsx  # connect:*
├── views.ts                           # data-only adapter input (optional)
├── <framework>Adapters.ts             # framework props and event normalization (optional)
├── useInteractions.ts                 # event normalization and wiring (optional)
└── OwnedChild/                        # exclusively owned interface, might be another adapter (optional)
```

### Dual-role component

**4.10 Folder structure.** A `[L]+[P]` component combines the folder structure of both `[L]` and `[P]` components.

### File organization

**4.11 Component file order.** Use this fixed order:

1. role header;
2. imports;
3. props and local types;
4. annotated helpers;
5. exported component -  file ends with the rendered interface.

**4.12 Logic component-body order.** When present, jobs follow this order:

```text
logic:state:initialize
logic:state:update
logic:state:reconcile
logic:child:view / connect:child:view
connect:event:normalize / logic:action:derive / logic:command:derive
connect:event:wire / connect:state:wire / connect:command:wire
logic:child:route
connect:child:compose
render:*                                               # [L]+[P] only
```

## 5. Dependency rules

**5.1 Views flow down.** Pass view data through props or a wrap in a framework descriptor when needed.

**5.2 Views are data-only.** They contain no callbacks, setters, dispatch functions, services, React elements, raw events, or framework instances.

**5.3 The receiving component owns its View contract.** Every file that names or constructs a View shape uses the View contract owned by the receiving component. It does not redeclare or structurally fake that type.

**5.4 State has one owner.** Raw setters never leave the owner. Descendants and frameworks receive typed actions or named owner callbacks. Central state-ledger declarations do not own runtime storage or state lifecycle.

**5.5 Context transports requests, not state.** Context may carry only a typed state-action dispatch or `EditorDispatch`; current state still flows through Views and props.

**5.6 Contexts are transport-only.** Exactly one `EditorDispatch` Context may be rooted at `EditorView`; state-action Contexts are owner-scoped. Context files contain context creation, a consumer hook, and its fail-fast guard—no state, reducer, View, reconciliation, or wrapper Provider component.

**5.7 State actions and commands are distinct.** Internal state transport uses `dispatch<Owner>StateAction`; the View-to-Controller command boundary uses `dispatchCommand` with `EditorCommandTransaction`. Unqualified `dispatch` is not used.

**5.8 Commands are normalized transactions.** `logic:command:derive` produces a complete `EditorCommandTransaction` or no-op. Components construct commands from the canonical command registry and must not define command shapes. Repeating the same primitive operation is represented by several commands in the transaction, not by a nested collection inside one command. Commands are sent to the Controller only through `dispatchCommand` under `connect:command:wire`.

**5.9 Raw events stay local.** DOM/framework events are normalized before passing data across the binding component boundary.

**5.10 Framework details stay local.** Framework imports and types may appear only in a Framework adapter and its explicitly local subtree, including props of framework-instantiated children. They must not escape through Shiny View contracts, command transactions, state-action or Context contracts, or non-adapter interface props. 

**5.11 Dependencies point inward.** `shinyView` may import its own modules, `shared`, React/browser APIs, and approved frameworks—never Controller, Shell, Bridge, or source-processing modules.

**5.12 Shared vocabulary lives at the narrowest owner.** Descendants may type-import an ancestor-owned state/action vocabulary but must not import ancestor implementation or current state.

**5.13 View state ledger.** `shinyView/state/editorStates.ts` defines the semantic state shapes used by the Shiny View tree. It contains type declarations and state ownership annotations only. It must not contain defaults, constructors, predicates, reducers, state actions, or consumer-specific interpretations. Consumers derive their own scenario views from canonical state; for example, selection state lists selected entity IDs, while StylePane, shortcuts, and canvas affordances interpret that selection for their own behavior.

## 6. Pattern rules

### `logic:state:*`

**6.1 State storage.** `useReducer` owns state when one transition changes multiple fields atomically or its typed dispatch is transported through Context. `useState` owns state otherwise. State owners store ledger-defined semantic states directly, not a generic aggregate editor state.

**6.2 Framework interaction state.** Shiny-owned framework interaction state belongs to the nearest Logic component; framework-internal state remains framework-owned.

### `logic:state:update`

**6.3 State transitions.** A `useState` domain represents its supported transitions through named owner callbacks. A `useReducer` domain declares owner-local actions, initial values, and reducer logic in `state.ts`; ledger-owned state shape types are imported rather than redeclared.

### `logic:state:reconcile`

**6.4 State reconciliation.** State reconciliation runs in the state owner, inline or through `useStateReconciliation.ts`, and repairs owned state after changed View props. An extracted reconciliation hook updates state through owner-provided callbacks.

### `connect:state:wire`

**6.5 State transport.** State update transport uses named owner callbacks or an owner-scoped action Context. Context is used when prop threading would obscure ownership or interaction flow. The state owner renders the raw `.Provider`.

**6.6 Action wiring.** `connect:state:wire` invokes a named owner callback or dispatches an already-derived state action.

### `logic:child:view` and `connect:child:view`

**6.7 Child View fields.** Derived child View fields are named by rendered meaning: `isResizeVisible`, not `isSoleSelection`.

### `logic:child:route`

**6.8 View routing.** Variant routing occurs in the Logic component after all hooks and uses an exhaustive switch whose branches render child interfaces. Routing helpers return neither React elements nor component types.

### `logic:action:derive` and `logic:command:derive`

**6.9 Action derivation.** State action derivation that depends on current Views, owned state, validation, or variant choice is performed by a helper that returns the action without updating state or dispatching. Extracted helpers live in `actions.ts`.

**6.10 Command derivation.** Command derivation that depends on current Views, owned state, validation, layout choice, or variant choice is performed by a helper that returns an `EditorCommandTransaction` without updating state or dispatching. View-owned layout choices are emitted as concrete editor facts. For existing source entities, layout changes are commands such as position and size changes. For create/duplicate flows where new source IDs do not yet exist, the transaction includes creation/duplication commands carrying desired layout facts; Controller assigns source identities. Extracted helpers live in `commands.ts`.

**6.11 Command boundary separation.** Commands do not mutate View-local state; state actions do not cross into the Controller command boundary. Commands must not expose source syntax, source-edit operations, Controller model types, DOM events, or framework events.

### `connect:command:wire`

**6.12 Direct command wiring.** A fixed or already-derived `EditorCommandTransaction` may be sent directly under `connect:command:wire`, including from a Presentational component.

### `connect:framework:props`

**6.13 Framework projection.** Extracted `connect:framework:props` helpers live in the adapter-local `<framework>Adapters.ts`.

### `connect:event:wire`, `connect:state:wire`, and `connect:command:wire`

**6.14 Shortcut ownership.** Keyboard shortcuts are owned by the narrowest Logic component that has the state and View context required to decide whether the shortcut is active and derive the resulting state action or `EditorCommandTransaction`. Ownership does not follow the visual control that exposes the same action or the DOM/window surface used for event registration. Shortcut handlers normalize raw keyboard events locally, keep semantic applicability checks under `logic:action:derive` or `logic:command:derive`, and wire only already-derived actions or command transactions.

**6.15 Framework transport.** Framework callbacks provide local transport when sufficient; equivalent Context is not introduced.

### `logic:*`, `render:*`, and `connect:*`

**6.16 Built-in hooks.** Built-in hooks are limited to `useState`, `useReducer`, `useEffect`, `useMemo`, and `useCallback`; `useContext` appears only inside a Context consumer hook. `useRef` and all other built-in hooks are prohibited

**6.17 Framework hooks.** Approved framework hooks appear only under Rule 5.11.

**6.18 Custom hooks.** Shiny-authored custom hooks are limited to:  
- `use<Owner>Interactions` in `useInteractions.ts`;  
- `useStateReconciliation` in `useStateReconciliation.ts`;  
- one Context consumer hook per Context module.  
No other custom hooks are defined.

## 7. Annotation rules

### Component file header

**7.1 Component header.** Every React component file starts with one of these exact shapes.

Logic:

```ts
/**
 * @role [L] Logic
 * @logic <decisions in scope of current component>.
 * @state <state owned by this component> - this line is omitted only when the component owns no state
 */
```

Presentational:

```ts
/**
 * @role [P] Presentational
 * @presents <interface or surface>.
 */
```

Logic and Presentational:

```ts
/**
 * @role [L]+[P] Logic and Presentational
 * @logic <decisions in scope of current component>.
 * @state <state owned by this component> - this line is omitted only when the component owns no state
 * @presents <interface or surface>.
 */
```

Framework adapter:

```ts
/**
 * @role [A] Framework adapter
 * @adapts <transformations made to adapt a framework>.
 */
```

**7.2 Support-file header.** Non-component support files use:

```ts
/**
 * @fileoverview <owner and single responsibility>.
 * <what responsibility it supports and why it is extracted.>
 */
```

### Inline job annotations  
  
**7.3 Annotation form.** Every annotated job region uses:  
  
```ts  
// @job logic:state:initialize
```

The same form applies to component-body code, hooks, and extracted helpers.

**7.4 Region scope.** A job annotation marks a region, not an individual declaration. It covers following executable code in the current lexical scope until the next job annotation, the component’s rendered `return`, or the end of the scope. Adjacent declarations with the same job, including callback declarations, share one annotation; repeating the annotation within that region is prohibited. Nested scopes inherit the active job unless they declare another.

**7.5 Valid tags.** Job annotations use only tags defined in section 2.1.

**7.6 Supporting decisions.** Validation, guards, and invariant checks use the same job as the decision or value they support. No separate validation job exists.

**7.7 Missing classification.** Code that fits no existing job is not assigned an approximate tag. A missing classification must be flagged and not applied silently.

**7.8 Extracted helpers.** An extracted helper is annotated with the job it performs. Its call site is annotated as part of a job region in the caller described by rule 7.4.

**7.9 Mixed jobs.** A region has one governing job. Code producing distinct architectural outcomes is separated into regions or helpers; supporting operations remain under the job of the outcome they serve.

**7.10 Exempt code.** Imports, types and interfaces, static module constants, prop destructuring, braces, dependency arrays, component rendered return bodies, direct JSX prop attachment, and direct fixed JSX wiring such as `onClick={() => onSelect(view.id)}` are not annotated.

**7.11 JSX prop logic.** JSX props contain only trivial adaptation of already-decided values or direct fixed wiring. Shiny/editor decisions are derived in an annotated `logic:*` region before `return`.

**7.12 Inline callbacks.** Inline JSX callbacks contain only direct fixed wiring. A callback that normalizes an event, transforms data, validates, branches, or derives a state action or command transaction is extracted and annotated.
