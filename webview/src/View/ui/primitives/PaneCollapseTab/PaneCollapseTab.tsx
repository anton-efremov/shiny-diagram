/**
 * @behavior Pane collapse toggle reporting.
 * @render Edge-mounted pane collapse tab.
 */

import type { ReactElement } from "react";
import styles from "./PaneCollapseTab.module.css";

type PaneCollapseTabProps = {
  readonly collapsed: boolean;
  readonly onToggle: () => void;
};

export default function PaneCollapseTab({
  collapsed,
  onToggle,
}: PaneCollapseTabProps): ReactElement {
  return (
    <button
      type="button"
      className={styles.tab}
      aria-label={collapsed ? "Expand pane" : "Collapse pane"}
      title={collapsed ? "Expand pane" : "Collapse pane"}
      onClick={onToggle}
    >
      <span className={collapsed ? styles.inward : styles.outward} aria-hidden="true" />
    </button>
  );
}
