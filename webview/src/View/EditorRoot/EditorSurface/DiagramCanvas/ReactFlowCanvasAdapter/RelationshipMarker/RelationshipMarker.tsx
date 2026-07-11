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
  readonly selected?: boolean;
};

export default function RelationshipMarker({
  id,
  endpointKind,
  side,
  selected = false,
}: RelationshipMarkerProps): ReactElement | null {
  // UI props derivation
  const orient = side === "source" ? "auto-start-reverse" : "auto";

  switch (endpointKind) {
    case "none":
      return null;
    case "arrow":
      return (
        <marker id={id} markerWidth="8" markerHeight="8" refX="7" refY="4" orient={orient}>
          <path
            d="M1.5 1.5 7 4 1.5 6.5"
            className={`${styles.openMarker} ${selected ? styles.selectedMarker : ""}`}
          />
        </marker>
      );
    case "triangle":
      return (
        <marker id={id} markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient={orient}>
          <path
            d="m1.5 1.5 6.5 3-6.5 3Z"
            className={`${styles.openMarker} ${selected ? styles.selectedMarker : ""}`}
          />
        </marker>
      );
    case "composition":
      return (
        <marker id={id} markerWidth="10" markerHeight="8" refX="9" refY="4" orient={orient}>
          <path
            d="m1 4 3.5-2.5L9 4 4.5 6.5Z"
            className={`${styles.filledMarker} ${selected ? styles.selectedMarker : ""}`}
          />
        </marker>
      );
    case "aggregation":
      return (
        <marker id={id} markerWidth="10" markerHeight="8" refX="9" refY="4" orient={orient}>
          <path
            d="m1 4 3.5-2.5L9 4 4.5 6.5Z"
            className={`${styles.openMarker} ${selected ? styles.selectedMarker : ""}`}
          />
        </marker>
      );
    case "lollipop":
      return (
        <marker id={id} markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient={orient}>
          <circle
            cx="4.5"
            cy="4.5"
            r="2.5"
            className={`${styles.openMarker} ${selected ? styles.selectedMarker : ""}`}
          />
        </marker>
      );
  }
}
