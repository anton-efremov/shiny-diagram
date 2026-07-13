/**
 * Inline text field for controlled single-line entry.
 *
 * Displays `value`, uses `ariaLabel` as its accessible name, reports edits
 * through `onChange`, and forwards focus loss and keyboard input through
 * `onBlur` and `onKeyDown`.
 *
 * Lifecycle:
 * - `invalid` — on shows invalid outline treatment
 *   Used by: class, namespace, and relationship text with validation messages
 *
 * Modifiers:
 * - `autoFocus` — on requests focus when the field mounts
 *   Used by: newly opened canvas text editors
 * - `hasEndAction` — on reserves trailing room for an overlaid action
 *   Used by: cancellable canvas text editors
 * - `tone` — the field's ground and text treatment:
 *   - `default` inherits its host treatment — e.g. class and namespace text
 *   - `label` uses light edge-text editing treatment — e.g. a relationship label
 *   - `multiplicity` uses dark caption editing treatment — e.g. an endpoint
 *     multiplicity
 */

import type { KeyboardEvent, ReactElement } from "react";
import styles from "./InlineTextField.module.css";

type InlineTextFieldProps = {
  readonly value: string;
  readonly ariaLabel: string;
  readonly invalid: boolean;
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
