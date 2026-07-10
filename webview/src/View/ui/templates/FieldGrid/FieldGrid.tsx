/**
 * @render Label/control row grid.
 */

import type { ReactElement, ReactNode } from "react";
import styles from "./FieldGrid.module.css";

type FieldGridRow = {
  readonly label: string;
  readonly control: ReactNode;
  readonly alignment?: "center" | "start";
};

type FieldGridProps = {
  readonly rows: readonly FieldGridRow[];
  readonly inset?: boolean;
  readonly controlWidth?: "full" | "half";
  readonly labelWidth?: "compact" | "standard";
};

export default function FieldGrid({
  rows,
  inset = false,
  controlWidth = "full",
  labelWidth = "compact",
}: FieldGridProps): ReactElement {
  return (
    <div className={inset ? styles.insetGrid : styles.grid}>
      {rows.map((row) => (
        <div
          key={row.label}
          className={
            labelWidth === "standard"
              ? row.alignment === "start"
                ? styles.standardStartAlignedRow
                : styles.standardRow
              : row.alignment === "start"
                ? styles.startAlignedRow
                : styles.row
          }
        >
          <span className={styles.label}>{row.label}</span>
          <div className={controlWidth === "half" ? styles.halfControl : styles.control}>
            {row.control}
          </div>
        </div>
      ))}
    </div>
  );
}
