/**
 * Sticky-note surface framing content with movable-object treatment.
 *
 * Fills its host with `children`, uses `title` as the tooltip, and reports
 * activation through `onPress`.
 *
 * Options:
 * - `dragging` — off shows the ready-to-move cursor; on dims the surface and
 *   shows active dragging
 */

import type { MouseEvent, ReactElement, ReactNode } from "react";
import styles from "./StickyNoteSurfaceFrame.module.css";

type StickyNoteSurfaceFrameProps = {
  readonly title: string;
  readonly dragging: boolean;
  readonly children: ReactNode;
  readonly onPress: (event: MouseEvent<HTMLDivElement>) => void;
};

export default function StickyNoteSurfaceFrame({
  title,
  dragging,
  children,
  onPress,
}: StickyNoteSurfaceFrameProps): ReactElement {
  return (
    <div
      className={`${styles.frame} ${dragging ? styles.dragging : ""}`}
      title={title}
      onClick={onPress}
    >
      {children}
    </div>
  );
}
