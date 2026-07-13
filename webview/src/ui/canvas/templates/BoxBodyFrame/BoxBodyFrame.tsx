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
