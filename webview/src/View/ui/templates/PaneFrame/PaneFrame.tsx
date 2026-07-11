/**
 * @render Side pane frame.
 */

import type { CSSProperties, ReactElement, ReactNode } from "react";
import styles from "./PaneFrame.module.css";

type PaneFrameProps = {
  readonly width: number;
  readonly collapsed?: boolean;
  readonly edgeControl?: ReactNode;
  readonly children: ReactNode;
};

export default function PaneFrame({
  width,
  collapsed = false,
  edgeControl,
  children,
}: PaneFrameProps): ReactElement {
  const frameStyle: CSSProperties & { "--pane-frame-width": string } = {
    "--pane-frame-width": `${width}px`,
  };

  return (
    <div className={collapsed ? styles.collapsedShell : styles.shell} style={frameStyle}>
      {edgeControl}
      {collapsed ? null : <div className={styles.frame}>{children}</div>}
    </div>
  );
}
