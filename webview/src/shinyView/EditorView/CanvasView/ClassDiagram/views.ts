/**
 * @fileoverview Render contract for the class diagram canvas.
 */

import type { ClassStyleProperties } from "../../../../shared/diagramVocabulary";
import type { Rect } from "../../../../shared/geometry";
import type { ClassId, MemberId, NamespaceId, RelationshipId } from "../../../../shared/ids";
import type { RelationshipType } from "../../../../shared/relationshipTypes";
import type { NodePlacementState, SelectionState } from "../../../state/editorStates";

export type ClassDiagramView = {
  readonly elements: {
    readonly classes: readonly ClassDiagramClassView[];
    readonly namespaces: readonly ClassDiagramNamespaceView[];
    readonly relationships: readonly ClassDiagramRelationshipView[];
  };
  readonly selectionState: SelectionState;
  readonly nodePlacementState: NodePlacementState;
};

type ClassDiagramClassView = {
  readonly classId: ClassId;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly header: { readonly label: string; readonly stereotype?: string };
  readonly members: readonly ClassDiagramClassMemberView[];
  readonly style?: ClassStyleProperties;
};

type ClassDiagramClassMemberView = {
  readonly memberId: MemberId;
  readonly prefix: string;
  readonly text: string;
  readonly kind: "field" | "method";
};

type ClassDiagramNamespaceView = {
  readonly namespaceId: NamespaceId;
  readonly bounds: Rect;
  readonly label: string;
  readonly style?: ClassStyleProperties;
};

type ClassDiagramRelationshipView = {
  readonly relationshipId: RelationshipId;
  readonly sourceClassId: ClassId;
  readonly targetClassId: ClassId;
  readonly relationType: RelationshipType;
  readonly sourceMultiplicity?: string;
  readonly targetMultiplicity?: string;
  readonly label?: string;
};
