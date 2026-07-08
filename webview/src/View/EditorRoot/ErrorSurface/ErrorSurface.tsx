/**
 * @render Invalid-syntax editor-state interface.
 */

import type { ReactElement } from "react";
import styles from "./ErrorSurface.module.css";

type ErrorSurfaceProps = {
  readonly errors: readonly string[];
};

export default function ErrorSurface({ errors }: ErrorSurfaceProps): ReactElement {
  const statusText = errors.length > 0 ? errors[0] : "Invalid syntax";

  return (
    <>
      <div className={styles.statusMessage}>Invalid Mermaid syntax: {statusText}</div>
      <div className={styles.errorCanvas}>
        <ul className={styles.errorList}>
          {errors.map((error) => (
            <li className={styles.errorMessage} key={error}>
              {error}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
