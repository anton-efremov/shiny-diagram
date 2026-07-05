/**
 * @fileoverview Canonical closed set of editable style properties.
 * Single source of truth: the graph field, the command argument, the style UI,
 * and writeback formatting all derive from STYLE_PROPERTIES. Add a property here.
 */

export const STYLE_PROPERTIES = [
  { name: "fill", source: "fill", escapeCommas: false },
  { name: "stroke", source: "stroke", escapeCommas: false },
  { name: "strokeWidth", source: "stroke-width", escapeCommas: false },
  { name: "strokeDasharray", source: "stroke-dasharray", escapeCommas: false },
  { name: "color", source: "color", escapeCommas: false },
] as const;

export type StylePropertyName = (typeof STYLE_PROPERTIES)[number]["name"];

export type StyleProperties = Readonly<Record<StylePropertyName, string | null>>;
