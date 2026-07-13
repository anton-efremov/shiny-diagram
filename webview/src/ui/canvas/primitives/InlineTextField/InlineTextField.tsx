/**
 * @behavior Routes browser text-entry events without owning commit state.
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
