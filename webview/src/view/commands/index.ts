/**
 * @fileoverview Public command contract of the View layer.
 * Flattens component-owned command definitions for Controller consumers.
 */

export type { GenerateCommand } from "../AppHeader/commands";
export type { EditorCommand } from "./editorCommand";
export type {
  ClassDiagramCommand,
  NamespaceCommand,
  NoteCommand,
  RelationshipCommand,
} from "../EditorView/ClassDiagram/commands";
export type {
  ClassBoxCommand,
  ClassContentCommand,
} from "../EditorView/ClassDiagram/ClassBox/commands";
export type {
  MemberCommand,
  MemberPrefix,
} from "../EditorView/ClassDiagram/ClassBox/MemberTable/commands";
export type { StyleCommand } from "../EditorView/StylePane/commands";
