/**
 * Ghost edge line between two points with optional endpoint markers.
 *
 * Draws from `startPoint` to `endPoint` and links marker definitions named by
 * `startMarkerId` and `endMarkerId` when supplied.
 *
 * Options:
 * - `lineKind` — `solid` draws continuously; `dashed` uses the edge dash pattern
 * - `tone` — `accent` previews relationship placement; `attachment` previews
 *   attachment treatment
 */

import type { ReactElement } from "react";
import type { Point } from "../../../../shared/geometry";
import styles from "./EdgeGhostLine.module.css";

type EdgeGhostLineProps = {
  readonly startPoint: Point;
  readonly endPoint: Point;
  readonly lineKind: "solid" | "dashed";
  readonly tone: "accent" | "attachment";
  readonly startMarkerId?: string;
  readonly endMarkerId?: string;
};

export default function EdgeGhostLine({
  startPoint,
  endPoint,
  lineKind,
  tone,
  startMarkerId,
  endMarkerId,
}: EdgeGhostLineProps): ReactElement {
  const className = [styles.line, styles[tone], lineKind === "dashed" ? styles.dashed : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <line
      className={className}
      x1={startPoint.x}
      y1={startPoint.y}
      x2={endPoint.x}
      y2={endPoint.y}
      markerStart={startMarkerId ? `url(#${startMarkerId})` : undefined}
      markerEnd={endMarkerId ? `url(#${endMarkerId})` : undefined}
    />
  );
}
