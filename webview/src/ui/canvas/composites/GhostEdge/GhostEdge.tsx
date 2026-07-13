import type { ReactElement } from "react";
import type { MarkerGlyphDescriptor } from "../../../../shared/glyph";
import type { Point } from "../../../../shared/geometry";
import EdgeEndpointMarker from "../../primitives/EdgeEndpointMarker/EdgeEndpointMarker";
import EdgeGhostLine from "../../primitives/EdgeGhostLine/EdgeGhostLine";

type GhostEdgeProps = {
  readonly startPoint: Point;
  readonly endPoint: Point;
  readonly lineKind: "solid" | "dashed";
  readonly tone: "accent" | "attachment";
  readonly startMarker?: { readonly id: string; readonly glyph: MarkerGlyphDescriptor };
  readonly endMarker?: { readonly id: string; readonly glyph: MarkerGlyphDescriptor };
};

export default function GhostEdge({
  startPoint,
  endPoint,
  lineKind,
  tone,
  startMarker,
  endMarker,
}: GhostEdgeProps): ReactElement {
  return (
    <g>
      <defs>
        {startMarker ? (
          <EdgeEndpointMarker
            id={startMarker.id}
            glyph={startMarker.glyph}
            side="source"
            selected={false}
          />
        ) : null}
        {endMarker ? (
          <EdgeEndpointMarker
            id={endMarker.id}
            glyph={endMarker.glyph}
            side="target"
            selected={false}
          />
        ) : null}
      </defs>
      <EdgeGhostLine
        startPoint={startPoint}
        endPoint={endPoint}
        lineKind={lineKind}
        tone={tone}
        startMarkerId={startMarker?.id}
        endMarkerId={endMarker?.id}
      />
    </g>
  );
}
