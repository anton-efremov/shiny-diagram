/** UML relationship-tool glyph descriptor catalog. */

import type { GlyphDescriptor } from "../../../../../shared/glyph";

export const associationGlyph: GlyphDescriptor = {
  paths: ["M2 8h12"],
  filled: false,
  dashed: false,
};

export const directedAssociationGlyph: GlyphDescriptor = {
  paths: ["M2 8h12M10 4l4 4-4 4"],
  filled: false,
  dashed: false,
};

export const bidirectionalAssociationGlyph: GlyphDescriptor = {
  paths: ["M2 8h12M6 4 2 8l4 4M10 4l4 4-4 4"],
  filled: false,
  dashed: false,
};

export const dependencyGlyph: GlyphDescriptor = {
  paths: ["M2 8h12", "m10 4 4 4-4 4"],
  filled: false,
  dashed: true,
};

export const inheritanceGlyph: GlyphDescriptor = {
  paths: ["M2 8h7M9 3.5 14 8l-5 4.5Z"],
  filled: false,
  dashed: false,
};

export const realizationGlyph: GlyphDescriptor = {
  paths: ["M2 8h7", "M9 3.5 14 8l-5 4.5Z"],
  filled: false,
  dashed: true,
};

export const aggregationGlyph: GlyphDescriptor = {
  paths: ["M7 8h7M2 8l3-3 3 3-3 3Z"],
  filled: false,
  dashed: false,
};

export const compositionGlyph: GlyphDescriptor = {
  paths: ["M7 8h7", "M2 8l3-3 3 3-3 3Z"],
  filled: true,
  dashed: false,
};
