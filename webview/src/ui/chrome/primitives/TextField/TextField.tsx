/**
 * @behavior Text entry change routing.
 * @render Shared text field.
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
