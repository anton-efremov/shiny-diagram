/**
 * Styled box surface framing vertically arranged content with user values.
 *
 * Fills its host with `children`, uses `title` as the tooltip, applies `fill`,
 * `stroke`, `strokeWidth`, `lineStyle`, and `color` with base fallbacks, and
 * reports `onClick` when clicked. `placementCursor` selects the placement cursor.
 *
 * Lifecycle:
 * - `dragging` — on shows active dragging while retaining the surface appearance
 *   Used by: a class being moved
 * - `placementCursor` — on shows that relationship placement is available
 *   Used by: a class as a relationship source
 */

import type { CSSProperties, MouseEvent, ReactElement, ReactNode } from "react";
import styles from "./StyledBoxSurfaceFrame.module.css";

type StyledBoxSurfaceFrameProps = {
  readonly title: string;
  readonly fill?: string;
  readonly stroke?: string;
  readonly strokeWidth?: string;
  readonly lineStyle: "solid" | "dashed" | "dotted";
  readonly color?: string;
  readonly children: ReactNode;
  readonly dragging: boolean;
  readonly placementCursor: boolean;
  readonly onClick: (event: MouseEvent<HTMLDivElement>) => void;
};

export default function StyledBoxSurfaceFrame({
  title,
  fill,
  stroke,
  strokeWidth,
  lineStyle,
  color,
  dragging,
  placementCursor,
  children,
  onClick,
}: StyledBoxSurfaceFrameProps): ReactElement {
  const style = {
    "--styled-box-fill": fill,
    "--styled-box-stroke": stroke,
    "--styled-box-stroke-width": strokeWidth,
    "--styled-box-line-style": lineStyle,
    "--styled-box-color": color,
  } as CSSProperties;
  const className = [
    styles.frame,
    dragging ? styles.dragging : "",
    placementCursor ? styles.placementCursor : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className} style={style} title={title} onClick={onClick}>
      {children}
    </div>
  );
}
