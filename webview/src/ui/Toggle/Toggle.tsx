import type { ReactElement } from "react";
import styles from "./Toggle.module.css";

export type ToggleOption<T extends string> = {
  readonly value: T;
  readonly label: string;
};

type ToggleProps<T extends string> = {
  options: readonly ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
};

/**
 * Segmented control — a pill-shaped group of mutually exclusive options,
 * with the active option highlighted.
 */
export default function Toggle<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: ToggleProps<T>): ReactElement {
  return (
    <div className={styles.toggle} role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={option.value === value ? styles.activeOption : styles.option}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
