/**
 * @render Empty-state message overlay.
 */

import type { CSSProperties, ReactElement } from "react";
import styles from "./EmptyStateMessage.module.css";

type EmptyStateMessageProps = {
  readonly message: string;
  readonly stacking: number;
};

export default function EmptyStateMessage({
  message,
  stacking,
}: EmptyStateMessageProps): ReactElement {
  const style = { zIndex: stacking } satisfies CSSProperties;
  return (
    <p className={styles.message} style={style}>
      {message}
    </p>
  );
}
