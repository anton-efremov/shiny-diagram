/**
 * Box header frame centering primary content between optional vertical slots.
 *
 * Maintains `minHeight`, places `validation` first, then full-width `leading`,
 * `primary`, and `trailing` slots, and draws the lower separator from
 * `separatorColor`, `separatorThickness`, and `separatorLineStyle` with base
 * fallbacks. Used by: the title region of a class.
 */

import type { CSSProperties, ReactElement, ReactNode } from "react";
import styles from "./BoxHeaderFrame.module.css";

type BoxHeaderFrameProps = {
  readonly validation?: ReactNode;
  readonly leading?: ReactNode;
  readonly primary: ReactNode;
  readonly trailing?: ReactNode;
  readonly separatorColor?: string;
  readonly separatorThickness?: string;
  readonly separatorLineStyle: "solid" | "dashed" | "dotted";
  readonly minHeight: number;
};

export default function BoxHeaderFrame({
  minHeight,
  separatorColor,
  separatorThickness,
  separatorLineStyle,
  validation,
  leading,
  primary,
  trailing,
}: BoxHeaderFrameProps): ReactElement {
  const style = {
    "--box-header-min-height": `${minHeight}px`,
    "--box-header-separator-color": separatorColor,
    "--box-header-separator-thickness": separatorThickness,
    "--box-header-separator-line-style": separatorLineStyle,
  } as CSSProperties;

  return (
    <header className={styles.header} style={style}>
      {validation}
      {leading ? <div className={styles.leading}>{leading}</div> : null}
      <div className={styles.primary}>{primary}</div>
      {trailing ? <div className={styles.trailing}>{trailing}</div> : null}
    </header>
  );
}
