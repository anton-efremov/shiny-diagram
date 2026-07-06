/**
 * @render Relationship endpoint SVG marker definitions.
 */

import type { ReactElement } from "react";
import type { RelationshipEndpointKind } from "../../../../../../shared/uml";
import styles from "./RelationshipMarker.module.css";

type RelationshipMarkerProps = {
  readonly id: string;
  readonly endpointKind: RelationshipEndpointKind;
  readonly side: "source" | "target";
};

export default function RelationshipMarker({
  id,
  endpointKind,
  side,
}: RelationshipMarkerProps): ReactElement | null {
  // UI props derivation
  const orient = side === "source" ? "auto-start-reverse" : "auto";

  switch (endpointKind) {
    case "none":
      return null;
    case "arrow":
      return (
        <marker id={id} markerWidth="10" markerHeight="10" refX="9" refY="5" orient={orient}>
          <path d="M 1 1 L 9 5 L 1 9" className={styles.openMarker} />
        </marker>
      );
    case "triangle":
      return (
        <marker id={id} markerWidth="12" markerHeight="12" refX="10" refY="6" orient={orient}>
          <path d="M 1 1 L 10 6 L 1 11 Z" className={styles.openMarker} />
        </marker>
      );
    case "composition":
      return (
        <marker id={id} markerWidth="14" markerHeight="10" refX="12" refY="5" orient={orient}>
          <path d="M 1 5 L 6 1 L 12 5 L 6 9 Z" className={styles.filledMarker} />
        </marker>
      );
    case "aggregation":
      return (
        <marker id={id} markerWidth="14" markerHeight="10" refX="12" refY="5" orient={orient}>
          <path d="M 1 5 L 6 1 L 12 5 L 6 9 Z" className={styles.openMarker} />
        </marker>
      );
    case "lollipop":
      return (
        <marker id={id} markerWidth="12" markerHeight="12" refX="10" refY="6" orient={orient}>
          <circle cx="6" cy="6" r="4" className={styles.openMarker} />
        </marker>
      );
  }
}
