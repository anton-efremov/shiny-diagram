/**
 * @render Selected class summary.
 */

import type { ReactElement } from "react";
import styles from "./ClassSelectionSummary.module.css";

type ClassSelectionSummaryProps =
  | {
      readonly kind: "single";
      readonly label: string;
      readonly stereotype?: string;
    }
  | {
      readonly kind: "multi";
      readonly count: number;
    };

export default function ClassSelectionSummary(props: ClassSelectionSummaryProps): ReactElement {
  return props.kind === "single" ? (
    <div className={styles.selectionSummary}>
      <div className={styles.selectionAccent} aria-hidden="true" />
      <div className={styles.selectionCopy}>
        <div className={styles.selectionType}>Class</div>
        <h2 className={styles.className}>{props.label}</h2>
        {props.stereotype ? (
          <div className={styles.stereotype}>&lt;&lt;{props.stereotype}&gt;&gt;</div>
        ) : null}
      </div>
    </div>
  ) : (
    <div className={styles.multiSelectionSummary}>
      <div className={styles.selectionType}>Selection</div>
      <h2 className={styles.className}>{props.count} classes selected</h2>
    </div>
  );
}
