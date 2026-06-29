/**
 * @role [P] Presentational
 * @presents Invalid-syntax editor-state interface.
 */
import type { ReactElement } from "react";
import styles from "./ErrorView.module.css";

type ErrorViewProps = {
  readonly message: string;
};

export default function ErrorView({ message }: ErrorViewProps): ReactElement {
  return (
    <>
      <div className={styles.statusMessage}>⚠ Invalid Mermaid syntax: {message}</div>
      <div className={styles.errorCanvas}>
        <p className={styles.errorMessage}>{message}</p>
      </div>
    </>
  );
}
