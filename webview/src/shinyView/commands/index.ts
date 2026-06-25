/**
 * @fileoverview Public command contract of the View layer.
 * Flattens component-owned command definitions for Controller consumers.
 */

export type { GenerateCommand } from "../EditorView/MissingAnnotationsView/commands";
export type { EditorCommand, EditorDispatch } from "./editorCommand";
export type {
  ClassMoveCommand,
  NamespaceCommand,
  NoteCommand,
  RelationshipCommand,
} from "../EditorView/CanvasView/ClassDiagram/commands";
export type {
  ClassBoxCommand,
  ClassHeaderCommand,
} from "../EditorView/CanvasView/ClassDiagram/ReactFlowCanvasAdapter/ReactFlowClassBoxNodeAdapter/ClassBox/commands";
export type { ClassAddCommand } from "../EditorView/CanvasView/ClassDiagram/ReactFlowCanvasAdapter/PlacementOverlay/commands";
export type { MemberCommand } from "../EditorView/CanvasView/ClassDiagram/ReactFlowCanvasAdapter/ReactFlowClassBoxNodeAdapter/ClassBox/MemberTable/commands";
export type {
  ClassDeleteCommand,
  ClassDuplicateCommand,
  StyleCommand,
} from "../EditorView/CanvasView/StylePane/commands";
