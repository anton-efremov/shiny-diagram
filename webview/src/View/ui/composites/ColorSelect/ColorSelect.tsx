/**
 * @behavior Discrete color preset palette selection.
 * @render Color preset swatch palette.
 */

import { useState } from "react";
import type { ReactElement } from "react";
import type { DropdownOption } from "../Dropdown/Dropdown";
import StyledBoxSwatch from "../../primitives/StyledBoxSwatch/StyledBoxSwatch";
import styles from "./ColorSelect.module.css";

type ColorSelectProps = {
  readonly presets: readonly DropdownOption[];
  readonly value: string;
  readonly disabled?: boolean;
  readonly onChange: (value: string) => void;
};

export default function ColorSelect({
  presets,
  value,
  disabled = false,
  onChange,
}: ColorSelectProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const selected = presets.find((preset) => preset.value === value) ?? presets[0];

  function selectValue(nextValue: string): void {
    setIsOpen(false);
    onChange(nextValue);
  }

  return (
    <div className={styles.colorSelect}>
      <button
        type="button"
        className={styles.trigger}
        disabled={disabled}
        aria-haspopup="grid"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        {selected ? (
          <StyledBoxSwatch styleValues={selected.swatchStyle ?? {}} label={selected.label} />
        ) : null}
      </button>
      {isOpen ? (
        <div className={styles.palette} role="grid">
          {presets.map((preset) => (
            <button
              key={preset.value}
              type="button"
              className={styles.option}
              aria-label={preset.label}
              aria-pressed={preset.value === value}
              title={preset.label}
              onClick={() => selectValue(preset.value)}
            >
              <StyledBoxSwatch styleValues={preset.swatchStyle ?? {}} label="" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
