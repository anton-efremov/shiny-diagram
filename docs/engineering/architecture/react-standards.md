> **Implementation state:** Aspirational   
> **Document state:** Maintained
> **Scope:** `webview/src/shinyView/**`  
> **Audience:** Coding agents  
> **Last reviewed:** 2026-06-28
> **Goal** Must-follow rules of organization of code, dependencies and implementation patterns of a React component in Shiny View React component tree

# 0. About the file

### 0.1 Navigation

- [0. About the file](#0-about-the-file)
	- [0.1 Navigation](#01-navigation)
	- [0.2 Reference discipline](#02-reference-discipline)
- [1. React component types and roles](#1-react-component-types-and-roles)
- [2. Import rules](#2-import-rules)
	- [2.1 Allowed import sources](#21-allowed-import-sources)
	- [2.2 Forbidden import sources](#22-forbidden-import-sources)
- [3. Component receives](#3-component-receives)
	- [3.1 General receive rules](#31-general-receive-rules)
	- [3.2 Prop categories](#32-prop-categories)
	- [3.3 Role prop contracts](#33-role-prop-contracts)
- [4. Component implements](#4-component-implements)
	- [4.1 State creation](#41-state-creation)
	- [4.2 State initialization](#42-state-initialization)
	- [4.3 State reconciliation](#43-state-reconciliation)
	- [4.4 View and State slice props derivation](#44-view-and-state-slice-props-derivation)
	- [4.5 UI props derivation](#45-ui-props-derivation)
	- [4.6 Event handler props derivation](#46-event-handler-props-derivation)
	- [4.7 Registering keystroke listener](#47-registering-keystroke-listener)
	- [4.8 Implementing interaction through state update](#48-implementing-interaction-through-state-update)
	- [4.9 Implementing interaction through command transaction](#49-implementing-interaction-through-command-transaction)
	- [4.10 Child component routing](#410-child-component-routing)
	- [4.11 Rendering](#411-rendering)
	- [4.12 Framework adaptation](#412-framework-adaptation)
- [5. Component composition](#5-component-composition)
	- [5.1 General rules](#51-general-rules)
	- [5.2 `<Component>.tsx`](#52-componenttsx)
	- [5.3 `state.ts`](#53-statets)
	- [5.4 `childProps.ts`](#54-childpropsts)
	- [5.5 `useInteractions.ts`](#55-useinteractionsts)
	- [5.6 `transactions.ts`](#56-transactionsts)
	- [5.7 `useStateReconciliation.ts`](#57-usestatereconciliationts)
	- [5.8 `<Component>.module.css`](#58-componentmodulecss)
	- [5.9 `frameworkProps.ts`](#59-frameworkpropsts)
### 0.2 Reference discipline

1. Referable numbered items use `<section-id>-<item-number>`, e.g. `4.6-3`, `5.2-7`.
2. Pattern and area IDs **may** be used alone only as structural links, especially between Chapter 4 patterns and Chapter 5 file areas.
3. Domain vocabulary **must** be written by name, not by ID: Logic component `[L]`, Presentational component `[P]`, `view`, State slice, Event handler, UI prop.
4. In prose, review comments, migration notes, and execution planning, a pattern **must** be referred to by ID plus name:
	- `pattern 4.6-3 — derive all event handlers in useInteractions() hook`
	- `pattern 4.9-1 — derive transaction in transactions.ts and dispatch through useInteractions.ts`
5. When item order changes, affected references **must** be updated in the same edit.

# 1. React component types and roles

There are three base React component types in ShinyView and only one combined component — Logic with Pure Presentational — and only under the condition stated below. Thus, every React component in ShinyView is labeled as one of four legal role labels: `[L]`, `[P]`, `[A]`, `[L]+[P]`
### Pure presentational `[P]`

Owns a visual surface. Turns already-decided values into rendered output.

- **May** render DOM and UI-library structure, apply styles, compose child React components and route them based on decisions passed through props.
- **May** forward already-derived data, and invoke already-provided handlers.
- **May** own local view state — a presentation-only state such as a controlled input's draft value, hover, or open/closed flags — that no other component reads and that has no editor consequence. 
- **Must not** own ledger state — the semantic editor state declared in the state ledger (selection, placement, layout) that other components reconcile against.
- **Must not** make any editor decision — deriving a view, a state action, a command transaction, or decide on a routing choice (routing based on decisions passed through props are allowed).
### Framework adapter `[A]`

Binds one approved third-party framework component to ShinyView's standardized prop contract.

- **Must** receive props in the standardized form a component receives, and derive from them the props the framework component requires, including its event-handler props.
- **Must** import the framework component or utility only from an approved third-party library.
- **May** compose children, including the framework component and child React components.
- **May** forward already-derived data, and already-provided handlers.
- **Must not** own ShinyView state, make editor decisions, or own a ShinyView visual surface.
- **Must not** combine with the presentational or logic role; an adapter is **always** a pure adapter.
### Logic component `[L]`

Owns component state and/or editor decisions, and composes its children.

- **Must** own at least one of: component state, or an editor decision — a derived child view, a state action, a command transaction, or a routing choice.
- **Must** delegate any third-party framework binding to a Framework adapter child rather than binding it directly.
- **May** also take the presentational role, but **only** when one of the two roles is minor. When both roles need substantial code, the presentational part **must** be factored out into its own Pure

# 2. Import rules

### 2.1 Allowed import sources

1. `webview/src/shared` — dependency-free primitives: branded diagram identities and their constructors, spatial primitives, UML class-diagram notation, visual styling vocabulary, and editor-supported node kinds
	- these primitives **must not** be redefined anywhere in code
	- a new primitive **may** be added if it has potential reuse and fits the definition of a shared primitive

2. `webview/src/shinyView/views/schema.ts` — the authoritative view render tree: one nested tree of immutable view types, carrying facts about the diagram itself — its elements and their position, size, and style — never facts about the editing session, such as selection, placement, or current drag position.
	- the **only** declaration of view shapes
	- used for constructing a `view` prop type by a component by slicing corresponding source view type

3. `webview/src/shinyView/state/editorStates.ts` — the state ledger: a flat list of editor state shapes (selection, placement, transient element position), each annotated with its owning component
	- the **only** declaration of editor state shapes
	- used to construct a component's State slice prop type by slicing the corresponding source state type
	- type-**only**: contains state shapes, never runtime state
	- **must not** include local view state — state no other component reads and with no editor consequence; that type is declared in its owner component, not here

4. `webview/src/shinyView/commands/editorCommands.ts` — the canonical command registry defining (a) primitive editor-domain command shapes, each encapsulating an atom of user intent, and (b) the `EditorCommandTransaction` type combining those primitives to communicate a complex user intent to the Controller.
	- **the only** source of command shapes
	- command and transaction types are **never** defined locally
	- a primitive command **may** be added **only** if it cannot be expressed as a combination of existing primitives

5. `webview/src/shinyView/ui` — shared ShinyView presentational primitives: reusable presentational components with no editor state or decisions.
	- the **only** source of cross-component shared visual components

6. `webview/src/shinyView/config/editorUiConfig.ts` — static UI constants (fixed offsets, sizes, timings).
	- UI constants **must** be defined here and read from here, **never** hard-coded at the use site.

7. `webview/src/shinyView/EditorView/contexts` — exposes `useDispatchTransaction`, the consumer hook for the single `EditorDispatch` channel carrying command transactions to the Controller
	- **the only** dispatch hook; **the only** non-prop transport in ShinyView

8. **own children** — components it exclusively owns, each nested one level inside its folder as `ChildName/ChildName.tsx`
	- **only** the child component export; **never** its types, support files, or any other folder internals

9. **approved third-party framework libraries** — the framework component and its utilities
	- **must only** be imported within a Framework adapter

10. **React and browser APIs** — rendering, lifecycle, focus, measurement, event registration.

11. **own support files** — `state.ts`, `transactions.ts`, `useInteractions.ts`, `*.module.css`, `childProps.ts`, `useStateReconciliation.ts`, `frameworkProps.ts` sitting flat beside the component file
	- a component imports **only** its own support files, **never** another component's.

### 2.2 Forbidden import sources

1. any layer above the `View` layer — `Controller`, `Shell`, `Bridge` — dependencies between layers point strictly inward
2. another component's internal support files
3. a sibling, parent, or any non-owned component — shared components are reached only through `webview/src/shinyView/ui`.
4. a third-party framework library, when the component is not a Framework adapter `[A]`.

# 3. Component receives

### 3.1 General receive rules

1. A React component **must** receive **only** the minimum props its function requires.
2. Every prop **must** belong to one of the prop categories in 3.2. A React component **must not** receive any other prop shape.
3. A React component **must** follow the role prop contract in 3.3 for its role.

### 3.2 Prop categories

1. **`view`** — a slice of the view render tree: the diagram facts this React component renders.
	- **must** be a schema shape — a node, a `Pick` of one, or an array of nodes; **never** a redefined or new shape.
	- Editor state **may** drive *which* elements the slice contains, e.g. only selected classes, but **must not** appear anywhere in the `view` type.
	- The schema node chosen for composing **must** match the prop meaning: a collection takes an array of the node, e.g. `ClassView[]`; a single element takes that node or a `Pick` of it.

2. **State slice** — a slice of editor state the parent owns or holds: the session state this React component reads.
	- **must** be typed as a ledger shape or a `Pick` of one.
	- The owner passes a slice of state it owns; a non-owner passes through the slice it received.
	- Only the owner mutates the state. Descendants receive it read-only.
	- A whole ledger shape is named after the state, e.g. `selectionState`; a slice is named for its meaning, e.g. `selectedClassIds`.

3. **Event handler** — a callback the parent provides for this React component to invoke: the channel by which it requests a change.
	- **must** be a function prop.
	- **may** take normalized data supplied by the React component, e.g. `onCommit(value)`.
	- The React component **must** only invoke the handler; it **must not** decide what the handler does.
	- The parent handler sends a transaction, requests an owned-state change, or propagates the request further up.
	- **must** be named `on<Event>`, e.g. `onSelectionChange`, `onCommit`.

4. **UI prop** — an already-decided render value that is not a schema slice or ledger slice.
	- **must** be ready to render when received.
	- **must** be computed by the parent that owns the decision; the receiving `[P]` surface renders it and **must not** compute it itself.
	- **must** be a primitive or shared-vocabulary shape.
	- **must** be named for what it controls in the output, not the condition that set it, e.g. `isResizeVisible`, not `isSoleSelection`.
	- **must not** contain editor state, although it **may** be derived from editor state. Anything referencing selection, placement, or session state is a State slice, not a UI prop.

### 3.3 Role prop contracts

1. **Logic component `[L]`**
	- **may** receive only `view`, State slice, and Event handler props.
	- **must not** receive UI props.

2. **Presentational component `[P]`**
	- **may** receive `view`, State slice, and Event handler props.
	- **may** receive UI props.
	- **must not** compute UI props from editor state; it receives render values already decided.

3. **Framework adapter `[A]`**
	- **may** receive `view`, State slice, Event handler, and UI props.
	- **must not** receive framework-shaped props.
	- **must** derive framework-shaped props internally from the standardized props it receives.

4. **Mixed Logic and Presentational component `[L]+[P]`**
	- **may** receive `view`, State slice, Event handler, and UI props.
	- **must** use `view`, State slice, and Event handler props under the Logic role rules.
	- **must** use UI props only as already-decided render input for its minor Presentational surface.
# 4. Component implements

### 4.1 State creation

Creating the runtime state slot owned by the current component.

Owned state is runtime state. A state shape **may** come from the state ledger, or it **may** be local view state owned only by one component. The raw state setter **must** stay inside the owning component and its own support files. Children receive state as sliced props and request changes through semantic event handlers.

**Pattern allowed:**

1. **`useState` in component file**
    - create the state slot in the owning component. **Location:** `<Component>.tsx`
    - raw setter **must not** be passed to children
    - **naming:** 
	    - state binding is named by the state domain + `State` suffix, e.g. `selectionState`, `nodePlacementState`
	    - raw setter keeps the React setter form, e.g. `setSelectionState`
	    
### 4.2 State initialization

Producing the initial value used when owned state is created. State owner **must** produce an initial value of the owned state shape. The state ledger defines semantic state types only and **must not** contain runtime defaults or constructors.

**Patterns allowed:**

1. **inline value in `useState`**
    - pass the initial value directly to `useState`. **Location:** `<Component>.tsx`
    - **when:** the value is small, obvious, and used for local view state or simple ledger-backed state
2. **initializer function in `state.ts`**
    - export a pure `toInitial<StateName>(...)` function. Return type: ledger-backed state returns the ledger shape, local view state returns the locally declared shape. **Location:** `state.ts`
    - import initializer function into the owning component and pass its result to `useState`. **Location:** `<Component>.tsx`
    - **naming:** initializer function is named `toInitial<StateName>(...)`, e.g. `toInitialSelectionState(...)`, `toInitialNodePlacementState(...)`
    - **when:** ledger-backed state initialization needs construction, shared defaults, view-derived setup, or independently-tested vocabulary; local state needs complex initializer function

### 4.3 State reconciliation

Repairing owned state after the incoming `view` prop changes. It keeps owned state valid against the latest canonical view. It **must** run in the state owner. It **must not** issue Controller commands, route children, or derive child props.

**Pattern allowed:**

1. **hook in `useStateReconciliation.ts`**

	- export a single `useStateReconciliation(...)` hook that uses `useEffect` and possibly private helpers to repair owned state after relevant `view` inputs change. **Location:** `useStateReconciliation.ts`
	- call the hook unconditionally after state creation. **Location:** `<Component>.tsx`
	- **naming:** hook is named `useStateReconciliation(...)`

### 4.4 View and State slice props derivation

A child's `view` or state prop is produced by **slicing** what the parent holds. A slice **only** narrows — field access, array selection, or a membership filter that preserves the schema/ledger shape; it adds, renames, or wraps **nothing**.

**Patterns allowed:**

1. **inline slice** 
	- write the slice directly at the prop, e.g. `view={view.diagram}`, `view={view.classes}`. **Location:** `<Component>.tsx`
	- **when:** the slice is a single field access, array field, or pass-through

2. **slice binding derived in component file**
	- assign the slice to a binding named for what it carries. **Location:** `<Component>.tsx`
	- pass the binding to the prop. **Location:** `<Component>.tsx`
	- **naming:** 
		- the binding is named for its contents (e.g. `selectedClasses`)
		- the prop it feeds keeps its role name (`view` and `nameState` for state prop)
	- **when:** the slice value needs an expression — a filter or combined narrowing expression — too large or reused to read inline

3. **slice builder in `childProps.ts` passed inline**
	- export a pure function that returns the slice. Return type is a schema/ledger shape, **not** imported from a child. **Location:** `childProps.ts`
	- pass the function call directly to the prop. **Location:** `<Component>.tsx`
	- **naming:** slice builder is named for the slice it returns with prefix `to`, e.g. `toSelectedClasses(...)`, `toSelectedClassIds(...)`
	- **when:** the slice needs a substantial or independently-tested expression, justifying extraction from the component body

### 4.5 UI props derivation

Deriving an already-decided render value for a Presentational \[P] child.

A UI prop is produced by **computing** a rendered value from the parent's view props, internal state props, or owned state. It **must** be ready to render when received by the \[P] child; the child renders it and does not modify it further

**Patterns allowed:**

1. **inline primitive UI prop**
    - pass a literal or already-decided primitive directly at the prop, e.g. `label="Delete class"`, `tone="danger"`. **Location:** `<Component>.tsx`
    - **when:** the value is static, obvious, and not derived from editor state

2. **UI prop binding derived in component file**
    - assign the UI value to a binding named for what it controls in the rendered output. **Location:** `<Component>.tsx`
    - pass the binding to the prop. **Location:** `<Component>.tsx`
    - **naming:** the binding is named by rendered meaning, not by the condition that produced it, e.g. `isResizeVisible`, not `isSoleSelection`
    - **when:** the value depends on view props, internal state props, owned state, or a small branch

3. **single UI prop builder in `childProps.ts`**
    - export a pure function that returns *single UI-prop value*. Return type is constructed right above export function and **not** imported from a child. **Location:** `childProps.ts`
    - pass the function call directly to the child prop. **Location:** `<Component>.tsx`
    - **naming:** prop builder is named for the prop value it returns with prefix `to`, e.g. `toDeleteLabel(...)`, `toPickerValue(...)`, `toIsResizeVisible(...)`
    - **when:** only one derived UI prop is needed and derivation needs a substantial or independently-tested expression, justifying extraction from the component body
    
4. **UI prop object builder in `childProps.ts`**
    - export a pure function that returns *a plain UI prop object* (only UI props, other types of props **must not** be bundled). Return type is constructed right above export function and **not** imported from a child. **Location:** `childProps.ts`
    - assign the result of a function call to a named binding. **Location:** `<Component>.tsx`
    - pass the named binding to the child by spreading it. **Location:** `<Component>.tsx`
    - **naming:** 
	    - if child has only UI props: builder function is named `to<ChildName>Props(...)`; binding is named `<childName>Props`, e.g. `classSelectionSummaryProps`, `classStyleControlsProps`
	    - if child has multiple UI props + other props: builder function is named `to<ChildName>UIProps(...)`; binding is named `<childName>UIProps`
    - **when:** multiple UI props are derived and derivation needs a substantial or independently-tested expression, justifying extraction from the component body

### 4.6 Event handler props derivation

Providing a child the callback by which it requests a change. The child **must** invoke the handler with normalized data; the parent decides whether that request becomes a command, an owned-state change, or another request propagated upward.

**Patterns allowed:**

1. **inline pass-through handler**
    - pass an already-received handler directly to the child prop. **Location:** `<Component>.tsx`
    - **naming**: remains the same as received
    - **when:** the parent adds no decision, normalization, command dispatch, state-change behavior, or argument adaptation
2. **event handler binding defined in component file**
    - assign the handler to a binding named by the event the child reports. **Location:** `<Component>.tsx`
    - pass the binding to the child prop. **Location:** `<Component>.tsx`
    - **naming:** handler is named `on<Event>`, e.g. `onPlacementCommit`, `onClassResize`, `onSelectionChange`; handler **must not** be named by its state effect, e.g. `setPlacementState`, `clearSelection`
    - **when:** the handler performs a small local argument adaptation or delegates to an owner callback without needing a separate interaction pipeline
3. **derive all event handlers in `useInteractions()` hook**
    - export a single `useInteractions(...)` hook that returns **all required** event handlers for the component's children with the **exception of** pass-through handlers . **Location:** `useInteractions.ts`
    - call the hook and assign the result to named handler bindings. **Location:** `<Component>.tsx`
    - pass the returned handlers to child props. **Location:** `<Component>.tsx`
    - Once a component uses `useInteractions()`, all non-pass-through handlers must live there
    - **naming:** 
	    - hook is named `useInteractions(...)`
	    - return type of a hook is named `Interactions`
	    - returned handlers are named `on<Event>`, e.g. `onFillColorChange`, `onDuplicate`
    - **when:** a handler issues a Controller command or event-handler code is too large to keep the component body readable.

### 4.7 Registering keystroke listener

Registering a browser-level keyboard listener for a semantic action owned by the current component. Keystrokes **must** be registered in the interaction layer of the component that owns the same semantic action.

**Pattern allowed:**

1. **keystroke listener registered in component file**
    - register and clean up the keystroke listener with `useEffect`. **Location:** `<Component>.tsx`
    - implement the browser listener inside the effect and call the semantic `on<Event>` handler it triggers
    - browser-event checks, e.g. key matching, modifier matching, ignored target checks, and `preventDefault()`, stay in the browser listener
    - semantic action logic, state update, and command transaction dispatch stay in the semantic handler implemented by patterns in  4.6
    - **naming:**
	    - browser listener is named by the browser event, e.g. `handleKeyDown`
	    - semantic handler keeps `on<Event>` naming, e.g. `onClassDelete`
    - **when:** a keystroke triggers a semantic action owned by this React component
### 4.8 Implementing interaction through state update

Changing owned state after a semantic request from the component itself or one of its children.

State updates happen in the state owner. Children report events through semantic handlers; the owner decides how those events change state. Raw setters, state-action dispatch, and state-action Context **must not** be used as child interfaces.

**Patterns allowed:**

1. **update state inside handler defined in component file**
    - execute state update inside `on<Event>` handler, implemented by the pattern 4.6-2. **Location:** `<Component>.tsx`
    - **naming:** defined as a part of 4.6-2 pattern
    - **when:** the state update is small and readable inside the owner component
    
2. **update state inside `useInteractions.ts`**
    - execute state update inside `useInteractions()` hook (with optional private helpers), implemented by the pattern 4.6-3. **Location:** `useInteractions.ts` 
    - **naming:** defined as a part of 4.6-3 pattern
    - **when:** state-update handler code is too large, too numerous, or shared with other interaction wiring

### 4.9 Implementing interaction through command transaction

Emitting a command transaction to a controller from semantic intent event handlers.

**Patterns allowed:**

1. **derive transaction in `transactions.ts` and dispatch through `useInteractions.ts`**
    - construct pure transaction builder function `to<SemanticIntent>Transaction(...)`, that imports command shapes from central command registry `editorCommands.ts` and combines one or more commands into a transaction to fulfill semantic intent of event handler. **Location:** `transactions.ts`
    - call transaction builder from event handler implementation and dispatch the result through `useDispatchTransaction`. **Location:** `useInteractions.ts`. Event handlers, requiring dispatching transactions **must** be defined inside `useInteractions.ts` (pattern 4.6-3) and never in main components function; they may also update owned state there
    - **naming:** transaction builder is named `to<SemanticIntent>Transaction(...)`, e.g. `toClassDeleteTransaction(...)`, `toFillColorSetTransaction(...)`

### 4.10 Child component routing

Choosing which child interface renders, from a discriminated view or a derived scenario.

**Patterns allowed:**

1. **inline binary select**
	- select the child interface inline with a ternary over a derived condition. **Location:** `<Component>.tsx`
	- **when:** exactly two branches
2. **exhaustive switch + named binding**
	- assign the selected interface to a binding via an exhaustive `switch` over the view discriminant. **Location:** `<Component>.tsx`
	- render the binding. **Location:** `<Component>.tsx`
	- **when:** more than two branches, or a discriminated view (e.g. `view.status`)

### 4.11 Rendering

No fixed patterns yet

### 4.12 Framework adaptation

No fixed patterns yet

## 5. Component composition

### 5.1 General rules

- A component folder **must** contain **only** files from the closed set detailed in this chapter, fixed by the component's role and the patterns it applies. 
- Every file **must** open with one annotation block — following template given by this chapter for every file type. If specific annotation is not relevant for given type, it **must** be omitted.
- A component body **must** be split into annotated blocks, one per job it executes, each opened by a comment following templates given by this chapter. 
- Templates for inline annotations are given inside quotation marks in a line starting with `Annotations:` (`── area ──` header is not part of the annotation and **must not** be included). There **must** be an empty line between new block annotation and previous block of code (including function signature)
- Blocks **must** be written strictly in described order. Unused blocks are **omitted**.
- Functions named in patterns (the component, a `to<X>` builder, a `use<X>` hook) **may** carve out **private helpers** (functions described in patterns, e.g. `useInteractions` **are not** private helpers and the following rules don't apply to them):
    - a helper is **pure**; the **only** stateful helpers are the hooks `useInteractions` and `useStateReconciliation`;
    - carve out **only** when the expression branches, iterates, repeats, or merits isolated testing — otherwise keep it inline;
    - a private helper stays in its caller's file in the dedicated annotation block;
    - private helpers are **never** exported.
- Helpers are layered **after** their caller — entry first, the helpers it calls next, deeper layers after — and a helper **must not** sit above its caller. This governs every file. Private helper-only types **must** be declared immediately above the helper or helper layer that uses them.

### 5.2 `<Component>.tsx`

**Component types:** all 

**Patterns:** all

**Areas**:
1. file annotation block
2. import area
3. type area
4. component declaration
5. state creation area
6. state reconciliation area
7. child props derivation area
8. interactions area
9. keystroke listener registration area
10. routing area
11. render return area

**Structure:**
```ts
/**
 * @role     [L] | [P] | [A] | [L]+[P]
 * @logic    <decisions this component makes - [L] and [L]+[P] types only>
 * @state    <state this component owns - state owners only>
 * @presents <surface this component renders - [L], [P] and [L]+[P] types only>
 * @adapts   <framework binding this component performs - [A] type only>
 */

/**
 * ── import area ──
 * Sources fixed by Chapter 2.
 * No annotation
 */

/** ── type area ──
 * This component's own `Props` type, named <Component>Props
 * Any local payload type (e.g. normalized event data).
 * No annotation
 */

export default function <Component>({ ... }: <Component>Props): ReactElement {

/** ── state creation area ──
 * Patterns: 4.1-1
 * Annotation: "State: <data stored in the state>"
 */

/** ── state reconciliation area ──
 * Patterns: 4.3-1
 * Annotation: "State reconciliation: <what kind of repair is implemented>"
 */

/** ── child props derivation area ──
 * Patterns: 4.4-2, 4.4-3, 4.5-2, 4.5-3, 4.5-4
 * Annotation: "Child props derivation: <any non-obvious transformation explained>"
 */

/** ── interactions area ──
 * Patterns: 4.6-2, 4.6-3, 4.8-1
 * Annotation: "Event handler derivation: <any non-obvious derrivation explained>"
 */
 
 /** ── keystroke listener registration area ──
 * Patterns: 4.7-1
 * Annotation: "Keystroke listenning: <name of a keystroke>"
 */

/** ── routing area ──
 * Patterns: 4.10-2
 * Annotation: "Children routing decision"
 */

  return ( ... );
}
```


### 5.3 `state.ts`

**Component types:** state owners only — `[L]`, `[L]+[P]`, and `[P]` only for owner-local view state. 

**Patterns:** 4.2-2

**Areas**:
1. file annotation block
2. import area
3. type area
4. state initializer area
5. private helper area

**Structure:**
```ts
/**
 * @state <state slot produced and inputs that shape it>
 */

/**
 * ── import area ──
 * Sources fixed by Chapter 2.
 * No annotation
 */

/** ── type area ──  
* Boundary types owned by this file:  
* - exported function return object types, when needed;  
* - exported function input payload types, when the parameter list would otherwise become unreadable;  
* - local state shapes owned by this component and not declared in the state ledger.   
* No annotation.  
*/

/** ── state initializer area ──
 * Patterns: 4.2-2
 * Annotation: "Initial state: <state slot produced and inputs that shape it>"
 */
export function toInitial<StateName>(...): <StateName> {
  ...
}

/** ── private helper area ──  
* No annotation 
*/  
type <HelperInput> = {  
...  
};  
  
function <helperName>(input: <HelperInput>): ... {  
...  
}
```

### 5.4 `childProps.ts`

**Component types:** `[L]`, `[L]+[P]`; `[P]` only for owner-local view-state UI derivation.

**Patterns:** 4.4-3, 4.5-3, 4.5-4

**Areas**:
1. file annotation block
2. import area
3. type area
4. view slice area
5. state slice area
6. single UI prop area
7. UI prop object area
8. private helper area

**Structure:**

```ts
/**
 * @logic <child prop derivation this file performs>
 */

/**
 * ── import area ──
 * Sources fixed by Chapter 2.
 * No annotation
 */

/** ── type area ──
 * Boundary types owned by this file:
 * - exported function return object types for UI prop bundles;
 * - exported function input payload types, when the parameter list would otherwise become unreadable.
 * No annotation.
 */

/** ── view slice area ──
 * Patterns: 4.4-3
 * Annotation: "Child view props derivation"
 */
export function to<SliceName>(...): <SchemaOrLedgerSlice> {
  ...
}

/** ── state slice area ──
 * Patterns: 4.4-3
 * Annotation: "Child state props derivation"
 */
export function to<SliceName>(...): <SchemaOrLedgerSlice> {
  ...
}

/** ── single UI prop area ──
 * Patterns: 4.5-3
 * Annotation: "Child UI props derivation"
 */
export function to<UIPropName>(...): <UIPropType> {
  ...
}

/** ── UI prop object area ──
 * Patterns: 4.5-4
 * Annotation: "Child UI props derivation"
 */
export function to<ChildName>UIProps(...): <ChildName>UIProps {
  ...
}

/** ── private helper area ──
 * No annotation
 */
type <HelperInput> = {
  ...
};

function <helperName>(input: <HelperInput>): ... {
  ...
}
```

### 5.5 `useInteractions.ts`

**Component types:** `[L]`, `[L]+[P]`; `[P]` only for owner-local view-state interaction wiring.

**Patterns:** 4.6-3, 4.8-2, 4.9-1

**Areas**:
1. file annotation block
2. import area
3. type area
4. interaction hook area
5. private helper area

**Structure:**

```ts
/**
 * @logic <semantic interaction decisions this file performs>
 * @state <owned state this file updates - state-update interactions only>
 */

/**
 * ── import area ──
 * Sources fixed by Chapter 2.
 * No annotation
 */

/** ── type area ──
 * Boundary types owned by this file:
 * - `Interactions`, the object returned by `useInteractions`;
 * - hook input object types, when the parameter list would otherwise become unreadable;
 * - normalized interaction payload types produced inside this file.
 * No annotation.
 */
type Interactions = {
  on<Event>: (...args: ...) => void;
};

/** ── interaction hook area ──
 * Patterns: 4.6-3, 4.8-2, 4.9-1
 * No annotation.
 */
export function useInteractions(...): Interactions {
  ...
}

/** ── private helper area ──
 * No annotation
 */
type <HelperInput> = {
  ...
};

function <helperName>(input: <HelperInput>): ... {
  ...
}
```

### 5.6 `transactions.ts`

**Component types:** `[L]`, `[L]+[P]`

**Patterns:** 4.9-1

**Areas**:
1. file annotation block
2. import area
3. type area
4. transaction builder area
5. private helper area

**Structure:**

```ts
/**
 * @logic <command transaction derivation this file performs>
 */

/**
 * ── import area ──
 * Sources fixed by Chapter 2.
 * No annotation
 */

/** ── type area ──
 * Boundary types owned by this file:
 * - exported function input payload types, when the parameter list would otherwise become unreadable;
 * - exported function return object types, when transaction construction needs a named local return shape.
 * No annotation.
 */

/** ── transaction builder area ──
 * Patterns: 4.9-1
 * No annotation
 */
export function to<SemanticIntent>Transaction(...): EditorCommandTransaction {
  ...
}

/** ── private helper area ──
 * No annotation
 */
type <HelperInput> = {
  ...
};

function <helperName>(input: <HelperInput>): ... {
  ...
}
```

### 5.7 `useStateReconciliation.ts`

**Component types:** state owners only — `[L]`, `[L]+[P]`, and `[P]` only for owner-local view state.

**Patterns:** 4.3-1

**Areas**:
1. file annotation block
2. import area
3. type area
4. state reconciliation hook area
5. private helper area

**Structure:**

```ts
/**
 * @state <owned state repaired and canonical input it reconciles against>
 */

/**
 * ── import area ──
 * Sources fixed by Chapter 2.
 * No annotation
 */

/** ── type area ──
 * Boundary types owned by this file:
 * - hook input object types, when the parameter list would otherwise become unreadable;
 * - local repair result types, when reconciliation calculates an intermediate repair object.
 * No annotation
 */

/** ── state reconciliation hook area ──
 * Patterns: 4.3-1
 * No annotation
 */
export function useStateReconciliation(...): void {
  ...
}

/** ── private helper area ──
 * No annotation
 */
type <HelperInput> = {
  ...
};

function <helperName>(input: <HelperInput>): ... {
  ...
}
```

### 5.8 `<Component>.module.css`

**Component types:** `[P]`, `[L]+[P]`; `[A]` only for framework-mounting classes required by the adapter.

**Patterns:** 4.11

### 5.9 `frameworkProps.ts`

**Component types:** `[A]` only

**Patterns:** 4.12
