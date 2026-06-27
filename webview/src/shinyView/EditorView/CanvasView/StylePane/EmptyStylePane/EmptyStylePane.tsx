/**
 * @role [P] Presentational
 * @presents Empty style inspector scenario.
 */

import type { ReactElement } from "react";
import styles from "../StylePane.module.css";

export default function EmptyStylePane(): ReactElement {
  // @job render:structure
  return <div className={styles.emptySelection} aria-label="No selected diagram element" />;
}
