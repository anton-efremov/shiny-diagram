/**
 * @fileoverview Public command contract of the View layer.
 * Flattens component-owned command definitions for Controller consumers.
 */

export type { GenerateCommand } from "../EditorView/EditorStatus/commands";
export type { EditorCommand, EditorDispatch } from "./editorCommand";
export type {
  ClassMoveCommand,
  NamespaceCommand,
  NoteCommand,
  RelationshipCommand,
} from "../EditorView/ClassDiagram/commands";
export type {
  ClassBoxCommand,
  ClassHeaderCommand,
} from "../EditorView/ClassDiagram/ClassBox/commands";
export type { ClassAddCommand } from "../EditorView/ClassDiagram/PlacementOverlay/commands";
export type { MemberCommand } from "../EditorView/ClassDiagram/ClassBox/MemberTable/commands";
export type {
  ClassDeleteCommand,
  ClassDuplicateCommand,
  StyleCommand,
} from "../EditorView/StylePane/commands";
