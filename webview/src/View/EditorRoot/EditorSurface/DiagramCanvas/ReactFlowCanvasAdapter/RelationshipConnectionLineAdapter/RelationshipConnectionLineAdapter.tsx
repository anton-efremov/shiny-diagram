/**
 * @framework React Flow connection geometry plus live reconnect pointer coordinates to View relationship ghost line props.
 */

import type { MutableRefObject, ReactElement } from "react";
import { type ConnectionLineComponentProps, type XYPosition } from "@xyflow/react";
import type { RelationshipSeed } from "../../../../../state/editorStates";
import RelationshipGhostLine from "./RelationshipGhostLine/RelationshipGhostLine";
import { getFlexibleEdgePath, getFloatingTargetPosition } from "../edgeGeometry";

/** Ghost seed for connection drags that carry no relationship styling of their own. */
const NEUTRAL_RELATIONSHIP_SEED: RelationshipSeed = {
  sourceEndpointKind: "none",
  targetEndpointKind: "none",
  lineKind: "solid",
  sourceMultiplicity: null,
  targetMultiplicity: null,
  label: null,
};

type RelationshipConnectionLineAdapterProps = ConnectionLineComponentProps & {
  readonly placementSeed: RelationshipSeed | null;
  readonly placementStartPointRef: MutableRefObject<XYPosition | null>;
  readonly placementPointerRef: MutableRefObject<XYPosition | null>;
  readonly reconnectSeedRef: MutableRefObject<RelationshipSeed | null>;
  readonly reconnectPointerRef: MutableRefObject<XYPosition | null>;
};

export default function RelationshipConnectionLineAdapter({
  fromX,
  fromY,
  fromPosition,
  pointer,
  placementSeed,
  placementStartPointRef,
  placementPointerRef,
  reconnectSeedRef,
  reconnectPointerRef,
}: RelationshipConnectionLineAdapterProps): ReactElement {
  // Framework prop and event adaptation
  const seed = placementSeed ?? reconnectSeedRef.current ?? NEUTRAL_RELATIONSHIP_SEED;
  const startPoint = placementStartPointRef.current ?? { x: fromX, y: fromY };
  const trackedPointer = placementSeed
    ? (placementPointerRef.current ?? pointer)
    : reconnectSeedRef.current
      ? (reconnectPointerRef.current ?? pointer)
      : pointer;
  const targetPosition = getFloatingTargetPosition({
    sourceX: startPoint.x,
    sourceY: startPoint.y,
    targetX: trackedPointer.x,
    targetY: trackedPointer.y,
  });
  const [d] = getFlexibleEdgePath({
    sourceX: startPoint.x,
    sourceY: startPoint.y,
    sourcePosition: fromPosition,
    targetX: trackedPointer.x,
    targetY: trackedPointer.y,
    targetPosition,
  });

  return <RelationshipGhostLine seed={seed} d={d} />;
}
