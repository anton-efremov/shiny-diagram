/**
 * Control group arranging related children in a uniform grid.
 *
 * Places `children` into equal, shrinkable tracks spanning the available width.
 *
 * Options:
 * - `columns` — `1` stacks children; `2` arranges two equal columns
 * - `spacing` — `default` keeps compact gaps; `wide` doubles the gap
 */

import type { ReactElement, ReactNode } from "react";
import styles from "./ControlGroup.module.css";

type ControlGroupProps = {
  readonly columns?: 1 | 2;
  readonly spacing?: "default" | "wide";
  readonly children: ReactNode;
};

export default function ControlGroup({
  columns = 1,
  spacing = "default",
  children,
}: ControlGroupProps): ReactElement {
  const columnClass = columns === 2 ? styles.twoColumnGroup : styles.oneColumnGroup;
  const className = spacing === "wide" ? `${columnClass} ${styles.wideSpacing}` : columnClass;

  return <div className={className}>{children}</div>;
}
