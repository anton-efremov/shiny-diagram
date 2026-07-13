/**
 * Canvas grid frame filling its host with diagram content.
 *
 * Fills the available region with `children` over the canvas grid;
 * `placementCursor` selects the placement cursor.
 *
 * Lifecycle:
 * - `placementCursor` — on shows that placement is available
 *   Used by: relationship placement over the canvas
 */

import type { ReactElement, ReactNode } from "react";
import styles from "./CanvasGridFrame.module.css";

type CanvasGridFrameProps = {
  readonly children: ReactNode;
  readonly placementCursor?: boolean;
};

export default function CanvasGridFrame({
  children,
  placementCursor = false,
}: CanvasGridFrameProps): ReactElement {
  return (
    <div className={`${styles.frame} ${placementCursor ? styles.placement : ""}`}>{children}</div>
  );
}
