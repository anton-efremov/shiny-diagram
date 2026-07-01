/**
 * @fileoverview Canonical closed set of editable style properties.
 * Single source of truth: the graph field, the command argument, the style UI,
 * and writeback formatting all derive from STYLE_PROPERTIES. Add a property here.
 */

export const STYLE_PROPERTIES = [
  { name: "fill", source: "fill", escapeCommas: false },
  { name: "stroke", source: "stroke", escapeCommas: false },
  { name: "strokeWidth", source: "stroke-width", escapeCommas: false },
  { name: "fontSize", source: "font-size", escapeCommas: false },
] as const;

export type StylePropertyName = (typeof STYLE_PROPERTIES)[number]["name"];
// = "fill" | "stroke" | "strokeWidth" | "fontSize"

export type StyleProperties = Partial<Record<StylePropertyName, string>>;
