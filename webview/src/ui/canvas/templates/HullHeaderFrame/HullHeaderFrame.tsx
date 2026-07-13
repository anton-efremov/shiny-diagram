/**
 * Hull header frame holding one line of heading content.
 *
 * Places `children` in a fixed-height, full-width strip with an inset from the
 * hull edge.
 *
 * Used by: a namespace heading.
 */

import type { ReactElement, ReactNode } from "react";
import styles from "./HullHeaderFrame.module.css";

type HullHeaderFrameProps = {
  readonly children: ReactNode;
};

export default function HullHeaderFrame({ children }: HullHeaderFrameProps): ReactElement {
  return <header className={styles.header}>{children}</header>;
}
