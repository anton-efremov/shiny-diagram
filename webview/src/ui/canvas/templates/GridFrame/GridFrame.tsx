/**
 * Grid frame for workspace composition, canvas fill, and clipped shell hosting.
 *
 * Workspace form arranges `leading`, `content`, and `trailing` regions using
 * `leadingWidth` and names the region with `ariaLabel`. Canvas form fills its
 * host with `children`. Shell form clips `children` to a full-height region
 * named by `ariaLabel`.
 *
 * Options:
 * - `variant` — `workspace` renders the three-region grid, `canvas` renders a
 *   fill surface, and `shell` renders a clipped positioning frame
 * - `placementActive` — in canvas form, on shows the placement cursor
 */

import type { CSSProperties, ReactElement, ReactNode } from "react";
import styles from "./GridFrame.module.css";

type GridFrameProps =
  | {
      readonly variant: "workspace";
      readonly leading: ReactNode;
      readonly content: ReactNode;
      readonly trailing: ReactNode;
      readonly leadingWidth: number;
      readonly ariaLabel: string;
    }
  | {
      readonly variant: "canvas";
      readonly children: ReactNode;
      readonly placementActive?: boolean;
    }
  | {
      readonly variant: "shell";
      readonly children: ReactNode;
      readonly ariaLabel: string;
    };

export default function GridFrame(props: GridFrameProps): ReactElement {
  if (props.variant === "canvas") {
    const className = `${styles.grid} ${styles.canvas} ${props.placementActive ? styles.placement : ""}`;
    return <div className={className}>{props.children}</div>;
  }

  if (props.variant === "shell") {
    return (
      <section className={styles.shell} aria-label={props.ariaLabel}>
        {props.children}
      </section>
    );
  }

  const style = { "--grid-frame-leading-width": `${props.leadingWidth}px` } as CSSProperties;
  return (
    <section
      className={`${styles.grid} ${styles.workspace}`}
      style={style}
      aria-label={props.ariaLabel}
    >
      <div className={styles.leading}>{props.leading}</div>
      <div className={styles.content}>{props.content}</div>
      <div className={styles.trailing}>{props.trailing}</div>
    </section>
  );
}
