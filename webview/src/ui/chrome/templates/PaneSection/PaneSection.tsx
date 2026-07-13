/**
 * Pane section arranging optional heading and content.
 *
 * Centers `label` as a heading when nonempty and places `children` into equal,
 * shrinkable tracks.
 *
 * Modifiers:
 * - `columns` — `1` stacks content in one centered track; `2` uses two equal
 *   centered tracks. Used by: edit-pane fields and paired actions
 * - `spacingAfter` — `default` leaves the standard gap before the next section;
 *   `compact` reduces that following gap. Used by: dense style and relationship
 *   sections
 */

import type { ReactElement, ReactNode } from "react";
import styles from "./PaneSection.module.css";

type PaneSectionProps = {
  readonly label?: string;
  readonly children?: ReactNode;
  readonly columns?: 1 | 2;
  readonly spacingAfter?: "default" | "compact";
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
