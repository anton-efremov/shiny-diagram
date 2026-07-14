/**
 * @fileoverview UI constants shared across Shiny View editor interactions.
 */

export const DUPLICATE_OFFSET = 24;

export const GENERATE_CLASS_WIDTH = 200;
export const GENERATE_CLASS_HEIGHT = 150;
export const GENERATE_CLASS_MARGIN = 40;

export const PLACEMENT_OVERLAY_DRAG_THRESHOLD = 4;
export const DIAGRAM_EMPTY_STATE_Z_INDEX = 5; // Product-asserted empty-state plane above the canvas.
export const PLACEMENT_OVERLAY_Z_INDEX = 20; // Product-asserted active gesture plane.
export const INLINE_VALIDATION_POPUP_Z_INDEX = 10000; // Framework-imposed escape plane above React Flow stacking.
export const NODE_BEHIND_CONTENT_Z_INDEX = -1; // Product-asserted plane behind node content.
export const NODE_ABOVE_CONTENT_Z_INDEX = 2; // Product-asserted plane above node content.
export const CHROME_PANE_EDGE_CONTROL_ABOVE_PANE_Z_INDEX = 5; // Product-asserted pane-edge control plane above pane content.
export const CHROME_MENU_ABOVE_CONTROL_Z_INDEX = 10; // Product-asserted menu plane above its chrome control.
export const CHROME_SELECTOR_POPUP_ABOVE_CONTROL_Z_INDEX = 100; // Product-asserted selector-popup plane above its chrome control.
export const CHROME_VALIDATION_ABOVE_CONTROL_Z_INDEX = 10000; // Product-asserted validation plane above its chrome control.
export const TOOL_PANE_WIDTH = 96;
export const EDIT_PANE_WIDTH = 200;
export const CLASS_BOX_MIN_WIDTH = 80;
export const CLASS_BOX_MIN_HEIGHT = 48;
export const CLASS_BOX_HEADER_MIN_HEIGHT = 42;
export const CLASS_DEFAULT_STROKE_WIDTH = "1px";
export const DEFAULT_STROKE_DASHARRAY = "0";

export const DEFAULT_NOTE_WIDTH = 180;
export const DEFAULT_NOTE_HEIGHT = 96;
export const NOTE_MIN_WIDTH = 120;
export const NOTE_MIN_HEIGHT = 64;
export const UNANNOTATED_NOTE_MARGIN = 48;
export const UNANNOTATED_NOTE_STACK_GAP = 18;
export const NOTE_ATTACH_GHOST_Z_INDEX = 40; // Product-asserted note attachment preview plane.

export const RELATIONSHIP_RECONNECT_RADIUS = 16;
export const RELATIONSHIP_EDGE_MULTIPLICITY_NORMAL_OFFSET = 10;
export const RELATIONSHIP_EDGE_MULTIPLICITY_POSITION_FRACTION = 0.3;

export const NAMESPACE_MARGIN = 32;
export const NAMESPACE_DEFAULT_STROKE_WIDTH = 1;
export const NAMESPACE_NODE_Z_INDEX = 0; // Framework-imposed React Flow node ordering.
export const RELATIONSHIP_EDGE_Z_INDEX = 1; // Framework-imposed plane above namespace hulls and below content nodes.
export const CLASS_NODE_Z_INDEX = 10; // Framework-imposed React Flow node ordering.
export const NOTE_NODE_Z_INDEX = 12; // Framework-imposed React Flow node ordering.
export const NAMESPACE_GESTURE_Z_INDEX = 30; // Framework-imposed plane above React Flow nodes.
