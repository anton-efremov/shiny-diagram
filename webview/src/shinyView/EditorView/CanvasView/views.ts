/**
 * @fileoverview Ready editor-state interface render contract.
 */

import type { ClassStyleProperties } from "../../../shared/diagramVocabulary";
import type { RelationshipType } from "../../../shared/relationshipTypes";
import type { Rect } from "../../../shared/geometry";
import type { ClassId, MemberId, NamespaceId, RelationshipId } from "../../../shared/ids";

export type CanvasElementViews = {
  readonly classes: readonly CanvasClassView[];
  readonly namespaces: readonly CanvasNamespaceView[];
  readonly relationships: readonly CanvasRelationshipView[];
};

export type CanvasClassView = {
  readonly classId: ClassId;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly header: { readonly label: string; readonly stereotype?: string };
  readonly members: readonly CanvasClassMemberView[];
  readonly style?: ClassStyleProperties & { readonly name?: string };
};

export type CanvasClassMemberView = {
  readonly memberId: MemberId;
  readonly prefix: string;
  readonly text: string;
  readonly kind: "field" | "method";
};

export type CanvasNamespaceView = {
  readonly namespaceId: NamespaceId;
  readonly bounds: Rect;
  readonly label: string;
  readonly style?: ClassStyleProperties;
};

export type CanvasRelationshipView = {
  readonly relationshipId: RelationshipId;
  readonly sourceClassId: ClassId;
  readonly targetClassId: ClassId;
  readonly relationType: RelationshipType;
  readonly sourceMultiplicity?: string;
  readonly targetMultiplicity?: string;
  readonly label?: string;
};

export type CanvasViewModel = {
  readonly elements: CanvasElementViews;
};
