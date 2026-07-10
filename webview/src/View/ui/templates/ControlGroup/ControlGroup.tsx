/**
 * @render Form control group layout.
 */

import type { ReactElement, ReactNode } from "react";
import styles from "./ControlGroup.module.css";

type ControlGroupProps = {
  readonly columns?: 1 | 2;
  readonly children: ReactNode;
};

export default function ControlGroup({ columns = 1, children }: ControlGroupProps): ReactElement {
  return (
    <div className={columns === 2 ? styles.twoColumnGroup : styles.oneColumnGroup}>{children}</div>
  );
}
