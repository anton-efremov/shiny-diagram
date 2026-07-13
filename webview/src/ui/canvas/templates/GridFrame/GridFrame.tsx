/**
 * @render Dot-grid framing for a three-region workspace or fill canvas.
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
