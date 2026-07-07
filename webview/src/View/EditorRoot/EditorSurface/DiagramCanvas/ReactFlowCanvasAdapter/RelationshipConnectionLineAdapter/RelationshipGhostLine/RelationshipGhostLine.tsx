/**
 * @render Relationship ghost path and endpoint markers.
 */

import type { ReactElement } from "react";
import type { Point } from "../../../../../../../shared/geometry";
import type { RelationshipSeed } from "../../../../../../state/editorStates";
import { RELATIONSHIP_EDGE_DASH_PATTERN } from "../../../../../../config/editorUiConfig";
import RelationshipMarker from "../../../../../../ui/RelationshipMarker/RelationshipMarker";
import styles from "./RelationshipGhostLine.module.css";

type RelationshipGhostLineProps = {
  readonly seed: RelationshipSeed;
  readonly startPoint: Point;
  readonly endPoint: Point;
};

export default function RelationshipGhostLine({
  seed,
  startPoint,
  endPoint,
}: RelationshipGhostLineProps): ReactElement {
  // UI props derivation
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
