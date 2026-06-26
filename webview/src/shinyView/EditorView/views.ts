/**
 * @fileoverview Aggregate render contract consumed by the visual editor.
 */

import type { ClassStyleProperties } from "../../shared/diagramVocabulary";
import type { RelationshipType } from "../../shared/relationshipTypes";
import type { Rect } from "../../shared/geometry";
import type { ClassId, MemberId, NamespaceId, RelationshipId } from "../../shared/ids";

export type ElementViews = {
  readonly classes: readonly EditorClassView[];
  readonly namespaces: readonly EditorNamespaceView[];
  readonly relationships: readonly EditorRelationshipView[];
};

export type EditorClassView = {
  readonly classId: ClassId;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly header: { readonly label: string; readonly stereotype?: string };
  readonly members: readonly EditorClassMemberView[];
  readonly style?: ClassStyleProperties & { readonly name?: string };
};

export type EditorClassMemberView = {
  readonly memberId: MemberId;
  readonly prefix: string;
  readonly text: string;
  readonly kind: "field" | "method";
};

export type EditorNamespaceView = {
  readonly namespaceId: NamespaceId;
  readonly bounds: Rect;
  readonly label: string;
  readonly style?: ClassStyleProperties;
};

export type EditorRelationshipView = {
  readonly relationshipId: RelationshipId;
  readonly sourceClassId: ClassId;
  readonly targetClassId: ClassId;
  readonly relationType: RelationshipType;
  readonly sourceMultiplicity?: string;
  readonly targetMultiplicity?: string;
  readonly label?: string;
};

export type EditorViewModel =
  | {
      readonly status: "invalidSyntax";
      readonly message: string;
    }
  | {
      readonly status: "missingAnnotations";
      readonly missingIds: readonly ClassId[];
      readonly elements: ElementViews;
    }
  | {
      readonly status: "ready";
      readonly elements: ElementViews;
    };
