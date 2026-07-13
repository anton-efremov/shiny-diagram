/**
 * Pane section arranging optional heading and content.
 *
 * Centers `label` as a heading when nonempty and places `children` into equal,
 * shrinkable tracks.
 *
 * Options:
 * - `columns` — `1` stacks content in one centered track; `2` uses two equal
 *   centered tracks
 * - `spacingAfter` — `default` leaves the standard gap before the next section;
 *   `compact` reduces that following gap
 */

import type { ReactElement, ReactNode } from "react";
import styles from "./PaneSection.module.css";

type PaneSectionProps = {
  readonly label?: string;
  readonly columns?: 1 | 2;
  readonly spacingAfter?: "default" | "compact";
  readonly children?: ReactNode;
};

export default function PaneSection({
  label,
  columns = 1,
  spacingAfter = "default",
  children,
}: PaneSectionProps): ReactElement {
  return (
    <section
      className={`${styles.section} ${spacingAfter === "compact" ? styles.compactAfter : ""}`}
    >
      {label === undefined || label === "" ? null : <h2 className={styles.label}>{label}</h2>}
      <div className={columns === 2 ? styles.twoColumnContent : styles.oneColumnContent}>
        {children}
      </div>
    </section>
  );
}
