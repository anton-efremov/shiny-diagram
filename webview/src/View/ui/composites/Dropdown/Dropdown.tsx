/**
 * @behavior Dropdown option selection.
 * @render Dropdown with optional swatch visuals.
 */

import { useState } from "react";
import type { ReactElement } from "react";
import StyledBoxSwatch from "../../primitives/StyledBoxSwatch/StyledBoxSwatch";
import styles from "./Dropdown.module.css";

export type DropdownOption = {
  readonly value: string;
  readonly label: string;
  readonly swatchStyle?: Parameters<typeof StyledBoxSwatch>[0]["styleValues"];
};

type DropdownProps = {
  readonly options: readonly DropdownOption[];
  readonly value: string;
  readonly disabled?: boolean;
  readonly onChange: (value: string) => void;
};

export default function Dropdown({
  options,
  value,
  disabled = false,
  onChange,
}: DropdownProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  function selectValue(nextValue: string): void {
    setIsOpen(false);
    onChange(nextValue);
  }

  return (
    <div className={styles.dropdown}>
      <button
        type="button"
        className={styles.trigger}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        {selectedOption?.swatchStyle ? (
          <StyledBoxSwatch styleValues={selectedOption.swatchStyle} label={selectedOption.label} />
        ) : (
          <span className={styles.triggerLabel}>{selectedOption?.label ?? ""}</span>
        )}
      </button>
      {isOpen ? (
        <div className={styles.menu} role="listbox">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={styles.option}
              role="option"
              aria-selected={option.value === value}
              onClick={() => selectValue(option.value)}
            >
              {option.swatchStyle ? (
                <StyledBoxSwatch styleValues={option.swatchStyle} label={option.label} />
              ) : (
                <span className={styles.optionLabel}>{option.label}</span>
              )}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
