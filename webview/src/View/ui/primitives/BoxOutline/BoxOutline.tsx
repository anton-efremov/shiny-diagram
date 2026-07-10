/**
 * @render Box outline overlay.
 */

import type { ReactElement } from "react";
import styles from "./BoxOutline.module.css";

type BoxOutlineProps = {
  readonly variant: "selected" | "selectedStripe" | "pending";
};

export default function BoxOutline({ variant }: BoxOutlineProps): ReactElement {
  const className =
    variant === "selected"
      ? styles.selected
      : variant === "selectedStripe"
        ? styles.selectedStripe
        : styles.pending;
  return <span className={className} />;
}
