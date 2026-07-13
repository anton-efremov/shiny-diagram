/**
 * Sticky-note surface framing content with movable-object treatment.
 *
 * Fills its host with `children`, uses `title` as the tooltip, and reports
 * `onClick` when clicked.
 *
 * Lifecycle:
 * - `dragging` — off shows the ready-to-move cursor; on dims the surface and
 *   shows active dragging. Used by: a note being moved
 */

import type { MouseEvent, ReactElement, ReactNode } from "react";
import styles from "./StickyNoteSurfaceFrame.module.css";

type StickyNoteSurfaceFrameProps = {
  readonly title: string;
  readonly children: ReactNode;
  readonly dragging: boolean;
  readonly onClick: (event: MouseEvent<HTMLDivElement>) => void;
};

export default function StickyNoteSurfaceFrame({
  title,
  dragging,
  children,
  onClick,
}: StickyNoteSurfaceFrameProps): ReactElement {
  return (
    <div
      className={`${styles.frame} ${dragging ? styles.dragging : ""}`}
      title={title}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
