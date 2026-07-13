/**
 * Inline text field for controlled single-line entry.
 *
 * Displays `value`, uses `ariaLabel` as its accessible name, reports edits
 * through `onChange`, and forwards focus loss and keyboard input through
 * `onBlur` and `onKeyDown`.
 *
 * Options:
 * - `invalid` — on shows invalid outline treatment
 * - `autoFocus` — on requests focus when the field mounts
 * - `hasEndAction` — on reserves trailing room for an overlaid action
 * - `tone` — `default` inherits its host treatment, `label` uses light edge-text
 *   editing treatment, and `multiplicity` uses dark caption editing treatment
 */

import type { KeyboardEvent, ReactElement } from "react";
import styles from "./InlineTextField.module.css";

type InlineTextFieldProps = {
  readonly value: string;
  readonly invalid: boolean;
  readonly ariaLabel: string;
  readonly autoFocus: boolean;
  readonly hasEndAction: boolean;
  readonly tone: "default" | "label" | "multiplicity";
  readonly onChange: (value: string) => void;
  readonly onBlur: () => void;
  readonly onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
};

export default function InlineTextField({
  value,
  invalid,
  ariaLabel,
  autoFocus,
  hasEndAction,
  tone,
  onChange,
  onBlur,
  onKeyDown,
}: InlineTextFieldProps): ReactElement {
  const className = [
    styles.field,
    hasEndAction ? styles.withEndAction : "",
    tone === "label" ? styles.label : tone === "multiplicity" ? styles.multiplicity : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <input
      className={className}
      value={value}
      aria-invalid={invalid}
      aria-label={ariaLabel}
      autoFocus={autoFocus}
      onChange={(event) => onChange(event.currentTarget.value)}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    />
  );
}
