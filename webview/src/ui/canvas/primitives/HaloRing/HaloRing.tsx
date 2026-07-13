/**
 * Halo extending beyond a box without intercepting input.
 *
 * Paints behind or among siblings at `stacking`, using `tint` when supplied and
 * otherwise the selected tone's default.
 *
 * Options:
 * - `tone` — `canvas` matches the canvas ground; `faint` uses a translucent wash
 */

import type { CSSProperties, ReactElement } from "react";
import styles from "./HaloRing.module.css";

type HaloRingProps = {
  readonly tint?: string;
  readonly tone?: "canvas" | "faint";
  readonly stacking: number;
};

export default function HaloRing({ tint, tone = "faint", stacking }: HaloRingProps): ReactElement {
  const style = {
    "--halo-ring-tint": tint,
    "--halo-ring-stacking": stacking,
  } as CSSProperties;
  return <span className={`${styles.halo} ${styles[tone]}`} style={style} />;
}
