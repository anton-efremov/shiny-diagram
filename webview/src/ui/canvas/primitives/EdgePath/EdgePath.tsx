/**
 * Edge path with user styling, endpoint linkage, and selection treatment.
 *
 * Draws `d`, using `stroke` and `strokeWidth` when supplied, and links marker
 * definitions named by `startMarkerId` and `endMarkerId`. Selection and
 * attachment treatment replace user stroke presentation.
 *
 * Options:
 * - `lineKind` — `solid` draws continuously; `dashed` uses the edge dash pattern
 * - `selected` — on uses the emphasized selection stroke
 * - `tone` — `default` permits user stroke values; `attachment` uses fixed
 *   attachment identity
 */

import type { CSSProperties, ReactElement } from "react";
import styles from "./EdgePath.module.css";

type EdgePathProps = {
  readonly d: string;
  readonly lineKind: "solid" | "dashed";
  readonly selected: boolean;
  readonly tone?: "default" | "attachment";
  readonly startMarkerId?: string;
  readonly endMarkerId?: string;
  readonly stroke?: string;
  readonly strokeWidth?: number | string;
};

export default function EdgePath({
  d,
  lineKind,
  selected,
  tone = "default",
  startMarkerId,
  endMarkerId,
  stroke,
  strokeWidth,
}: EdgePathProps): ReactElement {
  const className = [
    styles.path,
    lineKind === "dashed" ? styles.dashed : "",
    tone === "attachment" ? styles.attachment : "",
    selected ? styles.selected : "",
  ]
    .filter(Boolean)
    .join(" ");
  const style = {
    "--edge-path-stroke": stroke,
    "--edge-path-stroke-width": strokeWidth,
  } as CSSProperties;

  return (
    <path
      className={className}
      style={style}
      d={d}
      markerStart={startMarkerId ? `url(#${startMarkerId})` : undefined}
      markerEnd={endMarkerId ? `url(#${endMarkerId})` : undefined}
    />
  );
}
