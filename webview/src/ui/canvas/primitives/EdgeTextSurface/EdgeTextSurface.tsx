/**
 * Edge-text pill sized to its text.
 *
 * Renders `text` on a single line and sizes itself to its text with fixed
 * minimums, centered on the point where the consumer places it. Pointer input
 * remains available on both text and surface.
 *
 * Modifiers:
 * - `variant` — `label` uses light label treatment; `multiplicity` uses dark
 *   caption treatment. Used by: relationship labels and endpoint multiplicities
 */

import { useLayoutEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import styles from "./EdgeTextSurface.module.css";

type EdgeTextSurfaceProps = {
  readonly text: string;
  readonly variant: "label" | "multiplicity";
};

const MIN_WIDTH = 24;
const HORIZONTAL_PADDING = 12;
const HEIGHT = 18;

export default function EdgeTextSurface({ text, variant }: EdgeTextSurfaceProps): ReactElement {
  const textRef = useRef<SVGTextElement>(null);
  const [textWidth, setTextWidth] = useState(0);
  const surfaceWidth = Math.max(MIN_WIDTH, textWidth + HORIZONTAL_PADDING);
  const className = variant === "label" ? styles.label : styles.multiplicity;

  useLayoutEffect(() => {
    setTextWidth(textRef.current?.getComputedTextLength() ?? 0);
  }, [text, variant]);

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
        ref={textRef}
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
