// Public API surface — view/ imports only from this file, never from subfolders

export type {
  ClassId,
  StyleDefId,
  NamespaceId,
  NoteId,
  MemberId,
  SourceLocation,
  ClassNode,
  NamespaceNode,
  StyleDefNode,
  RelationshipEdge,
  SpatialData,
  ClassMember,
  DiagramTree,
  EditorDiagnostic,
  Rect,
  Point,
} from "./primitives";

export type {
  ElementViews,
  ClassBoxView,
  ClassBoxMemberView,
  NamespaceBoxView,
  RelationshipView,
  NoteView,
  LegendView,
  RelationshipViewId,
} from "./derive";

export type {
  EditorCommand,
  CommandContext,
  CommandResult,
  MemberPrefix,
} from "./commands";

export type { SourceEdit } from "./source";

export type { ParseResult } from "./parse";

export type { EditorHeaderState } from "./contexts/EditorStateContext";
export { useEditorState } from "./contexts/EditorStateContext";
export { useEditorDispatch } from "./contexts/EditorDispatchContext";
export { useCanvasState } from "./contexts/CanvasStateContext";

export type { CanvasState } from "./canvasState";
export { defaultCanvasState } from "./canvasState";

export { default as AppController } from "./AppController";
