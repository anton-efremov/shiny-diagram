/**
 * @role [L]+[P] Logic and Presentational
 * @logic Duplicate color-change emission suppression.
 * @state lastEmittedValue: last color value sent through the owner callback.
 * @presents Shared Shiny View color selector control.
 */

import { useState } from "react";
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
  // @job logic:state:initialize
  const [lastEmittedValue, setLastEmittedValue] = useState<string | null>(null);

  // @job connect:event:normalize
  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    emitChange(event.currentTarget.value);
  }

  // @job connect:event:wire
  function handleApplyClick(): void {
    emitChange(pickerValue);
  }

  function emitChange(value: string): void {
    // @job logic:state:update
    if (lastEmittedValue === value) return;
    setLastEmittedValue(value);

    // @job connect:event:wire
    onChange(value);
  }

  // @job render:structure
  return (
    <div className={[styles.selector, className ?? ""].filter(Boolean).join(" ")}>
      <label className={styles.pickerLabel}>
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
