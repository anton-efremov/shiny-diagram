/**
 * @render Point-to-point ghost edge stroke.
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
