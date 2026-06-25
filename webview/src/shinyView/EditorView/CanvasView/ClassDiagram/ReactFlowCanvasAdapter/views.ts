/**
 * @fileoverview ReactFlowCanvasAdapter render contract.
 * Extracted because ReactFlowCanvasAdapter is an exclusively owned child component of ClassDiagram.
 */

import type { ClassId } from "../../../../../shared/ids";
import type { ClassBoxMemberView } from "./ReactFlowClassBoxNodeAdapter/ClassBox/MemberTable/views";
import type { PlacementOverlayView } from "./PlacementOverlay/views";
import type { RelationshipView } from "../views";

export type ClassEntryView = {
  readonly classId: ClassId;
  readonly header: { readonly label: string; readonly stereotype?: string };
  readonly members: readonly ClassBoxMemberView[];
  readonly style?: {
    readonly fill?: string;
    readonly stroke?: string;
    readonly color?: string;
    readonly name?: string;
  };
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly isResizeVisible: boolean;
};

export type ReactFlowCanvasAdapterView = {
  readonly classes: readonly ClassEntryView[];
  readonly relationships: readonly RelationshipView[];
  readonly selectedClassIds: readonly ClassId[];
  readonly isPlacementActive: boolean;
  readonly placementOverlayView: PlacementOverlayView;
};
