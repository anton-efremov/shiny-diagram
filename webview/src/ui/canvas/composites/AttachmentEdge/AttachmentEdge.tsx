import type { ReactElement } from "react";
import EdgePath from "../../primitives/EdgePath/EdgePath";
import styles from "./AttachmentEdge.module.css";

type AttachmentEdgeProps = {
  readonly d: string;
};

export default function AttachmentEdge({ d }: AttachmentEdgeProps): ReactElement {
  return (
    <g className={styles.edge}>
      <EdgePath d={d} lineKind="dashed" selected={false} tone="attachment" />
    </g>
  );
}
