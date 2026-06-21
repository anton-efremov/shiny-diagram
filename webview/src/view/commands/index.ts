/**
 * @fileoverview Public command contract of the View layer.
 * Flattens component-owned command definitions for Controller consumers.
 */

export type { GenerateCommand } from "../App/AppHeader/commands";
export type { EditorCommand } from "./editorCommand";
export type {
  ClassDiagramCommand,
  ClassMoveCommand,
  NamespaceCommand,
  NoteCommand,
  RelationshipCommand,
} from "../App/EditorView/ClassDiagram/commands";
export type {
  ClassBoxCommand,
  ClassContentCommand,
} from "../App/EditorView/ClassDiagram/ClassBox/commands";
export type {
  ClassAddCommand,
  PlacementOverlayCommand,
} from "../App/EditorView/ClassDiagram/PlacementOverlay/commands";
export type {
  MemberCommand,
  MemberPrefix,
} from "../App/EditorView/ClassDiagram/ClassBox/MemberTable/commands";
export type { StyleCommand } from "../App/EditorView/StylePane/commands";
