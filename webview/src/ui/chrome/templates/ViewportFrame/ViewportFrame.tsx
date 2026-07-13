import type { ReactElement, ReactNode } from "react";
import styles from "./ViewportFrame.module.css";

type ViewportFrameProps = {
  readonly children: ReactNode;
};

export default function ViewportFrame({ children }: ViewportFrameProps): ReactElement {
  return <div className={styles.frame}>{children}</div>;
}
