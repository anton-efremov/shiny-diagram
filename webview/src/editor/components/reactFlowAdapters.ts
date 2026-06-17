import type { Edge as ReactFlowEdge, Node as ReactFlowNode } from "@xyflow/react";
import type { ClassBoxView, RelationshipView } from "../../domain/classDiagram/derive/viewModel";
import type { ClassId } from "../../domain/classDiagram/model/primitives";

export type BoxSide = "top" | "right" | "bottom" | "left";

export type ClassBoxNodeDescriptor = ReactFlowNode<ClassBoxView, "classBox">;
export type RelationshipEdgeDescriptor = ReactFlowEdge;

export function toClassBoxNodeDescriptors(
  classes: readonly ClassBoxView[],
  selectedClassId: ClassId | null
): ClassBoxNodeDescriptor[] {
  return classes.map((view) => ({
    id: view.classId,
    type: "classBox" as const,
    position: { x: view.x, y: view.y },
    data: view,
    selected: view.classId === selectedClassId,
    width: view.w,
    height: view.h,
    style: { width: view.w, height: view.h },
  }));
}

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
        id: rel.viewId,
        source: rel.sourceClassId,
        target: rel.targetClassId,
        sourceHandle: sourceSide,
        targetHandle: `target-${targetSide}`,
        label: rel.label,
        type: "default",
      },
    ];
  });
}

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

export function oppositeSide(side: BoxSide): BoxSide {
  switch (side) {
    case "top": return "bottom";
    case "right": return "left";
    case "bottom": return "top";
    case "left": return "right";
  }
}
