/**
 * @framework React Flow edge props to View relationship edge rendering props.
 */

import type { ReactElement } from "react";
import { type Edge as ReactFlowEdge, type EdgeProps } from "@xyflow/react";
import type { RelationshipId } from "../../../../../../shared/ids";
import type { RelationshipView } from "../../../../../views/schema";
import RelationshipEdge from "./RelationshipEdge/RelationshipEdge";
import { getFlexibleEdgePath } from "../edgeGeometry";

type RelationshipEdgeData = {
  readonly view: RelationshipView;
  readonly isSelected: boolean;
  readonly onRelationshipSelect: (relationshipId: RelationshipId) => void;
};

type RelationshipEdgeDescriptor = ReactFlowEdge<RelationshipEdgeData, "relationship">;

export default function RelationshipEdgeAdapter({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<RelationshipEdgeDescriptor>): ReactElement | null {
  if (!data) return null;

  // Framework prop and event adaptation
  const [edgePath, labelX, labelY] = getFlexibleEdgePath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <RelationshipEdge
      view={data.view}
      isSelected={data.isSelected}
      edgePath={edgePath}
      labelX={labelX}
      labelY={labelY}
      sourceX={sourceX}
      sourceY={sourceY}
      targetX={targetX}
      targetY={targetY}
      onRelationshipSelect={data.onRelationshipSelect}
    />
  );
}
