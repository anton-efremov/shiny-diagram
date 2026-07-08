/**
 * @framework React Flow edge props to note attachment edge rendering props.
 */

import type { ReactElement } from "react";
import { getBezierPath, type Edge as ReactFlowEdge, type EdgeProps } from "@xyflow/react";
import NoteAttachmentEdge from "./NoteAttachmentEdge/NoteAttachmentEdge";

type NoteAttachmentEdgeData = {
  readonly isActive: boolean;
};

type NoteAttachmentEdgeDescriptor = ReactFlowEdge<NoteAttachmentEdgeData, "noteAttachment">;

export default function NoteAttachmentEdgeAdapter({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: EdgeProps<NoteAttachmentEdgeDescriptor>): ReactElement {
  // Framework prop and event adaptation
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return <NoteAttachmentEdge edgePath={edgePath} />;
}
