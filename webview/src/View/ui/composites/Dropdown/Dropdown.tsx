/**
 * @behavior Dropdown option selection.
 * @render Dropdown with optional swatch visuals.
 */

import { useState } from "react";
import type { ReactElement } from "react";
import type { CSSProperties } from "react";
import type { StyleProperties } from "../../../../shared/style";
import styles from "./Dropdown.module.css";

export type DropdownOption = {
  readonly value: string;
  readonly label: string;
  readonly swatchStyle?: Partial<StyleProperties>;
  readonly swatchKind?: "box" | "line" | "dash" | "text";
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
        <span className={styles.triggerContent}>
          {selectedOption?.swatchStyle ? (
            <OptionContent option={selectedOption} />
          ) : (
            <span className={styles.triggerLabel}>{selectedOption?.label ?? ""}</span>
          )}
          <span className={styles.arrow} aria-hidden="true">
            v
          </span>
        </span>
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
                <OptionContent option={option} />
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

function OptionContent({ option }: { readonly option: DropdownOption }): ReactElement {
  const swatchStyle: CSSProperties & {
    "--dropdown-swatch-fill"?: string;
    "--dropdown-swatch-stroke"?: string;
    "--dropdown-swatch-color"?: string;
    "--dropdown-swatch-stroke-width"?: string;
    "--dropdown-swatch-stroke-dasharray"?: string;
  } = {
    "--dropdown-swatch-fill": option.swatchStyle?.fill ?? undefined,
    "--dropdown-swatch-stroke": option.swatchStyle?.stroke ?? undefined,
    "--dropdown-swatch-color": option.swatchStyle?.color ?? undefined,
    "--dropdown-swatch-stroke-width": option.swatchStyle?.strokeWidth ?? undefined,
    "--dropdown-swatch-stroke-dasharray": option.swatchStyle?.strokeDasharray ?? undefined,
  };

  return (
    <span className={styles.optionContent}>
      <span className={styles.swatch} style={swatchStyle} aria-hidden="true">
        {option.swatchKind === "line" || option.swatchKind === "dash" ? (
          <svg
            className={styles.lineSample}
            viewBox="0 0 18 10"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M2 5h14"
              stroke="currentColor"
              strokeWidth={option.swatchStyle?.strokeWidth ?? "1.5px"}
              strokeDasharray={
                option.swatchKind === "dash"
                  ? (option.swatchStyle?.strokeDasharray ?? "3 3")
                  : undefined
              }
              strokeLinecap="round"
            />
          </svg>
        ) : null}
        {option.swatchKind === "text" ? <span className={styles.textSample}>A</span> : null}
      </span>
      <span className={styles.optionText}>{option.label}</span>
    </span>
  );
}
