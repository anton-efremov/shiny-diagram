/**
 * @fileoverview Aggregate command language emitted by the View layer.
 */

import type { GenerateCommand } from "../EditorView/MissingAnnotationsView/commands";
import type {
  ClassMoveCommand,
  NamespaceCommand,
  NoteCommand,
  RelationshipCommand,
} from "../EditorView/CanvasView/ClassDiagram/commands";
import type {
  ClassBoxCommand,
  ClassHeaderCommand,
} from "../EditorView/CanvasView/ClassDiagram/ReactFlowCanvasAdapter/ReactFlowClassBoxNodeAdapter/ClassBox/commands";
import type { MemberCommand } from "../EditorView/CanvasView/ClassDiagram/ReactFlowCanvasAdapter/ReactFlowClassBoxNodeAdapter/ClassBox/MemberTable/commands";
import type { ClassAddCommand } from "../EditorView/CanvasView/ClassDiagram/ReactFlowCanvasAdapter/PlacementOverlay/commands";
import type {
  ClassDeleteCommand,
  ClassDuplicateCommand,
  StyleCommand,
} from "../EditorView/CanvasView/StylePane/commands";

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
