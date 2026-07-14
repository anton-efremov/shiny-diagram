import type { Point } from "./geometry";

export const GLYPH_GRID_SIZE = 16;
export const GLYPH_VIEW_BOX = `0 0 ${GLYPH_GRID_SIZE} ${GLYPH_GRID_SIZE}`;

export type GlyphDescriptor = {
  readonly paths: readonly string[];
  readonly filled: boolean;
  /** When set, the first path carries the glyph's dashed semantic treatment. */
  readonly dashed: boolean;
  readonly anchor?: Point;
};

export type MarkerGlyphDescriptor = GlyphDescriptor & {
  readonly anchor: Point;
};
