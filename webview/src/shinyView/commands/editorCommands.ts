/**
 * @fileoverview Canonical registry of View-to-Controller editor commands.
 *
 * This file defines every command shape the View may emit to Controller.
 * Components construct these command values, but must not define additional
 * View-to-Controller command shapes elsewhere.
 *
 * Commands describe stable editor intent in product/editor vocabulary, not UI
 * events, framework mechanics, source syntax, or persistence details.
 *
 * Command names follow: <editor-object-path>.<action>.
 * Prefer one command per independently meaningful editor fact.
 *
 * Command annotations identify exact View components:
 * - Initiated by: component that hears the user event.
 * - Emitted by: lowest View component that has enough context to dispatch the
 *   fully specified command transaction.
 *
 * If the contract is NOT IMPLEMENTED YET, the component names in "Initiated by"
 * and "Emitted by" are written to the best current guess.
 */

import type { Point } from "../../shared/geometry";
import type {
  ClassId,
  MemberId,
  NamespaceId,
  NoteId,
  RelationshipId,
} from "../../shared/ids";
import type { RelationshipType } from "../../shared/relationshipTypes";

export type BoxSize = {
  readonly width: number;
  readonly height: number;
};

export type MemberPrefix = "+" | "-" | "#" | "~";

export type RelationshipEndpoint = "source" | "target";

/** One View-to-Controller editor transaction. */
export type EditorCommandTransaction = readonly EditorCommand[];

export type EditorDispatch = (transaction: EditorCommandTransaction) => void;

export type EditorCommand =
  /*
   * Initiated by: PlacementOverlay. Emitted by: PlacementOverlay.
   */
  | {
      readonly type: "class.create";
      readonly position: Point;
      readonly size: BoxSize;
    }

  /*
   * Initiated by: ClassDiagram. Emitted by: ClassDiagram.
   */
  | {
      readonly type: "class.position.set";
      readonly classId: ClassId;
      readonly position: Point;
    }

  /*
   * Initiated by: ClassBox. Emitted by: ClassBox.
   */
  | {
      readonly type: "class.size.set";
      readonly classId: ClassId;
      readonly size: BoxSize;
    }

  /*
   * Initiated by: StylePane. Emitted by: ClassDiagram.
   */
  | {
      readonly type: "class.duplicate";
      readonly sourceClassId: ClassId;
      readonly position: Point;
      readonly size: BoxSize;
    }

  /*
   * Initiated by: StylePane. Emitted by: StylePane.
   */
  | {
      readonly type: "class.delete";
      readonly classId: ClassId;
    }

  /*
   * Initiated by: ClassBox. Emitted by: ClassBox.
   * NOT IMPLEMENTED YET.
   */
  | {
      readonly type: "class.label.set";
      readonly classId: ClassId;
      readonly label: string;
    }

  /*
   * Initiated by: MemberTable. Emitted by: MemberTable.
   * NOT IMPLEMENTED YET.
   */
  | {
      readonly type: "class.member.text.set";
      readonly classId: ClassId;
      readonly memberId: MemberId;
      readonly text: string;
    }

  /*
   * Initiated by: MemberTable. Emitted by: MemberTable.
   * NOT IMPLEMENTED YET.
   */
  | {
      readonly type: "class.member.prefix.set";
      readonly classId: ClassId;
      readonly memberId: MemberId;
      readonly prefix: MemberPrefix | null;
    }

  /*
   * Initiated by: StylePane. Emitted by: StylePane.
   */
  | {
      readonly type: "class.style.fillColor.set";
      readonly classId: ClassId;
      readonly fillColor: string;
    }

  /*
   * Initiated by: StylePane. Emitted by: StylePane.
   */
  | {
      readonly type: "class.style.borderColor.set";
      readonly classId: ClassId;
      readonly borderColor: string;
    }

  /*
   * Initiated by: StylePane. Emitted by: StylePane.
   */
  | {
      readonly type: "class.style.textColor.set";
      readonly classId: ClassId;
      readonly textColor: string;
    }

  /*
   * Initiated by: StylePane. Emitted by: StylePane.
   * NOT IMPLEMENTED YET.
   */
  | {
      readonly type: "class.style.borderWidth.set";
      readonly classId: ClassId;
      readonly borderWidth: string;
    }

  /*
   * Initiated by: StylePane. Emitted by: StylePane.
   * NOT IMPLEMENTED YET.
   */
  | {
      readonly type: "class.style.borderDashPattern.set";
      readonly classId: ClassId;
      readonly borderDashPattern: string;
    }

  /*
   * Initiated by: ClassDiagram. Emitted by: ClassDiagram.
   * NOT IMPLEMENTED YET.
   */
  | {
      readonly type: "namespace.style.fillColor.set";
      readonly namespaceId: NamespaceId;
      readonly fillColor: string;
    }

  /*
   * Initiated by: ClassDiagram. Emitted by: ClassDiagram.
   * NOT IMPLEMENTED YET.
   */
  | {
      readonly type: "namespace.style.borderColor.set";
      readonly namespaceId: NamespaceId;
      readonly borderColor: string;
    }

  /*
   * Initiated by: ClassDiagram. Emitted by: ClassDiagram.
   * NOT IMPLEMENTED YET.
   */
  | {
      readonly type: "namespace.style.textColor.set";
      readonly namespaceId: NamespaceId;
      readonly textColor: string;
    }

  /*
   * Initiated by: ClassDiagram. Emitted by: ClassDiagram.
   * NOT IMPLEMENTED YET.
   */
  | {
      readonly type: "namespace.style.borderWidth.set";
      readonly namespaceId: NamespaceId;
      readonly borderWidth: string;
    }

  /*
   * Initiated by: ClassDiagram. Emitted by: ClassDiagram.
   * NOT IMPLEMENTED YET.
   */
  | {
      readonly type: "namespace.style.borderDashPattern.set";
      readonly namespaceId: NamespaceId;
      readonly borderDashPattern: string;
    }

  /*
   * Initiated by: ClassDiagram. Emitted by: ClassDiagram.
   * NOT IMPLEMENTED YET.
   */
  | {
      readonly type: "relationship.create";
      readonly sourceClassId: ClassId;
      readonly targetClassId: ClassId;
      readonly relationshipType: RelationshipType;
    }

  /*
   * Initiated by: ClassDiagram. Emitted by: ClassDiagram.
   * NOT IMPLEMENTED YET.
   */
  | {
      readonly type: "relationship.type.set";
      readonly relationshipId: RelationshipId;
      readonly relationshipType: RelationshipType;
    }

  /*
   * Initiated by: ClassDiagram. Emitted by: ClassDiagram.
   * NOT IMPLEMENTED YET.
   */
  | {
      readonly type: "relationship.multiplicity.set";
      readonly relationshipId: RelationshipId;
      readonly endpoint: RelationshipEndpoint;
      readonly multiplicity: string | null;
    }

  /*
   * Initiated by: ClassDiagram. Emitted by: ClassDiagram.
   * NOT IMPLEMENTED YET.
   */
  | {
      readonly type: "relationship.label.set";
      readonly relationshipId: RelationshipId;
      readonly label: string | null;
    }

  /*
   * Initiated by: ClassDiagram. Emitted by: ClassDiagram.
   * NOT IMPLEMENTED YET.
   */
  | {
      readonly type: "note.position.set";
      readonly noteId: NoteId;
      readonly position: Point;
    }

  /*
   * Initiated by: ClassDiagram. Emitted by: ClassDiagram.
   * NOT IMPLEMENTED YET.
   */
  | {
      readonly type: "note.size.set";
      readonly noteId: NoteId;
      readonly size: BoxSize;
    }

  /*
   * Initiated by: ClassDiagram. Emitted by: ClassDiagram.
   * NOT IMPLEMENTED YET.
   */
  | {
      readonly type: "note.text.set";
      readonly noteId: NoteId;
      readonly text: string;
    };

export type EditorCommandType = EditorCommand["type"];

export type EditorCommandOf<TType extends EditorCommandType> = Extract<
  EditorCommand,
  { readonly type: TType }
>;
