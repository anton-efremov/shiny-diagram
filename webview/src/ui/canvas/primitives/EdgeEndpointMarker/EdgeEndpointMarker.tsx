/**
 * @render Relationship endpoint SVG marker definition.
 */

import type { ReactElement } from "react";
import { GLYPH_VIEW_BOX, type MarkerGlyphDescriptor } from "../../../../shared/glyph";
import { EDGE_ENDPOINT_MARKER_SIZE } from "../../tokens";
import styles from "./EdgeEndpointMarker.module.css";

type EdgeEndpointMarkerProps = {
  readonly id: string;
  readonly glyph: MarkerGlyphDescriptor;
  readonly side: "source" | "target";
  readonly selected: boolean;
};

export default function EdgeEndpointMarker({
  id,
  glyph,
  side,
  selected,
}: EdgeEndpointMarkerProps): ReactElement {
  const treatmentClassName = [
    glyph.filled ? styles.filled : styles.open,
    selected ? styles.selected : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <marker
      id={id}
      markerWidth={EDGE_ENDPOINT_MARKER_SIZE}
      markerHeight={EDGE_ENDPOINT_MARKER_SIZE}
      viewBox={GLYPH_VIEW_BOX}
      refX={glyph.anchor.x}
      refY={glyph.anchor.y}
      orient={side === "source" ? "auto-start-reverse" : "auto"}
    >
      {glyph.paths.map((path, index) => (
        <path
          key={`${path}-${index}`}
          d={path}
          className={`${treatmentClassName} ${glyph.dashed && index === 0 ? styles.dashed : ""}`}
        />
      ))}
    </marker>
  );
}
