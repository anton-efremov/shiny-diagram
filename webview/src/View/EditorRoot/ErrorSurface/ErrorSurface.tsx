/**
 * @render Invalid-syntax editor-state interface.
 */

import type { ReactElement } from "react";
import styles from "./ErrorSurface.module.css";

type ErrorSurfaceProps = {
  readonly message: string;
};

export default function ErrorSurface({ message }: ErrorSurfaceProps): ReactElement {
  return (
    <>
      <div className={styles.statusMessage}>⚠ Invalid Mermaid syntax: {message}</div>
      <div className={styles.errorCanvas}>
        <p className={styles.errorMessage}>{message}</p>
      </div>
    </>
  );
}
