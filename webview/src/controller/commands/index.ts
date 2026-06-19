import type {
  DiagramTree,
  MemberId,
  RelationshipType,
  SourceEdit,
  SourceLocation,
  StyleProperty,
} from "../../primitives";
import type { Point, Rect } from "../../shared/geometry";
import type { ClassId, NamespaceId, NoteId } from "../../shared/ids";
import type { ElementViews, RelationshipViewId } from "../deriveViews";
import { handleClassBoxCommand } from "./classBoxCommandHandler";
import { handleGenerateCommand } from "./generateCommandHandler";
import { handleMemberCommand } from "./memberCommandHandler";
import { handleNamespaceCommand } from "./namespaceCommandHandler";
import { handleNoteCommand } from "./noteCommandHandler";
import { handleRelationshipCommand } from "./relationshipCommandHandler";
import { handleStyleCommand } from "./styleCommandHandler";

export type { RelationshipViewId };

export type MemberPrefix = "+" | "-" | "#" | "~" | "$" | "*" | "";

export type EditorCommand =
  | { readonly type: "class.move"; readonly classId: ClassId; readonly rect: Rect }
  | { readonly type: "class.resize"; readonly classId: ClassId; readonly rect: Rect }
  | { readonly type: "class.header.setLabel"; readonly classId: ClassId; readonly label: string }
  | { readonly type: "class.member.setText"; readonly classId: ClassId; readonly memberId: MemberId; readonly text: string }
  | { readonly type: "class.member.setPrefix"; readonly classId: ClassId; readonly memberId: MemberId; readonly prefix: MemberPrefix }
  | { readonly type: "style.setClassProperty"; readonly classId: ClassId; readonly property: StyleProperty["property"]; readonly value: string }
  | { readonly type: "namespace.move"; readonly namespaceId: NamespaceId; readonly delta: Point }
  | { readonly type: "namespace.setStyle"; readonly namespaceId: NamespaceId; readonly property: StyleProperty["property"]; readonly value: string }
  | { readonly type: "relationship.setType"; readonly relationshipId: RelationshipViewId; readonly relationType: RelationshipType }
  | { readonly type: "relationship.setMultiplicity"; readonly relationshipId: RelationshipViewId; readonly endpoint: "source" | "target"; readonly value: string | null }
  | { readonly type: "relationship.setLabel"; readonly relationshipId: RelationshipViewId; readonly label: string | null }
  | { readonly type: "note.move"; readonly noteId: NoteId; readonly rect: Rect }
  | { readonly type: "note.resize"; readonly noteId: NoteId; readonly rect: Rect }
  | { readonly type: "note.setText"; readonly noteId: NoteId; readonly text: string }
  | { readonly type: "generate" };

/**
 * Flag: `malformedAnnotations` is not in the spec but is required to preserve
 * the Generate behavior (replacing partial @spatial lines rather than appending
 * duplicates). Populated by EditorCoordinator when parseResult.status === "missingAnnotations".
 */
export type CommandContext = {
  readonly sourceText: string;
  readonly model: DiagramTree;
  readonly views: ElementViews;
  readonly malformedAnnotations?: ReadonlyMap<ClassId, SourceLocation>;
};

export type CommandResult =
  | { readonly ok: true; readonly edits: SourceEdit[] }
  | { readonly ok: false; readonly problem: string };

export function applyCommand(command: EditorCommand, context: CommandContext): CommandResult {
  switch (command.type) {
    case "class.move":
    case "class.resize":
      return handleClassBoxCommand(command, context);

    case "style.setClassProperty":
      return handleStyleCommand(command, context);

    case "generate":
      return handleGenerateCommand(context);

    case "class.header.setLabel":
    case "class.member.setText":
    case "class.member.setPrefix":
      return handleMemberCommand(command, context);

    case "namespace.move":
    case "namespace.setStyle":
      return handleNamespaceCommand(command, context);

    case "relationship.setType":
    case "relationship.setMultiplicity":
    case "relationship.setLabel":
      return handleRelationshipCommand(command, context);

    case "note.move":
    case "note.resize":
    case "note.setText":
      return handleNoteCommand(command, context);
  }
}
