/**
 * Box outline for hover, selection, and pending placement states.
 *
 * Expands the hover and selection outline around its host by `centerOffset`;
 * pending treatment stays on the host edge. The overlay never receives pointer
 * input.
 *
 * Options:
 * - `variant` — `hover` appears only while the parent is hovered, `selected`
 *   remains visible, and `pending` draws a dashed placement outline
 */

import type { CSSProperties, ReactElement } from "react";
import styles from "./BoxOutline.module.css";

type BoxOutlineProps = {
  readonly variant: "hover" | "selected" | "pending";
  readonly centerOffset?: string;
};

export default function BoxOutline({
  variant,
  centerOffset = "3px",
}: BoxOutlineProps): ReactElement {
  const className =
    variant === "hover" ? styles.hover : variant === "selected" ? styles.selected : styles.pending;
  const outlineStyle = { "--box-outline-center-offset": centerOffset } as CSSProperties;
  return <span className={className} style={outlineStyle} />;
}
