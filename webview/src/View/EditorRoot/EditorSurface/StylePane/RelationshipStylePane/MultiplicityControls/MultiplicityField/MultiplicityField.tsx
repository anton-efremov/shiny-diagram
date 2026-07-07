/**
 * @render Relationship multiplicity select and custom draft input.
 */

import type { ChangeEvent, KeyboardEvent, ReactElement } from "react";
import styles from "./MultiplicityField.module.css";

type MultiplicityFieldProps = {
  readonly label: string;
  readonly options: readonly string[];
  readonly noneOption: string;
  readonly customOption: string;
  readonly selectValue: string;
  readonly draft: string;
  readonly onPresetChange: (option: string) => void;
  readonly onDraftChange: (value: string) => void;
  readonly onDraftKeyDown: (key: string) => void;
};

export default function MultiplicityField({
  label,
  options,
  noneOption,
  customOption,
  selectValue,
  draft,
  onPresetChange,
  onDraftChange,
  onDraftKeyDown,
}: MultiplicityFieldProps): ReactElement {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <select value={selectValue} onChange={(event) => onPresetChange(toSelectValue(event))}>
        <option value={noneOption}>none</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
        <option value={customOption}>custom…</option>
      </select>
      {selectValue === customOption ? (
        <input
          value={draft}
          onChange={(event) => onDraftChange(toInputValue(event))}
          onKeyDown={(event) => onDraftKeyDown(toInputKey(event))}
        />
      ) : null}
    </label>
  );
}

// Private helpers
function toSelectValue(event: ChangeEvent<HTMLSelectElement>): string {
  return event.currentTarget.value;
}

function toInputValue(event: ChangeEvent<HTMLInputElement>): string {
  return event.currentTarget.value;
}

function toInputKey(event: KeyboardEvent<HTMLInputElement>): string {
  return event.key;
}
