import type { DiagramTree, SourceLocation } from "../model/diagramTreeModel";
import type { ClassId, MemberId, NamespaceId, NoteId } from "../model/primitives";
import type { ElementViews, RelationshipViewId } from "../derive/viewModel";
import type { RelationshipType, StyleProperty } from "../model/diagramTreeModel";
import type { SourceEdit } from "../source/sourceEditTypes";

export type { ClassId, MemberId, NamespaceId, NoteId, RelationshipViewId };

export type MemberPrefix = "+" | "-" | "#" | "~" | "$" | "*" | "";

export type Rect = { readonly x: number; readonly y: number; readonly w: number; readonly h: number };
export type Point = { readonly x: number; readonly y: number };

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
 * Metrics for classbox default sizing. Defined here (in domain/) so pure
 * command handlers can reference this type without importing from editor/.
 * The DOM-reading implementation stays in editor/classBoxMetrics.ts.
 */
export type ClassBoxMetrics = {
  readonly defaultWidth: number;
  readonly defaultHeight: number;
  readonly margin: number;
  readonly fontSize: number;
  readonly memberFontSize: number;
  readonly memberLineHeight: number;
  readonly headerMinHeight: number;
};

/**
 * Flag: `malformedAnnotations` is not in the spec but is required to preserve
 * the Generate behavior (replacing partial @spatial lines rather than appending
 * duplicates). Populated by EditorCoordinator when parseResult.status === "missingAnnotations".
 */
export type CommandContext = {
  readonly sourceText: string;
  readonly model: DiagramTree;
  readonly views: ElementViews;
  readonly classBoxMetrics: ClassBoxMetrics;
  readonly malformedAnnotations?: ReadonlyMap<ClassId, SourceLocation>;
};

export type CommandResult =
  | { readonly ok: true; readonly edits: SourceEdit[] }
  | { readonly ok: false; readonly problem: string };
