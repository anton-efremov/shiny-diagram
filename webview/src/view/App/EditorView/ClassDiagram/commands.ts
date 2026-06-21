/**
 * @fileoverview Diagram-level editor commands and command-family aggregation.
 */

import type { Point, Rect } from "../../../../shared/geometry";
import type { ClassId, NamespaceId, NoteId, RelationshipId } from "../../../../shared/ids";
import type { RelationshipType } from "../../../../shared/relationshipTypes";
import type { StylePropertyName } from "../../../../shared/styleTypes";
import type { ClassBoxCommand, ClassContentCommand } from "./ClassBox/commands";
import type { PlacementOverlayCommand } from "./PlacementOverlay/commands";

export type ClassMoveCommand = {
  readonly type: "class.move";
  readonly classId: ClassId;
  readonly rect: Rect;
};

export type NamespaceCommand =
  | { readonly type: "namespace.move"; readonly namespaceId: NamespaceId; readonly delta: Point }
  | {
      readonly type: "namespace.setStyle";
      readonly namespaceId: NamespaceId;
      readonly property: StylePropertyName;
      readonly value: string;
    };

export type RelationshipCommand =
  | {
      readonly type: "relationship.setType";
      readonly relationshipId: RelationshipId;
      readonly relationType: RelationshipType;
    }
  | {
      readonly type: "relationship.setMultiplicity";
      readonly relationshipId: RelationshipId;
      readonly endpoint: "source" | "target";
      readonly value: string | null;
    }
  | {
      readonly type: "relationship.setLabel";
      readonly relationshipId: RelationshipId;
      readonly label: string | null;
    };

export type NoteCommand =
  | { readonly type: "note.move"; readonly noteId: NoteId; readonly rect: Rect }
  | { readonly type: "note.resize"; readonly noteId: NoteId; readonly rect: Rect }
  | { readonly type: "note.setText"; readonly noteId: NoteId; readonly text: string };

/**
 * Aggregates every command that can leave the ClassDiagram subtree.
 *
 * This gives the View-level `EditorCommand` contract one stable diagram boundary
 * instead of forcing it to enumerate every nested ClassDiagram component. When
 * internal diagram components are added, removed, or rearranged, only this
 * aggregate should need to change; external consumers keep depending on the
 * diagram-level command family.
 */
export type ClassDiagramCommand =
  | ClassMoveCommand
  | ClassBoxCommand
  | ClassContentCommand
  | PlacementOverlayCommand
  | NamespaceCommand
  | RelationshipCommand
  | NoteCommand;
