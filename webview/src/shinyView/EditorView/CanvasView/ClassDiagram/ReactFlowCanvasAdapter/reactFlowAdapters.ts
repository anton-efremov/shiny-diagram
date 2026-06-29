/**
 * @fileoverview ReactFlowCanvasAdapter framework projection helpers.
 * Translates editor-facing class and relationship views into React Flow node and edge descriptors.
 */

import type { Edge as ReactFlowEdge, Node as ReactFlowNode } from "@xyflow/react";
import type { Rect } from "../../../../../shared/geometry";
import type { ClassId } from "../../../../../shared/ids";
import type { ClassBoxPlacementState } from "../../../../state/editorStates";
import type { ClassView, DiagramView, RelationshipView } from "../../../../views/schema";

export type ClassBoxNodeData = {
  readonly view: ClassView;
  readonly isResizeVisible: boolean;
};

export type ClassBoxNodeDescriptor = ReactFlowNode<ClassBoxNodeData, "classBox">;
export type RelationshipEdgeDescriptor = ReactFlowEdge;

// @job connect:framework:props
export function toClassBoxNodeDescriptors(
  classes: readonly ClassView[],
  selectedClassIds: readonly ClassId[],
  classBoxPlacementState: ClassBoxPlacementState
): ClassBoxNodeDescriptor[] {
  const selected = new Set<ClassId>(selectedClassIds);
  return classes.flatMap((classView) => {
    const placement = classBoxPlacementState.rectByClassId.get(classView.classId);
    if (!placement) return [];

    return [
      {
        id: classView.classId,
        type: "classBox" as const,
        position: { x: placement.x, y: placement.y },
        data: {
          view: classView,
          isResizeVisible: selected.size === 1 && selected.has(classView.classId),
        },
        selected: selected.has(classView.classId),
        width: placement.w,
        height: placement.h,
        style: { width: placement.w, height: placement.h },
      },
    ];
  });
}

export function toRelationshipEdgeDescriptors(
  classes: readonly ClassView[],
  relationships: readonly RelationshipView[],
  classBoxPlacementState: ClassBoxPlacementState
): RelationshipEdgeDescriptor[] {
  const classesById = new Map(
    classes.flatMap((classView) => {
      const placement = classBoxPlacementState.rectByClassId.get(classView.classId);
      if (!placement) return [];
      return [[classView.classId, placement] as const];
    })
  );

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

function chooseSourceSide(source: Rect, target: Rect): BoxSide {
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
  view: Pick<DiagramView, "classes">,
  rfNodes: ClassBoxNodeDescriptor[]
): ReadonlyArray<{ readonly classId: ClassId; readonly x: number; readonly y: number }> {
  const classIds = new Set(view.classes.map((c) => c.classId));
  return rfNodes.flatMap((node) => {
    if (node.type !== "classBox" || !classIds.has(node.data.view.classId)) return [];
    return [{ classId: node.data.view.classId, x: node.position.x, y: node.position.y }];
  });
}
