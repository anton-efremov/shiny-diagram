/**
 * @render Box outline overlay.
 */

import type { ReactElement } from "react";
import styles from "./BoxOutline.module.css";

type BoxOutlineProps = {
  readonly variant: "hover" | "selected" | "pending";
};

export default function BoxOutline({ variant }: BoxOutlineProps): ReactElement {
  const className =
    variant === "hover" ? styles.hover : variant === "selected" ? styles.selected : styles.pending;
  return <span className={className} />;
}
