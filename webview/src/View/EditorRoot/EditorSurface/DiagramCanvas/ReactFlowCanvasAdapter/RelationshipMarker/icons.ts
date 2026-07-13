import type { GlyphDescriptor } from "../../../../../../shared/glyph";
import type { RelationshipEndpointKind } from "../../../../../../shared/uml";

type VisibleEndpointKind = Exclude<RelationshipEndpointKind, "none">;

export const endpointGlyphs: Readonly<Record<VisibleEndpointKind, GlyphDescriptor>> = {
  arrow: {
    paths: ["M2.4 2.4 11.2 6.4 2.4 10.4"],
    filled: false,
    dashed: false,
    anchor: { x: 11.2, y: 6.4 },
  },
  triangle: {
    paths: ["m2.4 2.4 10.4 4.8-10.4 4.8Z"],
    filled: false,
    dashed: false,
    anchor: { x: 12.8, y: 7.2 },
  },
  composition: {
    paths: ["m1.6 6.4 5.6-4L14.4 6.4l-7.2 4Z"],
    filled: true,
    dashed: false,
    anchor: { x: 14.4, y: 6.4 },
  },
  aggregation: {
    paths: ["m1.6 6.4 5.6-4L14.4 6.4l-7.2 4Z"],
    filled: false,
    dashed: false,
    anchor: { x: 14.4, y: 6.4 },
  },
  lollipop: {
    paths: ["M11.2 7.2a4 4 0 1 1-8 0 4 4 0 1 1 8 0Z"],
    filled: false,
    dashed: false,
    anchor: { x: 12.8, y: 7.2 },
  },
};
