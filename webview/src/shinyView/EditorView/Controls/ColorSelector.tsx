/**
 * @fileoverview Shared Shiny View color selector control.
 */

import { useId, useRef } from "react";
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
  const inputId = useId();
  const lastEmittedValueRef = useRef<string | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    emitChange(event.currentTarget.value);
  }

  function handleApplyClick(): void {
    emitChange(pickerValue);
  }

  function emitChange(value: string): void {
    if (lastEmittedValueRef.current === value) return;

    lastEmittedValueRef.current = value;
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
