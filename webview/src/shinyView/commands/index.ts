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
} from "../EditorView/CanvasView/ClassDiagram/ClassBox/commands";
export type { ClassAddCommand } from "../EditorView/CanvasView/ClassDiagram/PlacementOverlay/commands";
export type { MemberCommand } from "../EditorView/CanvasView/ClassDiagram/ClassBox/MemberTable/commands";
export type {
  ClassDeleteCommand,
  ClassDuplicateCommand,
  StyleCommand,
} from "../EditorView/CanvasView/StylePane/commands";
