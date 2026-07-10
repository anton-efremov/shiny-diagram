/**
 * @render Label/control row grid.
 */

import type { ReactElement, ReactNode } from "react";
import styles from "./FieldGrid.module.css";

type FieldGridRow = {
  readonly label: string;
  readonly control: ReactNode;
};

type FieldGridProps = {
  readonly rows: readonly FieldGridRow[];
};

export default function FieldGrid({ rows }: FieldGridProps): ReactElement {
  return (
    <div className={styles.grid}>
      {rows.map((row) => (
        <div key={row.label} className={styles.row}>
          <span className={styles.label}>{row.label}</span>
          <div className={styles.control}>{row.control}</div>
        </div>
      ))}
    </div>
  );
}
