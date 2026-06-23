/**
 * @role [P] Presentational
 * @presents Invalid-syntax editor-state interface.
 */
import type { ReactElement } from "react";
import styles from "../EditorView.module.css";
import type { ErrorViewModel } from "./views";

type ErrorViewProps = {
  readonly view: ErrorViewModel;
};

/**
 * Renders the invalid syntax editor interface.
 */
export default function ErrorView({ view }: ErrorViewProps): ReactElement {
  // @job render:layout
  return (
    <>
      <div className={styles.statusMessage}>⚠ Invalid Mermaid syntax: {view.message}</div>
      <div className={styles.errorCanvas}>
        <p className={styles.errorMessage}>{view.message}</p>
      </div>
    </>
  );
}
