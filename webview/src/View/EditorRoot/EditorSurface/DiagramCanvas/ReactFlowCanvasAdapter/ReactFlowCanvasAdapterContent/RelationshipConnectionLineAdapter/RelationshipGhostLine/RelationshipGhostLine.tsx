/**
 * @behavior Relationship placement cursor tracking for the ghost endpoint.
 * @render Relationship ghost path and endpoint markers.
 */

import { useEffect, useRef } from "react";
import type { ReactElement } from "react";
import type { Point } from "../../../../../../../../shared/geometry";
import type { RelationshipSeed } from "../../../../../../../state/editorStates";
import { RELATIONSHIP_EDGE_DASH_PATTERN } from "../../../../../../../config/editorUiConfig";
import RelationshipMarker from "../../../../../../../ui/RelationshipMarker/RelationshipMarker";
import styles from "./RelationshipGhostLine.module.css";

type RelationshipGhostLineProps = {
  readonly seed: RelationshipSeed;
  readonly endPoint: Point;
  readonly getStartPoint: () => Point;
  readonly toDiagramPoint: (clientX: number, clientY: number) => Point;
};

export default function RelationshipGhostLine({
  seed,
  endPoint,
  getStartPoint,
  toDiagramPoint,
}: RelationshipGhostLineProps): ReactElement {
  // State creation: local ref - rendered ghost path element updated outside React render
  const pathRef = useRef<SVGPathElement | null>(null);

  useEffect(() => {
    function onPointerMove(event: PointerEvent): void {
      const cursorPoint = toDiagramPoint(event.clientX, event.clientY);
      pathRef.current?.setAttribute("d", toStraightPath(getStartPoint(), cursorPoint));
    }

    window.addEventListener("pointermove", onPointerMove);
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [getStartPoint, toDiagramPoint]);

  // UI props derivation
  const startPoint = getStartPoint();
  const edgePath = toStraightPath(startPoint, endPoint);
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
        strokeDasharray={seed.lineKind === "dashed" ? RELATIONSHIP_EDGE_DASH_PATTERN : undefined}
      />
    </g>
  );
}

// Private helpers
function toStraightPath(startPoint: Point, endPoint: Point): string {
  return `M ${startPoint.x} ${startPoint.y} L ${endPoint.x} ${endPoint.y}`;
}

function toMarkerUrl(id: string, endpointKind: string): string | undefined {
  return endpointKind === "none" ? undefined : `url(#${id})`;
}
