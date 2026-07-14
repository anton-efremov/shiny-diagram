/**
 * @framework React Flow connection geometry plus live reconnect pointer coordinates to View relationship ghost line props.
 */

import type { MutableRefObject, ReactElement } from "react";
import { type ConnectionLineComponentProps, type XYPosition } from "@xyflow/react";
import type { RelationshipSeed } from "../../../../../state/editorStates";
import RelationshipGhostLine from "./RelationshipGhostLine/RelationshipGhostLine";
import { getFlexibleEdgePath } from "../edgeGeometry";

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
  toX,
  toY,
  fromPosition,
  toPosition,
  placementSeed,
  placementStartPointRef,
  placementPointerRef,
  reconnectSeedRef,
  reconnectPointerRef,
}: RelationshipConnectionLineAdapterProps): ReactElement {
  // Framework prop and event adaptation
  const seed = placementSeed ?? reconnectSeedRef.current ?? NEUTRAL_RELATIONSHIP_SEED;
  const startPoint = placementStartPointRef.current ?? { x: fromX, y: fromY };
  const endPoint = placementSeed
    ? (placementPointerRef.current ?? { x: toX, y: toY })
    : reconnectSeedRef.current
      ? (reconnectPointerRef.current ?? { x: toX, y: toY })
      : { x: toX, y: toY };
  const [d] = getFlexibleEdgePath({
    sourceX: startPoint.x,
    sourceY: startPoint.y,
    sourcePosition: fromPosition,
    targetX: endPoint.x,
    targetY: endPoint.y,
    targetPosition: toPosition,
  });

  return <RelationshipGhostLine seed={seed} d={d} />;
}
