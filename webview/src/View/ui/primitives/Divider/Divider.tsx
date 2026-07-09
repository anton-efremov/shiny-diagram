/**
 * @render Shared divider.
 */

import type { ReactElement } from "react";
import styles from "./Divider.module.css";

export default function Divider(): ReactElement {
  return <span className={styles.divider} aria-hidden="true" />;
}
