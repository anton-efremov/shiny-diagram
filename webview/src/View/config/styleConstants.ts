/**
 * @fileoverview Shiny's fixed unstyled-appearance values for each styleable element role.
 *
 * These complete property sets fill every hole left by an element's authored style.
 * Changing a value changes every unstyled element and every constant-filled hole for
 * that role, so it is a release-level product decision. Constants may deliberately
 * retain live theme references: Shiny fixes what the reference denotes while the
 * host theme continues to own the resolved color. Color-family constants are
 * immutable canvas-brandbook role references and therefore never compare equal
 * to a user-authored color; measure and dash constants are literals and can be
 * removed from source by setting an authored property back to the literal.
 */

import { STYLE_PROPERTIES, type StyleProperties } from "../../shared/style";

export type ResolvedStyleProperties = Readonly<
  Record<(typeof STYLE_PROPERTIES)[number]["name"], string>
>;

export const CLASS_STYLE_CONSTANTS = {
  fill: "var(--shiny-canvas-unstyled-node-fill)",
  stroke: "var(--shiny-canvas-unstyled-node-stroke)",
  strokeWidth: "1",
  strokeDasharray: "0",
  color: "var(--shiny-canvas-unstyled-node-text)",
} as const satisfies StyleProperties;

export const NAMESPACE_STYLE_CONSTANTS = {
  fill: "var(--shiny-canvas-unstyled-hull-fill)",
  stroke: "var(--shiny-canvas-unstyled-hull-stroke)",
  strokeWidth: "1",
  strokeDasharray: "0",
  color: "var(--shiny-canvas-unstyled-hull-text)",
} as const satisfies StyleProperties;

export function resolveStyleProperties(
  authored: StyleProperties | undefined,
  constants: ResolvedStyleProperties
): ResolvedStyleProperties {
  return Object.fromEntries(
    STYLE_PROPERTIES.map(({ name }) => [name, authored?.[name] ?? constants[name]])
  ) as ResolvedStyleProperties;
}
