/**
 * @fileoverview Editor intents accepted by the Commands component.
 */

import type { RelationshipType, StyleProperty } from "../model/diagramTree";
import type { Point, Rect } from "../../shared/geometry";
import type { ClassId, MemberId, NamespaceId, NoteId, RelationshipId } from "../../shared/ids";

export type MemberPrefix = "+" | "-" | "#" | "~" | "$" | "*" | "";

export type ClassBoxCommand =
  | { readonly type: "class.move"; readonly classId: ClassId; readonly rect: Rect }
  | { readonly type: "class.resize"; readonly classId: ClassId; readonly rect: Rect };

export type ClassContentCommand =
  | { readonly type: "class.header.setLabel"; readonly classId: ClassId; readonly label: string }
  | {
      readonly type: "class.member.setText";
      readonly classId: ClassId;
      readonly memberId: MemberId;
      readonly text: string;
    }
  | {
      readonly type: "class.member.setPrefix";
      readonly classId: ClassId;
      readonly memberId: MemberId;
      readonly prefix: MemberPrefix;
    };

export type StyleCommand = {
  readonly type: "style.setClassProperty";
  readonly classId: ClassId;
  readonly property: StyleProperty["property"];
  readonly value: string;
};

export type NamespaceCommand =
  | { readonly type: "namespace.move"; readonly namespaceId: NamespaceId; readonly delta: Point }
  | {
      readonly type: "namespace.setStyle";
      readonly namespaceId: NamespaceId;
      readonly property: StyleProperty["property"];
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

export type GenerateCommand = {
  readonly type: "generate";
};

export type EditorCommand =
  | ClassBoxCommand
  | ClassContentCommand
  | StyleCommand
  | NamespaceCommand
  | RelationshipCommand
  | NoteCommand
  | GenerateCommand;
