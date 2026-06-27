/**
 * @role [P] Presentational
 * @presents Invalid-syntax editor-state interface.
 */
import type { ReactElement } from "react";
import styles from "./ErrorView.module.css";
import type { EditorViewModel } from "../../views/schema";

type ErrorViewProps = {
  readonly view: Pick<Extract<EditorViewModel, { readonly status: "invalidSyntax" }>, "message">;
};

/**
 * Renders the invalid syntax editor interface.
 */
export default function ErrorView({ view }: ErrorViewProps): ReactElement {
  // @job render:structure
  return (
    <>
      <div className={styles.statusMessage}>⚠ Invalid Mermaid syntax: {view.message}</div>
      <div className={styles.errorCanvas}>
        <p className={styles.errorMessage}>{view.message}</p>
      </div>
    </>
  );
}
