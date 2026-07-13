/**
 * Field grid aligning labeled controls across rows.
 *
 * Renders `rows` as label-and-control pairs; each row may align its control at
 * the center or top, and label text preserves authored line breaks.
 *
 * Options:
 * - `inset` — on adds horizontal inset around the complete grid
 * - `controlWidth` — `full` fills the control track, `half` centers at half
 *   width, and `wide` centers at four-fifths width
 * - `labelWidth` — `compact` uses the narrow label track; `standard` uses the
 *   wider track
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
  readonly controlWidth?: "full" | "half" | "wide";
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
          <div
            className={
              controlWidth === "half"
                ? styles.halfControl
                : controlWidth === "wide"
                  ? styles.wideControl
                  : styles.control
            }
          >
            {row.control}
          </div>
        </div>
      ))}
    </div>
  );
}
