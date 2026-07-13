/**
 * @render Box outline overlay.
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
