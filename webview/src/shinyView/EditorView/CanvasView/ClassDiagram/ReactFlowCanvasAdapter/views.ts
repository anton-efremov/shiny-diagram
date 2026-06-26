/**
 * @fileoverview ReactFlowCanvasAdapter render contract.
 * Extracted because ReactFlowCanvasAdapter is an exclusively owned child component of ClassDiagram.
 */

import type { ClassStyleProperties } from "../../../../../shared/diagramVocabulary";
import type { ClassId } from "../../../../../shared/ids";
import type { PlacementOverlayView } from "./PlacementOverlay/views";
import type { RelationshipType } from "../../../../../shared/relationshipTypes";
import type { MemberId, RelationshipId } from "../../../../../shared/ids";

export type ClassEntryView = {
  readonly classId: ClassId;
  readonly header: { readonly label: string; readonly stereotype?: string };
  readonly members: readonly ClassEntryMemberView[];
  readonly style?: ClassStyleProperties;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly isResizeVisible: boolean;
};

export type ClassEntryMemberView = {
  readonly memberId: MemberId;
  readonly prefix: string;
  readonly text: string;
  readonly kind: "field" | "method";
};

export type RelationshipEntryView = {
  readonly relationshipId: RelationshipId;
  readonly sourceClassId: ClassId;
  readonly targetClassId: ClassId;
  readonly relationType: RelationshipType;
  readonly sourceMultiplicity?: string;
  readonly targetMultiplicity?: string;
  readonly label?: string;
};

export type ReactFlowCanvasAdapterView = {
  readonly classes: readonly ClassEntryView[];
  readonly relationships: readonly RelationshipEntryView[];
  readonly selectedClassIds: readonly ClassId[];
  readonly isPlacementActive: boolean;
  readonly placementOverlayView: PlacementOverlayView;
};
