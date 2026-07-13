/**
 * @render Transparent relationship hit target.
 */

import type { ReactElement } from "react";
import styles from "./EdgeHitPath.module.css";

type EdgeHitPathProps = {
  readonly d: string;
};

export default function EdgeHitPath({ d }: EdgeHitPathProps): ReactElement {
  return <path className={styles.path} d={d} />;
}
