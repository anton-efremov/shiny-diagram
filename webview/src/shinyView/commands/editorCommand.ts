/**
 * @fileoverview Aggregate command language emitted by the View layer.
 */

import type { GenerateCommand } from "../EditorView/EditorStatus/commands";
import type {
  ClassMoveCommand,
  NamespaceCommand,
  NoteCommand,
  RelationshipCommand,
} from "../EditorView/ClassDiagram/commands";
import type {
  ClassBoxCommand,
  ClassHeaderCommand,
} from "../EditorView/ClassDiagram/ClassBox/commands";
import type { MemberCommand } from "../EditorView/ClassDiagram/ClassBox/MemberTable/commands";
import type { ClassAddCommand } from "../EditorView/ClassDiagram/PlacementOverlay/commands";
import type {
  ClassDeleteCommand,
  ClassDuplicateCommand,
  StyleCommand,
} from "../EditorView/StylePane/commands";

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
  | ClassDeleteCommand
  | ClassDuplicateCommand;

export type EditorDispatch = (command: EditorCommand) => void;
