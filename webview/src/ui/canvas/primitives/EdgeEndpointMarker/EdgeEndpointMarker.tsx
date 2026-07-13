/**
 * @render Relationship endpoint SVG marker definition.
 */

import type { ReactElement } from "react";
import type { GlyphDescriptor } from "../../../../shared/glyph";
import styles from "./EdgeEndpointMarker.module.css";

type EdgeEndpointMarkerProps = {
  readonly id: string;
  readonly glyph: GlyphDescriptor;
  readonly side: "source" | "target";
  readonly selected: boolean;
};

export default function EdgeEndpointMarker({
  id,
  glyph,
  side,
  selected,
}: EdgeEndpointMarkerProps): ReactElement {
  const className = [glyph.filled ? styles.filled : styles.open, selected ? styles.selected : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <marker
      id={id}
      markerWidth="10"
      markerHeight="10"
      viewBox="0 0 16 16"
      refX={glyph.anchor?.x ?? 16}
      refY={glyph.anchor?.y ?? 8}
      orient={side === "source" ? "auto-start-reverse" : "auto"}
    >
      {glyph.paths.map((path, index) => (
        <path key={`${path}-${index}`} d={path} className={className} />
      ))}
    </marker>
  );
}
