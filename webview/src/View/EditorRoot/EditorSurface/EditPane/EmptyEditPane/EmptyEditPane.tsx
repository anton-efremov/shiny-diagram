/**
 * @render Empty style inspector scenario.
 */

import type { ReactElement } from "react";
import styles from "./EmptyEditPane.module.css";

export default function EmptyEditPane(): ReactElement {
  return <div className={styles.emptySelection} aria-label="No selected diagram element" />;
}
