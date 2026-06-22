/**
 * @fileoverview Aggregate command language emitted by the View layer.
 */

import type { GenerateCommand } from "../App/AppHeader/commands";
import type {
  ClassMoveCommand,
  NamespaceCommand,
  NoteCommand,
  RelationshipCommand,
} from "../App/EditorView/ClassDiagram/commands";
import type {
  ClassBoxCommand,
  ClassHeaderCommand,
} from "../App/EditorView/ClassDiagram/ClassBox/commands";
import type { MemberCommand } from "../App/EditorView/ClassDiagram/ClassBox/MemberTable/commands";
import type { ClassAddCommand } from "../App/EditorView/ClassDiagram/PlacementOverlay/commands";
import type { ClassDeleteCommand, StyleCommand } from "../App/EditorView/StylePane/commands";

export type EditorCommand =
  | GenerateCommand
  | ClassMoveCommand
  | ClassBoxCommand
  | ClassHeaderCommand
  | MemberCommand
  | ClassAddCommand
  | NamespaceCommand
  | RelationshipCommand
  | NoteCommand
  | StyleCommand
  | ClassDeleteCommand;
