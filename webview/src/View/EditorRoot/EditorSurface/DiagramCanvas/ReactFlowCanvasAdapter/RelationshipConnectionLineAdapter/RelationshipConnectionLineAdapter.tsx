/**
 * @behavior Relationship placement cursor tracking for the ghost endpoint.
 * @framework React Flow connection line props to relationship ghost rendering.
 */

import { useCallback, useEffect, useRef } from "react";
import type { MutableRefObject, ReactElement } from "react";
import { type ConnectionLineComponentProps, useReactFlow, type XYPosition } from "@xyflow/react";
import type { RelationshipSeed } from "../../../../../state/editorStates";
import type { ClassBoxNodeDescriptor } from "../frameworkAdapters";
import RelationshipMarker from "../RelationshipMarker/RelationshipMarker";
import styles from "./RelationshipConnectionLineAdapter.module.css";

type RelationshipConnectionLineAdapterProps =
  ConnectionLineComponentProps<ClassBoxNodeDescriptor> & {
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
  // State creation: local ref - rendered ghost path element updated outside React render
  const pathRef = useRef<SVGPathElement | null>(null);

  // Framework prop and event adaptation
  const { screenToFlowPosition } = useReactFlow<ClassBoxNodeDescriptor>();
  const toStartPoint = useCallback(
    (): XYPosition => pressPointRef.current ?? { x: fromX, y: fromY },
    [fromX, fromY, pressPointRef]
  );

  useEffect(() => {
    function onPointerMove(event: PointerEvent): void {
      const cursorPoint = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      pathRef.current?.setAttribute("d", toStraightPath(toStartPoint(), cursorPoint));
    }

    window.addEventListener("pointermove", onPointerMove);
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [screenToFlowPosition, toStartPoint]);

  // UI props derivation
  const startPoint = toStartPoint();
  const edgePath = toStraightPath(startPoint, { x: toX, y: toY });
  const sourceMarkerId = `relationship-placement-source-${seed.sourceEndpointKind}`;
  const targetMarkerId = `relationship-placement-target-${seed.targetEndpointKind}`;

  return (
    <g className={styles.connectionLine}>
      <defs>
        <RelationshipMarker
          id={sourceMarkerId}
          endpointKind={seed.sourceEndpointKind}
          side="source"
        />
        <RelationshipMarker
          id={targetMarkerId}
          endpointKind={seed.targetEndpointKind}
          side="target"
        />
      </defs>
      <path
        ref={pathRef}
        className={styles.path}
        d={edgePath}
        fill="none"
        markerStart={toMarkerUrl(sourceMarkerId, seed.sourceEndpointKind)}
        markerEnd={toMarkerUrl(targetMarkerId, seed.targetEndpointKind)}
        strokeDasharray={seed.lineKind === "dashed" ? "6 4" : undefined}
      />
    </g>
  );
}

// Private helpers
function toStraightPath(startPoint: XYPosition, endPoint: XYPosition): string {
  return `M ${startPoint.x} ${startPoint.y} L ${endPoint.x} ${endPoint.y}`;
}

function toMarkerUrl(id: string, endpointKind: string): string | undefined {
  return endpointKind === "none" ? undefined : `url(#${id})`;
}
