/**
 * Endpoint handle marking a visible relationship reconnect point.
 *
 * Centers a noninteractive circular handle at `point`.
 *
 * Options:
 * - `visible` — on renders the handle; off renders nothing
 */

import type { ReactElement } from "react";
import type { Point } from "../../../../shared/geometry";
import styles from "./EdgeEndpointHandle.module.css";

type EdgeEndpointHandleProps = {
  readonly point: Point;
  readonly visible: boolean;
};

export default function EdgeEndpointHandle({
  point,
  visible,
}: EdgeEndpointHandleProps): ReactElement | null {
  return visible ? <circle className={styles.handle} cx={point.x} cy={point.y} r={2.5} /> : null;
}
