/**
 * @fileoverview Diagram-level render contracts for namespaces and relationships.
 */

import type { Rect } from "../../../../shared/geometry";
import type { ClassId, NamespaceId, RelationshipId } from "../../../../shared/ids";
import type { RelationshipType } from "../../../../shared/relationshipTypes";
import type { ClassBoxView } from "./ClassBox/views";
import type { PlacementMode } from "../editorState";

export type ClassDiagramView = {
  readonly elements: {
    readonly classes: readonly ClassBoxView[];
    readonly namespaces: readonly NamespaceBoxView[];
    readonly relationships: readonly RelationshipView[];
  };
  readonly selectedClassIds: readonly ClassId[];
  readonly placementMode: PlacementMode | null;
};

export type NamespaceBoxView = {
  readonly namespaceId: NamespaceId;
  readonly bounds: Rect;
  readonly label: string;
  readonly style?: { readonly fill?: string; readonly stroke?: string; readonly color?: string };
};

export type RelationshipView = {
  readonly relationshipId: RelationshipId;
  readonly sourceClassId: ClassId;
  readonly targetClassId: ClassId;
  readonly relationType: RelationshipType;
  readonly sourceMultiplicity?: string;
  readonly targetMultiplicity?: string;
  readonly label?: string;
};
