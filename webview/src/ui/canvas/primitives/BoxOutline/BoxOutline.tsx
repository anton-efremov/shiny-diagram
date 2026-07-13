/**
 * Box outline for hover, selection, and pending placement states.
 *
 * Expands the hover and selection outline around its host by `centerOffset`;
 * pending treatment stays on the host edge. The overlay never receives pointer
 * input.
 *
 * Modifiers:
 * - `variant` — when the outline appears:
 *   - `hover` appears only while the parent is hovered — e.g. a class, note, or
 *     namespace under the pointer
 *   - `selected` remains visible — e.g. the selected diagram surface
 *   - `pending` draws a dashed placement outline — e.g. a class awaiting
 *     placement
 */

import type { CSSProperties, ReactElement } from "react";
import styles from "./BoxOutline.module.css";

type BoxOutlineProps = {
  readonly centerOffset?: number;
  readonly variant: "hover" | "selected" | "pending";
};

export default function BoxOutline({ variant, centerOffset = 3 }: BoxOutlineProps): ReactElement {
  const className =
    variant === "hover" ? styles.hover : variant === "selected" ? styles.selected : styles.pending;
  const outlineStyle = { "--box-outline-center-offset": `${centerOffset}px` } as CSSProperties;
  return <span className={className} style={outlineStyle} />;
}
