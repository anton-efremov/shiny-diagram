/**
 * @render Full-viewport, pointer-transparent SVG overlay frame.
 */

import type { CSSProperties, ReactElement, ReactNode } from "react";
import styles from "./CanvasOverlayFrame.module.css";

type CanvasOverlayFrameProps = {
  readonly stacking: number;
  readonly children: ReactNode;
};

export default function CanvasOverlayFrame({
  stacking,
  children,
}: CanvasOverlayFrameProps): ReactElement {
  const style = { "--canvas-overlay-stacking": stacking } as CSSProperties;
  return (
    <svg className={styles.frame} style={style} aria-hidden="true">
      {children}
    </svg>
  );
}
