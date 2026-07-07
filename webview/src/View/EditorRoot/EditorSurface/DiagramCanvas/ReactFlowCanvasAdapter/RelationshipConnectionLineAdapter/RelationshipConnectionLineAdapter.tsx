/**
 * @framework React Flow connection line props and canvas coordinates to View relationship ghost line props.
 */

import { useCallback } from "react";
import type { MutableRefObject, ReactElement } from "react";
import { type ConnectionLineComponentProps, useReactFlow, type XYPosition } from "@xyflow/react";
import type { Point } from "../../../../../../shared/geometry";
import type { RelationshipSeed } from "../../../../../state/editorStates";
import RelationshipGhostLine from "./RelationshipGhostLine/RelationshipGhostLine";

type RelationshipConnectionLineAdapterProps = ConnectionLineComponentProps & {
  readonly seed: RelationshipSeed;
  readonly pressPointRef: MutableRefObject<XYPosition | null>;
};

export default function RelationshipConnectionLineAdapter({
  fromX,
  fromY,
  toX,
  toY,
  seed,
  pressPointRef,
}: RelationshipConnectionLineAdapterProps): ReactElement {
  // Framework prop and event adaptation
  const { screenToFlowPosition } = useReactFlow();
  const getStartPoint = useCallback(
    (): Point => pressPointRef.current ?? { x: fromX, y: fromY },
    [fromX, fromY, pressPointRef]
  );
  const toDiagramPoint = useCallback(
    (clientX: number, clientY: number): Point => screenToFlowPosition({ x: clientX, y: clientY }),
    [screenToFlowPosition]
  );

  return (
    <RelationshipGhostLine
      seed={seed}
      endPoint={{ x: toX, y: toY }}
      getStartPoint={getStartPoint}
      toDiagramPoint={toDiagramPoint}
    />
  );
}
