import type { Point } from "./geometry";

export const GLYPH_GRID_SIZE = 16;

export type GlyphDescriptor = {
  readonly paths: readonly string[];
  readonly filled: boolean;
  readonly dashed: boolean;
  readonly anchor?: Point;
};
