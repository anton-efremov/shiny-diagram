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
 * Renders a segmented control for mutually exclusive options.
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
        <span
          key={option.value}
          role="button"
          tabIndex={0}
          aria-pressed={option.value === value}
          className={option.value === value ? styles.activeOption : styles.option}
          onClick={() => onChange(option.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            onChange(option.value);
          }}
        >
          {option.label}
        </span>
      ))}
    </div>
  );
}
