/**
 * @behavior Pane collapse toggle reporting.
 * @render Edge-mounted pane collapse tab.
 */

import type { ReactElement } from "react";
import { GLYPH_VIEW_BOX } from "../../../../shared/glyph";
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
      <svg
        className={collapsed ? styles.inward : styles.outward}
        viewBox={GLYPH_VIEW_BOX}
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="m6 4 4 4-4 4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
