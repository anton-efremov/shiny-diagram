/**
 * @fileoverview Document history glyph descriptors for the Shell header.
 */

import type { GlyphDescriptor } from "../../shared/glyph";

export const undoGlyph: GlyphDescriptor = {
  paths: ["M6.5 2.5 3 6l3.5 3.5", "M3.5 6H8a5 5 0 0 1 5 5v1"],
  filled: false,
  dashed: false,
};

export const redoGlyph: GlyphDescriptor = {
  paths: ["M9.5 2.5 13 6 9.5 9.5", "M12.5 6H8a5 5 0 0 0-5 5v1"],
  filled: false,
  dashed: false,
};
