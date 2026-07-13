/**
 * Edge-text pill centered at the current drawing origin.
 *
 * Renders `text` on a single line and sizes its pill from character count, with
 * a fixed minimum width and height. Pointer input remains available on both text
 * and surface.
 *
 * Options:
 * - `variant` — `label` uses light label treatment; `multiplicity` uses dark
 *   caption treatment
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
