/**
 * @render Shared divider.
 */

import type { ReactElement } from "react";
import type { CSSProperties } from "react";
import styles from "./Divider.module.css";

type DividerProps = {
  readonly color?: string;
  readonly thickness?: string;
  readonly lineStyle?: "solid" | "dashed" | "dotted";
};

export default function Divider({ color, thickness, lineStyle }: DividerProps): ReactElement {
  const dynamicVars = {
    "--divider-color": color,
    "--divider-thickness": thickness,
    "--divider-line-style": lineStyle,
  } as CSSProperties;
  return <span className={styles.divider} style={dynamicVars} aria-hidden="true" />;
}
