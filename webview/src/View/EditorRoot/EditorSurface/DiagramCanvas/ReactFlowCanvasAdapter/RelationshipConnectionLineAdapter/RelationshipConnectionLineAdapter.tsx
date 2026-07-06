/**
 * @framework React Flow connection line props to relationship ghost rendering.
 */

import type { ReactElement } from "react";
import { getBezierPath, type ConnectionLineComponentProps } from "@xyflow/react";
import type { RelationshipSeed } from "../../../../../state/editorStates";
import type { ClassBoxNodeDescriptor } from "../frameworkAdapters";
import RelationshipMarker from "../RelationshipMarker/RelationshipMarker";
import styles from "./RelationshipConnectionLineAdapter.module.css";

type RelationshipConnectionLineAdapterProps =
  ConnectionLineComponentProps<ClassBoxNodeDescriptor> & {
    readonly seed: RelationshipSeed;
  };

export default function RelationshipConnectionLineAdapter({
  fromX,
  fromY,
  toX,
  toY,
  fromPosition,
  toPosition,
  seed,
}: RelationshipConnectionLineAdapterProps): ReactElement {
  // Framework prop and event adaptation
  const [edgePath] = getBezierPath({
    sourceX: fromX,
    sourceY: fromY,
    sourcePosition: fromPosition,
    targetX: toX,
    targetY: toY,
    targetPosition: toPosition,
  });

  // UI props derivation
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
        strokeDasharray={seed.lineKind === "dashed" ? "6 4" : undefined}
      />
    </g>
  );
}

// Private helpers
function toMarkerUrl(id: string, endpointKind: string): string | undefined {
  return endpointKind === "none" ? undefined : `url(#${id})`;
}
