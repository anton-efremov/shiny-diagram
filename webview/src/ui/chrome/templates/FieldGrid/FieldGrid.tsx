/**
 * Field grid aligning labeled controls across rows.
 *
 * Renders `rows` as label-and-control pairs; each row may align its control at
 * the center or top, and label text preserves authored line breaks.
 *
 * Modifiers:
 * - `variant` — the designed grid arrangement:
 *   - `standard` uses the wider label track and full control width — e.g. a
 *     diagram style name
 *   - `inset` adds horizontal inset to that arrangement — e.g. relationship
 *     multiplicities and edge shape
 *   - `compact` combines inset, a narrow label track, and a centered half-width
 *     control — e.g. class and namespace style properties
 *   - `compactControl` uses the wider label track with a centered half-width
 *     control — e.g. diagram style properties
 *   - `compactLabel` combines inset and the narrow label track with a full-width
 *     control — e.g. class header text
 */

import type { ReactElement, ReactNode } from "react";
import styles from "./FieldGrid.module.css";

/**
 * Label-and-control entry arranged by FieldGrid.
 *
 * `label` names the row, `control` supplies its content, and `alignment` may
 * place that content at the center or at the row's start edge.
 */
export type FieldGridRow = {
  readonly label: string;
  readonly control: ReactNode;
  readonly alignment?: "center" | "start";
};

type FieldGridProps = {
  readonly rows: readonly FieldGridRow[];
  readonly variant?: "standard" | "inset" | "compact" | "compactControl" | "compactLabel";
};

export default function FieldGrid({ rows, variant = "standard" }: FieldGridProps): ReactElement {
  const isInset = variant === "inset" || variant === "compact" || variant === "compactLabel";
  const hasCompactLabel = variant === "compact" || variant === "compactLabel";
  const hasCompactControl = variant === "compact" || variant === "compactControl";

  return (
    <div className={isInset ? styles.insetGrid : styles.grid}>
      {rows.map((row) => (
        <div
          key={row.label}
          className={
            hasCompactLabel
              ? row.alignment === "start"
                ? styles.startAlignedRow
                : styles.row
              : row.alignment === "start"
                ? styles.standardStartAlignedRow
                : styles.standardRow
          }
        >
          <span className={styles.label}>{row.label}</span>
          <div className={hasCompactControl ? styles.halfControl : styles.control}>
            {row.control}
          </div>
        </div>
      ))}
    </div>
  );
}
