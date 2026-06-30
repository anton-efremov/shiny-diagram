/**
 * @render Empty style inspector scenario.
 */

import type { ReactElement } from "react";
import styles from "./EmptyStylePane.module.css";

export default function EmptyStylePane(): ReactElement {
  return <div className={styles.emptySelection} aria-label="No selected diagram element" />;
}
