/**
 * @fileoverview UI constants shared across Shiny View editor interactions.
 */

export const DUPLICATE_OFFSET = 24;

export const GENERATE_CLASS_WIDTH = 200;
export const GENERATE_CLASS_HEIGHT = 150;
export const GENERATE_CLASS_MARGIN = 40;

export const PLACEMENT_OVERLAY_DRAG_THRESHOLD = 4;
export const PLACEMENT_OVERLAY_Z_INDEX = 20;
export const TOOL_PANE_WIDTH = 136;
export const EDIT_PANE_WIDTH = 260;
export const STYLE_COLOR_PRESETS = [
  { label: "Default", value: "" },
  { label: "White", value: "#ffffff" },
  { label: "Ink", value: "#24292f" },
  { label: "Blue", value: "#e8f0ff" },
  { label: "Green", value: "#e9f7ef" },
  { label: "Yellow", value: "#fff4b8" },
  { label: "Rose", value: "#ffdfe5" },
] as const;
export const STYLE_STROKE_WIDTH_PRESETS = [
  { label: "Default", value: "" },
  { label: "Thin", value: "1px" },
  { label: "Medium", value: "2px" },
  { label: "Thick", value: "3px" },
] as const;
export const STYLE_STROKE_DASHARRAY_PRESETS = [
  { label: "Solid", value: "" },
  { label: "Dotted", value: "2 3" },
  { label: "Dashed", value: "6 4" },
  { label: "Long dash", value: "10 5" },
] as const;
export const MEMBER_DRAG_THRESHOLD = 4;
export const CLASS_BOX_MIN_WIDTH = 80;
export const CLASS_BOX_MIN_HEIGHT = 48;

export const DEFAULT_NOTE_WIDTH = 180;
export const DEFAULT_NOTE_HEIGHT = 96;
export const NOTE_MIN_WIDTH = 120;
export const NOTE_MIN_HEIGHT = 64;
export const UNANNOTATED_NOTE_MARGIN = 48;
export const UNANNOTATED_NOTE_STACK_GAP = 18;
export const NOTE_ATTACH_GHOST_Z_INDEX = 40;
export const NOTE_ATTACH_GHOST_STROKE = "#805d00";
export const NOTE_ATTACH_GHOST_STROKE_WIDTH = 2;
export const NOTE_ATTACH_GHOST_DASH_PATTERN = "6 4";
export const NOTE_ATTACHMENT_EDGE_STROKE = "#8a6d1d";
export const NOTE_ATTACHMENT_EDGE_STROKE_WIDTH = 1.5;

export const RELATIONSHIP_RECONNECT_RADIUS = 12;
export const RELATIONSHIP_EDGE_HIT_PATH_STROKE_WIDTH = 14;
export const RELATIONSHIP_EDGE_DASH_PATTERN = "6 4";
// Oversized invisible anchor region the content-sized edge text box centers in.
export const RELATIONSHIP_EDGE_TEXT_REGION_WIDTH = 240;
export const RELATIONSHIP_EDGE_TEXT_REGION_HEIGHT = 64;
export const RELATIONSHIP_EDGE_MULTIPLICITY_POSITION_FRACTION = 0.3;

export const NAMESPACE_MARGIN = 32;
export const NAMESPACE_LABEL_BAND_HEIGHT = 28;
export const NAMESPACE_LABEL_PADDING_Y = 6;
export const NAMESPACE_LABEL_PADDING_X = 10;
export const NAMESPACE_LABEL_LINE_HEIGHT = 16;
export const NAMESPACE_LABEL_FONT_SIZE = 12;
export const NAMESPACE_LABEL_FONT_WEIGHT = 600;
export const NAMESPACE_LABEL_BAND_FILL_MIX_PERCENT = 72;
export const NAMESPACE_DEFAULT_STROKE_WIDTH = 1;
export const NAMESPACE_SELECTION_RING_WIDTH = 1;
export const NAMESPACE_DEFAULT_FILL = "rgba(82, 184, 255, 0.1)";
export const NAMESPACE_DEFAULT_STROKE = "#52b8ff";
export const NAMESPACE_PENDING_STROKE = "#2fbf71";
export const NAMESPACE_PENDING_OUTLINE_OFFSET = 2;
export const NAMESPACE_HALO_PADDING = 6;
export const NAMESPACE_HALO_BORDER_RADIUS = 4;
export const NAMESPACE_PENDING_STROKE_WIDTH = 2;
export const NAMESPACE_NODE_Z_INDEX = 0;
export const CLASS_NODE_Z_INDEX = 10;
export const NOTE_NODE_Z_INDEX = 12;
export const NAMESPACE_GESTURE_Z_INDEX = 30;

export const NAMESPACE_EDIT_PANE_SECTION_PADDING = 12;
export const NAMESPACE_EDIT_PANE_SECTION_GAP = 10;
export const NAMESPACE_EDIT_PANE_FIELD_GAP = 4;
export const NAMESPACE_EDIT_PANE_CONTROL_GAP = 8;
export const NAMESPACE_EDIT_PANE_INPUT_PADDING_Y = 6;
export const NAMESPACE_EDIT_PANE_INPUT_PADDING_X = 8;
export const NAMESPACE_EDIT_PANE_FONT_SIZE = 12;
export const NAMESPACE_EDIT_PANE_INPUT_RADIUS = 6;
export const NAMESPACE_EDIT_PANE_COLOR_PICKER_FALLBACK = "#ffffff";
export const NAMESPACE_EDIT_PANE_INPUT_BORDER_WIDTH = 1;
export const NAMESPACE_EDIT_PANE_INPUT_MIN_WIDTH = 0;
