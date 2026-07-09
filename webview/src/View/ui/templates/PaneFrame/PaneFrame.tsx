/**
 * @render Side pane frame.
 */

import type { CSSProperties, ReactElement, ReactNode } from "react";
import styles from "./PaneFrame.module.css";

type PaneFrameProps = {
  readonly width: number;
  readonly children: ReactNode;
};

export default function PaneFrame({ width, children }: PaneFrameProps): ReactElement {
  const frameStyle: CSSProperties & { "--pane-frame-width": string } = {
    "--pane-frame-width": `${width}px`,
  };

  return (
    <div className={styles.frame} style={frameStyle}>
      {children}
    </div>
  );
}
