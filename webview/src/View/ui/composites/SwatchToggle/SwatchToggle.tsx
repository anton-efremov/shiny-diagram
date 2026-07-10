/**
 * @behavior Swatch toggle activation routing.
 * @render Pressable styled-box swatch.
 */

import type { ReactElement } from "react";
import type { StyleProperties } from "../../../../shared/style";
import StyledBoxSwatch from "../../primitives/StyledBoxSwatch/StyledBoxSwatch";
import styles from "./SwatchToggle.module.css";

type SwatchToggleProps = {
  readonly styleValues: Partial<StyleProperties>;
  readonly label: string;
  readonly pressed: boolean;
  readonly disabled?: boolean;
  readonly onClick?: () => void;
};

export default function SwatchToggle({
  styleValues,
  label,
  pressed,
  disabled = false,
  onClick,
}: SwatchToggleProps): ReactElement {
  return (
    <button
      type="button"
      className={styles.toggle}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
    >
      <StyledBoxSwatch styleValues={styleValues} label={label} />
    </button>
  );
}
