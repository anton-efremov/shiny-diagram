/**
 * @behavior Dismiss activation reporting.
 * @render Compact cross button.
 */

import type { ReactElement } from "react";
import { GLYPH_VIEW_BOX } from "../../../../shared/glyph";
import styles from "./DismissButton.module.css";

type DismissButtonProps = {
  readonly label: string;
  readonly small?: boolean;
  readonly onClick: () => void;
  readonly onMouseDown?: () => void;
};

export default function DismissButton({
  label,
  small = false,
  onClick,
  onMouseDown,
}: DismissButtonProps): ReactElement {
  return (
    <button
      type="button"
      className={small ? styles.small : styles.button}
      aria-label={label}
      title={label}
      onMouseDown={(event) => {
        event.preventDefault();
        onMouseDown?.();
      }}
      onClick={onClick}
    >
      <svg viewBox={GLYPH_VIEW_BOX} fill="none" aria-hidden="true" focusable="false">
        <path
          d="M5 5 11 11M11 5 5 11"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
