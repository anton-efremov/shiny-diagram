/**
 * @render Selected relationship reconnect-point affordance.
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
