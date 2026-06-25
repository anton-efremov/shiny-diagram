/**
 * @fileoverview Editor commands owned by ClassDiagram interaction surfaces.
 */

import type { Point, Rect } from "../../../../shared/geometry";
import type { ClassId, NamespaceId, NoteId, RelationshipId } from "../../../../shared/ids";
import type { RelationshipType } from "../../../../shared/relationshipTypes";
import type { StylePropertyName } from "../../../../shared/styleTypes";

export type ClassMoveCommand = {
  readonly type: "class.move";
  readonly moves: readonly ClassMoveEntry[];
};

export type ClassMoveEntry = {
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

// @job logic:command:derive
export function toClassMoveCommand(moves: readonly ClassMoveEntry[]): ClassMoveCommand {
  return { type: "class.move", moves };
}
