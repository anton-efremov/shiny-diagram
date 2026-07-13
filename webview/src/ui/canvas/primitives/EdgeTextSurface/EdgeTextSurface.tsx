/**
 * @render Relationship text pill at a consumer-positioned origin.
 */

import type { ReactElement } from "react";
import styles from "./EdgeTextSurface.module.css";

type EdgeTextSurfaceProps = {
  readonly text: string;
  readonly variant: "label" | "multiplicity";
};

const MIN_WIDTH = 24;
const CHARACTER_WIDTH = 7;
const HORIZONTAL_PADDING = 12;
const HEIGHT = 18;

export default function EdgeTextSurface({ text, variant }: EdgeTextSurfaceProps): ReactElement {
  const surfaceWidth = Math.max(MIN_WIDTH, text.length * CHARACTER_WIDTH + HORIZONTAL_PADDING);
  const className = variant === "label" ? styles.label : styles.multiplicity;

  return (
    <>
      <rect
        x={-surfaceWidth / 2}
        y={-HEIGHT / 2}
        width={surfaceWidth}
        height={HEIGHT}
        className={`${styles.surface} ${className}`}
      />
      <text
        x={0}
        y={0}
        className={`${styles.text} ${className}`}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {text}
      </text>
    </>
  );
}
