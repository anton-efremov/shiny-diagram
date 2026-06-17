import type { ClassId, MemberId, NamespaceId, NoteId } from "../model/primitives";
import type { RelationshipType } from "../model/diagramTreeModel";
import type { SourceLocation } from "../model/diagramTreeModel";
import type { EditorDiagnostic } from "../model/diagnostics";

export type { ClassId, MemberId, NamespaceId, NoteId };

export type Rect = { x: number; y: number; w: number; h: number };
export type Point = { x: number; y: number };

/** Stable derived ID for a relationship; not a source fact. */
export type RelationshipViewId = string & { readonly __brand: "RelationshipViewId" };
export const toRelationshipViewId = (s: string): RelationshipViewId => s as RelationshipViewId;

/**
 * Flag: `kind` field is not in the spec's ClassBoxView member shape, but is
 * needed to preserve the field/method divider in ClassBox rendering.
 */
export type ClassBoxMemberView = {
  readonly memberId: MemberId;
  readonly prefix: string;
  readonly text: string;
  readonly kind: "field" | "method";
};

/**
 * Flag: `style.name` is not in the spec but is needed so StylePane can display
 * the classDef name (e.g. "Rose") for the selected class.
 */
export type ClassBoxView = {
  readonly classId: ClassId;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly header: { readonly label: string; readonly stereotype?: string };
  readonly members: readonly ClassBoxMemberView[];
  readonly style?: {
    readonly fill?: string;
    readonly stroke?: string;
    readonly color?: string;
    readonly name?: string;
  };
};

export type NamespaceBoxView = {
  readonly namespaceId: NamespaceId;
  readonly bounds: Rect;
  readonly label: string;
  readonly style?: { readonly fill?: string; readonly stroke?: string; readonly color?: string };
};

export type RelationshipView = {
  readonly viewId: RelationshipViewId;
  readonly sourceClassId: ClassId;
  readonly targetClassId: ClassId;
  readonly relationType: RelationshipType;
  readonly sourceMultiplicity?: string;
  readonly targetMultiplicity?: string;
  readonly label?: string;
  readonly sourceLocation: SourceLocation;
};

export type NoteView = {
  readonly noteId: NoteId;
  readonly text: string;
  readonly x?: number;
  readonly y?: number;
  readonly w?: number;
  readonly h?: number;
  readonly attachedTo?: ClassId;
};

export type LegendView = {
  readonly entries: readonly { readonly label: string; readonly style: { fill?: string; stroke?: string; color?: string } }[];
};

export type ElementViews = {
  readonly classes: readonly ClassBoxView[];
  readonly namespaces: readonly NamespaceBoxView[];
  readonly relationships: readonly RelationshipView[];
  readonly notes: readonly NoteView[];
  readonly legend: LegendView;
  readonly diagnostics: readonly EditorDiagnostic[];
};
