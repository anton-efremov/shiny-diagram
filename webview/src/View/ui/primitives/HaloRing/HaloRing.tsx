/**
 * @render Box halo overlay.
 */

import type { CSSProperties, ReactElement } from "react";
import styles from "./HaloRing.module.css";

type HaloRingProps = {
  readonly tint: string;
};

export default function HaloRing({ tint }: HaloRingProps): ReactElement {
  return <span className={styles.halo} style={{ "--halo-tint": tint } as CSSProperties} />;
}
