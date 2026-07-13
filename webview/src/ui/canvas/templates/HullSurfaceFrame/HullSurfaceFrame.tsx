/**
 * Hull surface frame with user-supplied color and border values.
 *
 * Fills its host with `children`, uses `title` as the tooltip, applies `fill`,
 * `stroke`, `strokeWidth`, and `color` with neutral fallbacks. Pressing it
 * reports `onPointerDown`; clicking it reports `onPress`.
 *
 * Options:
 * - `lineStyle` — `solid`, `dashed`, or `dotted` selects the border pattern
 */

import type { CSSProperties, MouseEvent, ReactElement, ReactNode } from "react";
import styles from "./HullSurfaceFrame.module.css";

type HullSurfaceFrameProps = {
  readonly title: string;
  readonly fill?: string;
  readonly stroke?: string;
  readonly strokeWidth: string;
  readonly lineStyle: "solid" | "dashed" | "dotted";
  readonly color?: string;
  readonly children: ReactNode;
  readonly onPointerDown: () => void;
  readonly onPress: (event: MouseEvent<HTMLDivElement>) => void;
};

export default function HullSurfaceFrame({
  title,
  fill,
  stroke,
  strokeWidth,
  lineStyle,
  color,
  children,
  onPointerDown,
  onPress,
}: HullSurfaceFrameProps): ReactElement {
  const style = {
    "--hull-surface-fill": fill,
    "--hull-surface-stroke": stroke,
    "--hull-surface-stroke-width": strokeWidth,
    "--hull-surface-line-style": lineStyle,
    "--hull-surface-color": color,
  } as CSSProperties;
  return (
    <div
      className={styles.frame}
      style={style}
      title={title}
      onMouseDown={onPointerDown}
      onClick={onPress}
    >
      {children}
    </div>
  );
}
