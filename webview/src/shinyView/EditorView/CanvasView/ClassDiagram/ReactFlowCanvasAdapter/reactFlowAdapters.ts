/**
 * @fileoverview ReactFlowCanvasAdapter framework projection helpers.
 * Translates editor-facing class and relationship views into React Flow node and edge descriptors.
 */

import type { Edge as ReactFlowEdge, Node as ReactFlowNode } from "@xyflow/react";
import type { ClassId } from "../../../../../shared/ids";
import type { ClassBoxMemberView } from "./ReactFlowClassBoxNodeAdapter/ClassBox/MemberTable/views";
import type { ClassEntryView, ReactFlowCanvasAdapterView } from "./views";
import type { RelationshipView } from "../views";

export type ClassBoxNodeData = {
  readonly classId: ClassId;
  readonly header: { readonly label: string; readonly stereotype?: string };
  readonly members: readonly ClassBoxMemberView[];
  readonly style?: {
    readonly fill?: string;
    readonly stroke?: string;
    readonly color?: string;
    readonly name?: string;
  };
  readonly isResizeVisible: boolean;
};

export type ClassBoxNodeDescriptor = ReactFlowNode<ClassBoxNodeData, "classBox">;
export type RelationshipEdgeDescriptor = ReactFlowEdge;

// @job connect:framework:props
export function toClassBoxNodeDescriptors(
  classes: readonly ClassEntryView[],
  selectedClassIds: readonly ClassId[]
): ClassBoxNodeDescriptor[] {
  const selected = new Set<ClassId>(selectedClassIds);
  return classes.map((entry) => ({
    id: entry.classId,
    type: "classBox" as const,
    position: { x: entry.x, y: entry.y },
    data: {
      classId: entry.classId,
      header: entry.header,
      members: entry.members,
      style: entry.style,
      isResizeVisible: entry.isResizeVisible,
    },
    selected: selected.has(entry.classId),
    width: entry.w,
    height: entry.h,
    style: { width: entry.w, height: entry.h },
  }));
}

export function toRelationshipEdgeDescriptors(
  classes: readonly ClassEntryView[],
  relationships: readonly RelationshipView[]
): RelationshipEdgeDescriptor[] {
  const classesById = new Map(classes.map((e) => [e.classId, e]));

  return relationships.flatMap((rel) => {
    const sourceEntry = classesById.get(rel.sourceClassId);
    const targetEntry = classesById.get(rel.targetClassId);
    if (!sourceEntry || !targetEntry) return [];

    const sourceSide = chooseSourceSide(sourceEntry, targetEntry);
    const targetSide = oppositeSide(sourceSide);

    return [
      {
        id: rel.relationshipId,
        source: rel.sourceClassId,
        target: rel.targetClassId,
        sourceHandle: sourceSide,
        targetHandle: `target-${targetSide}`,
        label: rel.label,
        type: "default",
        selectable: false,
        focusable: false,
      },
    ];
  });
}

type BoxSide = "top" | "right" | "bottom" | "left";

function chooseSourceSide(source: ClassEntryView, target: ClassEntryView): BoxSide {
  const sourceCenterX = source.x + source.w / 2;
  const sourceCenterY = source.y + source.h / 2;
  const targetCenterX = target.x + target.w / 2;
  const targetCenterY = target.y + target.h / 2;
  const dx = targetCenterX - sourceCenterX;
  const dy = targetCenterY - sourceCenterY;

  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? "right" : "left";
  }
  return dy >= 0 ? "bottom" : "top";
}

function oppositeSide(side: BoxSide): BoxSide {
  switch (side) {
    case "top":
      return "bottom";
    case "right":
      return "left";
    case "bottom":
      return "top";
    case "left":
      return "right";
  }
}

// @job connect:event:normalize
export function normalizePositionChanges(
  view: ReactFlowCanvasAdapterView,
  rfNodes: ClassBoxNodeDescriptor[]
): ReadonlyArray<{ readonly classId: ClassId; readonly x: number; readonly y: number }> {
  const classIds = new Set(view.classes.map((c) => c.classId));
  return rfNodes.flatMap((node) => {
    if (node.type !== "classBox" || !classIds.has(node.data.classId)) return [];
    return [{ classId: node.data.classId, x: node.position.x, y: node.position.y }];
  });
}
