/**
 * @render Box outline overlay.
 */

import type { ReactElement } from "react";
import styles from "./BoxOutline.module.css";

type BoxOutlineProps = {
  readonly variant: "selected" | "pending";
};

export default function BoxOutline({ variant }: BoxOutlineProps): ReactElement {
  return <span className={variant === "selected" ? styles.selected : styles.pending} />;
}
