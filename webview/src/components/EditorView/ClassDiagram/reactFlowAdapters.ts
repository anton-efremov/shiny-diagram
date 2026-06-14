import type { Edge as ReactFlowEdge, Node as ReactFlowNode } from "@xyflow/react";
import type { RelationshipEdge } from "../../../models/classDiagram/diagramTreeModel";
import type { ClassBoxProps } from "../EditorView";

export type BoxSide = "top" | "right" | "bottom" | "left";

export type ClassBoxNodeDescriptor = ReactFlowNode<ClassBoxProps, "classBox">;

export type RelationshipEdgeDescriptor = ReactFlowEdge;

/** Builds React Flow node descriptors from resolved ClassBoxProps. */
export function toClassBoxNodeDescriptors(
  classBoxes: ClassBoxProps[],
  selectedClassId: string | null
): ClassBoxNodeDescriptor[] {
  return classBoxes.flatMap((box) => {
    const spatial = box.node.spatial;
    if (!spatial) return [];

    return [
      {
        id: box.node.id,
        type: "classBox",
        position: { x: spatial.x, y: spatial.y },
        data: box,
        selected: box.node.id === selectedClassId,
        width: spatial.width,
        height: spatial.height,
        style: {
          width: spatial.width,
          height: spatial.height,
        },
      },
    ];
  });
}

/** Builds simple React Flow edges from parsed class relationships. */
export function toRelationshipEdgeDescriptors(
  classBoxes: ClassBoxProps[],
  relationships: RelationshipEdge[]
): RelationshipEdgeDescriptor[] {
  const classBoxesById = new Map(classBoxes.map((box) => [box.node.id, box]));

  return relationships.flatMap((relationship, index) => {
    const sourceBox = classBoxesById.get(relationship.source);
    const targetBox = classBoxesById.get(relationship.target);
    if (!sourceBox || !targetBox) return [];

    const sourceSide = chooseSourceSide(sourceBox, targetBox);
    const targetSide = oppositeSide(sourceSide);

    return [
      {
        id: `${relationship.source}-${relationship.target}-${index}`,
        source: relationship.source,
        target: relationship.target,
        sourceHandle: sourceSide,
        targetHandle: `target-${targetSide}`,
        label: relationship.label,
        type: "default",
      },
    ];
  });
}

export function chooseSourceSide(sourceBox: ClassBoxProps, targetBox: ClassBoxProps): BoxSide {
  const sourceSpatial = sourceBox.node.spatial;
  const targetSpatial = targetBox.node.spatial;

  if (!sourceSpatial || !targetSpatial) {
    return "right";
  }

  const sourceCenterX = sourceSpatial.x + sourceSpatial.width / 2;
  const sourceCenterY = sourceSpatial.y + sourceSpatial.height / 2;
  const targetCenterX = targetSpatial.x + targetSpatial.width / 2;
  const targetCenterY = targetSpatial.y + targetSpatial.height / 2;
  const dx = targetCenterX - sourceCenterX;
  const dy = targetCenterY - sourceCenterY;

  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? "right" : "left";
  }

  return dy >= 0 ? "bottom" : "top";
}

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
