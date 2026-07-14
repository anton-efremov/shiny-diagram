/**
 * React Flow canvas boundary policy.
 *
 * Shiny uses React Flow as a controlled canvas/geometry framework:
 * - render controlled nodes and edges;
 * - host Shiny-owned node adapters;
 * - provide viewport pan/zoom/fit mechanics;
 * - report geometry gestures such as node movement;
 * - report pane background clicks.
 *
 * Shiny does not use React Flow as an editor-state framework.
 * Semantic editor state is owned by Shiny View state: selection, multi-selection,
 * class-box/header/member/method selection, inline-edit targets, deletion,
 * keyboard shortcuts, relationship editing, and source-changing commands.
 *
 * This object must be spread last into <ReactFlow />. Do not move it before
 * editable React Flow props. Spreading it last prevents accidental opt-in to
 * React Flow selection, deletion, connection, reconnection, and keyboard editing
 * behavior.
 */

import type { ReactFlowProps } from "@xyflow/react";

/**
 * Explicit `undefined` values are intentional.
 *
 * The object is spread last, so disabled event handlers override accidental
 * handlers passed earlier at the <ReactFlow /> call site.
 */
type ReactFlowBoundaryProps = Partial<{
  readonly [Property in keyof ReactFlowProps]: ReactFlowProps[Property] | undefined;
}>;

export const reactFlowCanvasBoundaryProps = {
  /**
   * Shiny owns semantic selection.
   *
   * React Flow node/edge selection is too coarse for Shiny because Shiny must
   * distinguish whole class-box selection, member/header/method selection,
   * inline-edit targets, relationship selection, and future editor concepts.
   */
  elementsSelectable: false,
  nodesFocusable: false,
  edgesFocusable: false,
  selectNodesOnDrag: false,
  selectionOnDrag: false,
  autoPanOnSelection: false,
  elevateNodesOnSelect: false,
  elevateEdgesOnSelect: false,
  selectionKeyCode: null,
  multiSelectionKeyCode: null,

  /**
   * Shiny owns keyboard behavior.
   *
   * React Flow keyboard behavior must not select, move, delete, pan, or zoom
   * editor entities behind Shiny state.
   */
  deleteKeyCode: null,
  panActivationKeyCode: null,
  zoomActivationKeyCode: null,
  autoPanOnNodeFocus: false,
  disableKeyboardA11y: true,

  /**
   * Shiny owns graph/source editing.
   *
   * Relationship creation, press-point preview capture, and rerouting use React
   * Flow connection/reconnection gestures as framework inputs, with semantic
   * handling owned by Shiny View.
   */
  nodesConnectable: true,
  edgesReconnectable: true,
  connectOnClick: false,
  autoPanOnConnect: false,

  /**
   * React Flow selection events are intentionally not Shiny selection inputs.
   */
  onSelectionChange: undefined,
  onSelectionDragStart: undefined,
  onSelectionDrag: undefined,
  onSelectionDragStop: undefined,
  onSelectionStart: undefined,
  onSelectionEnd: undefined,
  onSelectionContextMenu: undefined,

  /**
   * React Flow deletion events are intentionally not Shiny deletion inputs.
   */
  onDelete: undefined,
  onBeforeDelete: undefined,
  onNodesDelete: undefined,
  onEdgesDelete: undefined,

  /**
   * React Flow click-connect lifecycle events are intentionally not Shiny
   * relationship-editing inputs. Reconnect-end is temporarily observed by the
   * dev-only reconnect trace; it remains non-semantic and must not mutate state.
   */
  onClickConnectStart: undefined,
  onClickConnectEnd: undefined,

  /**
   * React Flow node/edge click events are not Shiny semantic selection.
   *
   * Shiny selection must enter through Shiny-owned DOM/event surfaces inside
   * node adapters, such as class-box body click, member-row click, or pane click.
   */
  onNodeClick: undefined,
  onNodeDoubleClick: undefined,
  onNodeContextMenu: undefined,
  onEdgeClick: undefined,
  onEdgeDoubleClick: undefined,
  onEdgeContextMenu: undefined,

  /**
   * Edge changes are disabled because Shiny does not currently support
   * React Flow-owned edge selection, removal, or mutation.
   *
   * `onNodesChange` is intentionally not disabled here because Shiny still uses
   * node geometry changes. Its handler must ignore React Flow `select` changes.
   */
  onEdgesChange: undefined,
} satisfies ReactFlowBoundaryProps;
