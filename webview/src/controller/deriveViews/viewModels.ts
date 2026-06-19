import type { MemberId, RelationshipType, SourceLocation } from "../../primitives";
import type { Rect } from "../../shared/geometry";
import type { ClassId, NamespaceId, NoteId } from "../../shared/ids";
import type { RelationshipViewId } from "./relationshipViewId";

/**
 * Render-facing view models produced by deriveViews.
 *
 * These types are the read contract between the Controller and the React View.
 * They are derived from the parsed DiagramTree and contain only data needed for
 * rendering and UI interaction.
 *
 * Do not put source-editing logic, parser logic, or command behavior here.
 */

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
};
