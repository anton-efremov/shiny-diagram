/**
 * @render Labeled pane section.
 */

import type { ReactElement, ReactNode } from "react";
import styles from "./PaneSection.module.css";

type PaneSectionProps = {
  readonly label?: string;
  readonly columns?: 1 | 2;
  readonly children?: ReactNode;
};

export default function PaneSection({
  label,
  columns = 1,
  children,
}: PaneSectionProps): ReactElement {
  return (
    <section className={styles.section}>
      {label === undefined || label === "" ? null : <h2 className={styles.label}>{label}</h2>}
      <div className={columns === 2 ? styles.twoColumnContent : styles.oneColumnContent}>
        {children}
      </div>
    </section>
  );
}
