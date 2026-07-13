/**
 * Text field for controlled single-line entry with pane and in-place treatments.
 *
 * Displays `value`, reports edits through `onChange`, and forwards focus loss
 * and keyboard input through `onBlur` and `onKeyDown`. `ariaLabel` supplies the
 * accessible name.
 *
 * Options:
 * - `disabled` — on prevents editing and shows unavailable treatment
 * - `invalid` — on exposes invalid state and error treatment
 * - `autoFocus` — on requests focus when the field mounts
 * - `hasEndAction` — on reserves trailing room for an overlaid action
 * - `appearance` — `pane` fills the available width at standard control height;
 *   `inline` inherits surrounding type and alignment on a transparent ground
 * - `situation` — absent uses the selected appearance's neutral treatment;
 *   `edgeLabel` uses light edge-text editing treatment; `edgeCaption` uses dark
 *   edge-text editing treatment
 */

import type { KeyboardEvent, ReactElement } from "react";
import styles from "./TextField.module.css";

type TextFieldProps = {
  readonly value: string;
  readonly disabled?: boolean;
  readonly invalid?: boolean;
  readonly ariaLabel?: string;
  readonly autoFocus?: boolean;
  readonly hasEndAction?: boolean;
  readonly appearance?: "pane" | "inline";
  readonly situation?: "edgeLabel" | "edgeCaption";
  readonly onChange: (value: string) => void;
  readonly onBlur?: () => void;
  readonly onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
};

export default function TextField({
  value,
  disabled = false,
  invalid = false,
  ariaLabel,
  autoFocus = false,
  hasEndAction = false,
  appearance = "pane",
  situation,
  onChange,
  onBlur,
  onKeyDown,
}: TextFieldProps): ReactElement {
  return (
    <input
      className={[
        hasEndAction ? styles.fieldWithEndAction : styles.field,
        appearance === "inline" ? styles.inline : "",
        situation === "edgeLabel"
          ? styles.edgeLabel
          : situation === "edgeCaption"
            ? styles.edgeCaption
            : "",
      ]
        .filter(Boolean)
        .join(" ")}
      value={value}
      disabled={disabled}
      aria-invalid={invalid}
      aria-label={ariaLabel}
      autoFocus={autoFocus}
      onChange={(event) => onChange(event.currentTarget.value)}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    />
  );
}
