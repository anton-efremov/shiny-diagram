/**
 * @framework React Flow connection line props and canvas coordinates to View relationship ghost line props.
 */

import type { MutableRefObject, ReactElement } from "react";
import { type ConnectionLineComponentProps, useReactFlow, type XYPosition } from "@xyflow/react";
import type { Point } from "../../../../../../shared/geometry";
import type { RelationshipSeed } from "../../../../../state/editorStates";
import RelationshipGhostLine from "./RelationshipGhostLine/RelationshipGhostLine";

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
  readonly reconnectSeedRef: MutableRefObject<RelationshipSeed | null>;
};

export default function RelationshipConnectionLineAdapter({
  fromX,
  fromY,
  pointer,
  placementSeed,
  placementStartPointRef,
  reconnectSeedRef,
}: RelationshipConnectionLineAdapterProps): ReactElement {
  // Framework prop and event adaptation
  const { getViewport } = useReactFlow();
  const seed = placementSeed ?? reconnectSeedRef.current ?? NEUTRAL_RELATIONSHIP_SEED;
  const startPoint = placementStartPointRef.current ?? { x: fromX, y: fromY };
  const endPoint = toFlowPointFromRendererPoint(pointer, getViewport());

  return <RelationshipGhostLine seed={seed} startPoint={startPoint} endPoint={endPoint} />;
}

// Private helpers
type ViewportTransform = {
  readonly x: number;
  readonly y: number;
  readonly zoom: number;
};

function toFlowPointFromRendererPoint(point: Point, viewport: ViewportTransform): Point {
  return {
    x: (point.x - viewport.x) / viewport.zoom,
    y: (point.y - viewport.y) / viewport.zoom,
  };
}
