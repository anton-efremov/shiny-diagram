/**
 * @fileoverview Adapts View-owned render contracts to ReactFlow nodes and edges.
 */

import type { Edge as ReactFlowEdge, Node as ReactFlowNode } from "@xyflow/react";
import type { ClassBoxNodeView, ClassBoxView } from "./ClassBox/views";
import type { RelationshipView } from "./views";
import type { ClassId } from "../../../shared/ids";

export type BoxSide = "top" | "right" | "bottom" | "left";

export type ClassBoxNodeData = {
  readonly view: ClassBoxNodeView;
};

export type ClassBoxNodeDescriptor = ReactFlowNode<ClassBoxNodeData, "classBox">;
export type RelationshipEdgeDescriptor = ReactFlowEdge;

/**
 * Converts class-box views into ReactFlow node descriptors.
 */
export function toClassBoxNodeDescriptors(
  classes: readonly ClassBoxView[],
  selectedClassIds: readonly ClassId[]
): ClassBoxNodeDescriptor[] {
  const selected = new Set<ClassId>(selectedClassIds);
  const hasSoleSelection = selectedClassIds.length === 1;

  return classes.map((view) => ({
    id: view.classId,
    type: "classBox" as const,
    position: { x: view.x, y: view.y },
    data: {
      view: {
        view,
        isResizeVisible: hasSoleSelection && selected.has(view.classId),
      },
    },
    selected: selected.has(view.classId),
    width: view.w,
    height: view.h,
    style: { width: view.w, height: view.h },
  }));
}

/**
 * Projects View-owned selection onto existing ReactFlow class nodes.
 */
export function projectClassBoxNodeSelection(
  nodes: readonly ClassBoxNodeDescriptor[],
  selectedClassIds: readonly ClassId[]
): ClassBoxNodeDescriptor[] {
  const selected = new Set<ClassId>(selectedClassIds);
  const hasSoleSelection = selectedClassIds.length === 1;
  let didChange = false;

  const projected = nodes.map((node) => {
    const isSelected = selected.has(node.data.view.view.classId);
    const isResizeVisible = hasSoleSelection && isSelected;

    if (node.selected === isSelected && node.data.view.isResizeVisible === isResizeVisible) {
      return node;
    }

    didChange = true;

    return {
      ...node,
      selected: isSelected,
      data:
        node.data.view.isResizeVisible === isResizeVisible
          ? node.data
          : {
              view: {
                ...node.data.view,
                isResizeVisible,
              },
            },
    };
  });

  return didChange ? projected : (nodes as ClassBoxNodeDescriptor[]);
}

/**
 * Converts relationship views into ReactFlow edge descriptors.
 */
export function toRelationshipEdgeDescriptors(
  classes: readonly ClassBoxView[],
  relationships: readonly RelationshipView[]
): RelationshipEdgeDescriptor[] {
  const classesById = new Map(classes.map((v) => [v.classId, v]));

  return relationships.flatMap((rel) => {
    const sourceView = classesById.get(rel.sourceClassId);
    const targetView = classesById.get(rel.targetClassId);
    if (!sourceView || !targetView) return [];

    const sourceSide = chooseSourceSide(sourceView, targetView);
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

/**
 * Chooses the source handle side facing the target class box.
 */
export function chooseSourceSide(source: ClassBoxView, target: ClassBoxView): BoxSide {
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

/**
 * Returns the opposite box side for a relationship target handle.
 */
export function oppositeSide(side: BoxSide): BoxSide {
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
