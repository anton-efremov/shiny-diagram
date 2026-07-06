/**
 * @framework React Flow edge props to View relationship edge rendering props.
 */

import type { ReactElement } from "react";
import { getBezierPath, type EdgeProps } from "@xyflow/react";
import type { RelationshipEdgeDescriptor } from "../frameworkAdapters";
import RelationshipEdge from "./RelationshipEdge/RelationshipEdge";

export default function RelationshipEdgeAdapter({
  id,
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
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <RelationshipEdge
      edgeId={id}
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
