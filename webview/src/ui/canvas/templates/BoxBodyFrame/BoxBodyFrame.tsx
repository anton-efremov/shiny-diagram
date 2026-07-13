/**
 * Box body frame stacking validation and content in a flexible region.
 *
 * Places the optional `validation` slot before `children`, allowing the body to
 * grow and shrink while leaving overflow visible.
 *
 * Used by: class member compartments.
 */

import type { ReactElement, ReactNode } from "react";
import styles from "./BoxBodyFrame.module.css";

type BoxBodyFrameProps = {
  readonly validation?: ReactNode;
  readonly children: ReactNode;
};

export default function BoxBodyFrame({ validation, children }: BoxBodyFrameProps): ReactElement {
  return (
    <div className={styles.body}>
      {validation}
      {children}
    </div>
  );
}
