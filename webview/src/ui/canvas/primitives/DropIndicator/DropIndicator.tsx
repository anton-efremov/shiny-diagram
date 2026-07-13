import type { ReactElement } from "react";
import styles from "./DropIndicator.module.css";

export default function DropIndicator(): ReactElement {
  return <span className={styles.indicator} aria-hidden="true" />;
}
