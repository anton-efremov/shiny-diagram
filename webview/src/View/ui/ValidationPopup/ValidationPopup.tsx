/**
 * @render Inline validation messages.
 */

import type { ReactElement } from "react";
import styles from "./ValidationPopup.module.css";

type ValidationPopupProps = {
  readonly messages: readonly string[];
  readonly onDismiss: () => void;
};

export default function ValidationPopup({
  messages,
  onDismiss,
}: ValidationPopupProps): ReactElement {
  return (
    <div className={styles.popup} role="alert">
      <div className={styles.messages}>
        {messages.map((message) => (
          <div key={message} className={styles.message}>
            {message}
          </div>
        ))}
      </div>
      <button type="button" className={styles.dismiss} onClick={onDismiss} aria-label="Dismiss">
        x
      </button>
    </div>
  );
}
