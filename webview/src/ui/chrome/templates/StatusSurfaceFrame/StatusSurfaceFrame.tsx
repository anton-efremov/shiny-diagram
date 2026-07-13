import type { ReactElement, ReactNode } from "react";
import styles from "./StatusSurfaceFrame.module.css";

type StatusSurfaceFrameProps = {
  readonly status: ReactNode;
  readonly label?: string;
  readonly items: readonly ReactNode[];
  readonly variant: "error-list" | "code-list";
};

export default function StatusSurfaceFrame({
  status,
  label,
  items,
  variant,
}: StatusSurfaceFrameProps): ReactElement {
  return (
    <>
      <div className={styles.status}>{status}</div>
      <div className={styles.canvas}>
        {label ? <p className={styles.label}>{label}</p> : null}
        <ul className={`${styles.list} ${styles[variant]}`}>
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    </>
  );
}
