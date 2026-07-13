/**
 * Swatch preview of box color and border styling.
 *
 * Applies the supplied fill, stroke, text color, stroke width, and solid-or-
 * dashed interpretation from `styleValues`, falling back independently for
 * omitted values. The single-line `label` is both visible content and the
 * accessible name; overflow ends in an ellipsis. Used by: attached-class and
 * saved-style previews.
 */

import type { CSSProperties, ReactElement } from "react";
import type { StyleProperties } from "../../../../shared/style";
import styles from "./StyledBoxSwatch.module.css";

type StyledBoxSwatchProps = {
  readonly styleValues: Partial<StyleProperties>;
  readonly label: string;
};

export default function StyledBoxSwatch({
  styleValues,
  label,
}: StyledBoxSwatchProps): ReactElement {
  const swatchStyle: CSSProperties & {
    "--styled-box-fill"?: string;
    "--styled-box-stroke"?: string;
    "--styled-box-color"?: string;
    "--styled-box-stroke-width"?: string;
    "--styled-box-border-style"?: "solid" | "dashed";
  } = {
    "--styled-box-fill": styleValues.fill ?? undefined,
    "--styled-box-stroke": styleValues.stroke ?? undefined,
    "--styled-box-color": styleValues.color ?? undefined,
    "--styled-box-stroke-width": styleValues.strokeWidth ?? undefined,
    "--styled-box-border-style": toBorderStyle(styleValues.strokeDasharray),
  };

  return (
    <div className={styles.swatch} style={swatchStyle} aria-label={label}>
      <span className={styles.label}>{label}</span>
    </div>
  );
}

function toBorderStyle(strokeDasharray: string | null | undefined): "solid" | "dashed" {
  return strokeDasharray === undefined ||
    strokeDasharray === null ||
    strokeDasharray === "" ||
    strokeDasharray === "0" ||
    strokeDasharray === "none"
    ? "solid"
    : "dashed";
}
