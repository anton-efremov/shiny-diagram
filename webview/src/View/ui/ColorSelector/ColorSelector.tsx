/**
 * @behavior Duplicate color-change emission suppression and color-change event normalization.
 * @render Shared Shiny View color selector control.
 */

import { useId, useState } from "react";
import type { ChangeEvent, ReactElement, ReactNode } from "react";
import styles from "./ColorSelector.module.css";

type ColorSelectorProps = {
  readonly label: string;
  readonly icon: ReactNode;
  readonly displayValue: string;
  readonly pickerValue: string;
  readonly swatchColor?: string;
  readonly mixed?: boolean;
  readonly onChange: (value: string) => void;
  readonly className?: string;
};

export default function ColorSelector({
  label,
  icon,
  displayValue,
  pickerValue,
  swatchColor,
  mixed = false,
  onChange,
  className,
}: ColorSelectorProps): ReactElement {
  // State creation: local state - last color value emitted to the owner
  const [lastEmittedValue, setLastEmittedValue] = useState<string | null>(null);
  const inputId = useId();

  // Event handler props derivation
  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    emitChange(event.currentTarget.value);
  }

  function handleApplyClick(): void {
    emitChange(pickerValue);
  }

  function emitChange(value: string): void {
    if (lastEmittedValue === value) return;
    setLastEmittedValue(value);

    onChange(value);
  }

  return (
    <div className={[styles.selector, className ?? ""].filter(Boolean).join(" ")}>
      <label className={styles.pickerLabel} htmlFor={inputId}>
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
        <span
          className={[styles.swatch, mixed ? styles.mixed : ""].filter(Boolean).join(" ")}
          style={!mixed && swatchColor ? { background: swatchColor } : undefined}
          aria-hidden="true"
        />
        <span className={styles.copy}>
          <span className={styles.label}>{label}</span>
          <span className={styles.value}>{displayValue}</span>
        </span>
      </label>
      <input
        id={inputId}
        className={styles.input}
        type="color"
        value={pickerValue}
        aria-label={`${label}: ${displayValue}`}
        onChange={handleChange}
      />
      <button className={styles.applyButton} type="button" onClick={handleApplyClick}>
        Apply
      </button>
    </div>
  );
}
