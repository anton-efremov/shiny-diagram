/**
 * @render Styled box swatch.
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
    "--styled-box-stroke-dasharray"?: string;
  } = {
    "--styled-box-fill": styleValues.fill ?? undefined,
    "--styled-box-stroke": styleValues.stroke ?? undefined,
    "--styled-box-color": styleValues.color ?? undefined,
    "--styled-box-stroke-width": styleValues.strokeWidth ?? undefined,
    "--styled-box-stroke-dasharray": styleValues.strokeDasharray ?? undefined,
  };

  return (
    <div className={styles.swatch} style={swatchStyle} aria-label={label}>
      {styleValues.strokeWidth || styleValues.strokeDasharray ? (
        <svg className={styles.lineSample} viewBox="0 0 44 10" aria-hidden="true" focusable="false">
          <path
            d="M2 5h40"
            stroke="currentColor"
            strokeWidth={styleValues.strokeWidth ?? "1px"}
            strokeDasharray={styleValues.strokeDasharray ?? undefined}
            strokeLinecap="round"
          />
        </svg>
      ) : null}
      <span className={styles.label}>{label}</span>
    </div>
  );
}
