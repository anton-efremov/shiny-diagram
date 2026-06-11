import type { ReactElement } from "react";
import styles from "./StylePane.module.css";

/**
 * Renders the inactive style pane shell for the empty-selection editor state.
 */
export default function StylePane(): ReactElement {
  return (
    <aside className={styles.stylePane} aria-label="Styles pane">
      <header className={styles.header}>Styles</header>
      <div className={styles.emptySelection} aria-label="No selected diagram element" />
    </aside>
  );
}
