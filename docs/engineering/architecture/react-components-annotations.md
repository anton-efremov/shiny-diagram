# React component roles and jobs taxonomy

React component classification is based on **product-logic ownership**, not React mechanics. Rendering UI, applying styles, binding events, owning local state, adapting framework APIs, or dispatching an already-determined action/command do not by themselves make a component logical.

A component role describes the responsibility of the React boundary. Job tags describe what a specific file or code block is doing inside that boundary.

## Roles

### `[P] Presentational`

A presentational component contains no product logic.

It may perform:

* `render:*` — visual output.
* `adapt:*` — mechanical transformation between equivalent UI/framework shapes.
* `wire:*` — static connection to an already-determined effect.

It must not perform:

* `logic:*`
* `coordinate:*`

### `[L+P] Logic plus presentational`

A logic-plus-presentational component contains product logic for its own boundary or subtree. It may also contain presentation, adaptation, wiring, and local state.

It may perform:

* `render:*` — visual output.
* `adapt:*` — mechanical transformation between equivalent UI/framework shapes.
* `wire:*` — static connection to an already-determined effect.
* `logic:*` — product logic.

It must perform at least one:

* `logic:*`

It must not perform:

* `coordinate:*`

### `[H+P] Hub plus presentational`

A hub component owns cross-branch coordination. It is the lowest common owner for state, actions, or view derivation shared by independent child branches.

It may perform:

* `render:*` — visual output.
* `adapt:*` — mechanical transformation between equivalent UI/framework shapes.
* `wire:*` — static connection to an already-determined effect.
* `logic:*` — product logic.
* `coordinate:*` — cross-branch coordination.

It must perform at least one:

* `coordinate:*`

## Job namespaces

### `render:*`

* `render:ui` — JSX structure, native elements, shared UI components, or framework visual elements.
* `render:style` — CSS modules, class names, inline style variables, and visual state classes.
* `render:layout` — structural layout markup.
* `render:a11y` — accessibility attributes and keyboard/focus-facing markup.

### `adapt:*`

* `adapt:slice-view` — pass an existing child view branch unchanged.
* `adapt:framework-props` — project view data into framework descriptors or props.
* `adapt:raw-event` — convert DOM/browser/React/framework events into typed values or actions.
* `adapt:local-state` — own or update mechanical local UI state.
* `adapt:dom-measurement` — read or translate element size, position, scroll, or viewport data.
* `adapt:presentation-shape` — convert between equivalent presentation formats without product interpretation.

### `wire:*`

* `wire:callback` — invoke a callback directly.
* `wire:action` — dispatch a fixed typed UI action.
* `wire:command` — dispatch a fixed editor command.

### `logic:*`

* `logic:state` — productful state transition.
* `logic:command` — command/no-op choice or command payload derivation.
* `logic:child-view` — construction of a child view contract.
* `logic:ui-prop` — derivation of a local render-facing prop or flag from product state.
* `logic:validation` — action acceptance, rejection, or validity checking.

### `coordinate:*`

* `coordinate:shared-state` — own UI state consumed by independent child branches.
* `coordinate:action-context` — provide a scoped action-dispatch context.
* `coordinate:sibling-action` — route or interpret actions from sibling branches.
* `coordinate:branch-views` — derive view inputs for independent child branches.
* `coordinate:external-dispatch` — bridge hub-level decisions to the outward editor dispatch channel.

## File header annotations

Every React component file under `EditorView` starts with a file header that declares the component’s architectural identity.

The header must include:

* `@role` — `[P]`, `[L+P]`, or `[H+P]`.
* `@presents` — the UI surface, layout, or framework surface presented by the component, when applicable.
* `@logic` — the product logic owned by the component, when applicable.
* `@coordinates` — the cross-branch coordination owned by the component, when applicable.

The header describes the component boundary, not every implementation detail inside the file.

Good header example:

```ts
/**
 * @role [L+P] Logic plus presentational
 * @logic Resize UI visibility for class boxes.
 * @presents React Flow class-box node.
 */
export default function ClassBox(...) {
  ...
}
```

Good hub header example:

```ts
/**
 * @role [H+P] Hub plus presentational
 * @coordinates Selection and placement state across editor branches.
 * @logic Editor-level branch view derivation and external command routing.
 * @presents Editor layout boundary.
 */
export default function EditorView(...) {
  ...
}
```

Good presentational header example:

```ts
/**
 * @role [P] Presentational
 * @presents Member table sections inside a class-box node.
 */
export default function MemberTable(...) {
  ...
}
```

## Inline job comments

Inline `@job` comments mark what each meaningful block of code does.

In React components under `EditorView`, every non-trivial block should be covered by a nearby `@job` comment. The goal is that a reader can scan the file and understand which parts are rendering, adaptation, wiring, logic, or coordination.

Use one comment per coherent block. Do not annotate every line. Do not repeat the same tag for a run of obvious JSX unless the responsibility changes.

Good examples:

```ts
// @job logic:ui-prop
const isResizeVisible = selected && data.isSoleSelection;
```

```ts
// @job render:style
const className = [
  styles.classBox,
  selected ? styles.selected : "",
  dragging ? styles.dragging : "",
]
  .filter(Boolean)
  .join(" ");
```

```ts
// @job adapt:slice-view
const memberTableView = view.memberTable;
```

```ts
// @job adapt:framework-props
const nodes = toReactFlowNodes(view.classes, localNodeDeltas);
```

```ts
// @job adapt:raw-event
const handleNodeDragStop = (_event, node) => {
  onAction({
    kind: "classDragStopped",
    classId: node.id,
    position: node.position,
  });
};
```

```ts
// @job wire:command
const handleDeleteClick = () => {
  dispatch({ kind: "deleteSelected" });
};
```

```ts
// @job logic:command
const command = deriveClassResizeCommand({
  classId,
  previousRect,
  nextRect,
});
```

```ts
// @job coordinate:sibling-action
const dispatchAction = (action: EditorViewAction) => {
  setSelectionState(reduceSelectionAction(selectionState, action));
  setPlacementState(reducePlacementAction(placementState, action));
};
```

```tsx
// @job render:ui
return (
  <NodeResizer
    isVisible={isResizeVisible}
    onResizeEnd={handleResizeEnd}
  />
);
```

Inline comments should make product logic especially visible when it appears next to presentation code.
