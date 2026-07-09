/**
 * @behavior Preset select and custom text commit lifecycle.
 * @render Commit combo box.
 */

import type { ReactElement } from "react";
import Dropdown from "../Dropdown/Dropdown";
import type { DropdownOption } from "../Dropdown/Dropdown";
import CommitTextField from "../CommitTextField/CommitTextField";
import styles from "./CommitComboBox.module.css";

type CommitComboBoxProps = {
  readonly initialValue: string;
  readonly options: readonly DropdownOption[];
  readonly validate: (draft: string) => readonly string[];
  readonly disabled?: boolean;
  readonly ariaLabel?: string;
  readonly onCommit: (value: string) => void;
  readonly onDiscard: (messages: readonly string[]) => void;
  readonly onCancel: () => void;
};

export default function CommitComboBox({
  initialValue,
  options,
  validate,
  disabled = false,
  ariaLabel,
  onCommit,
  onDiscard,
  onCancel,
}: CommitComboBoxProps): ReactElement {
  const value = options.some((option) => option.value === initialValue) ? initialValue : "__custom";
  const renderedOptions =
    value === "__custom" && initialValue !== ""
      ? [...options, { value: "__custom", label: `Custom: ${initialValue}` }]
      : [...options, { value: "__custom", label: "Custom" }];

  return (
    <div className={styles.combo}>
      {ariaLabel === undefined ? null : <span className={styles.label}>{ariaLabel}</span>}
      <div className={styles.controls}>
        <Dropdown
          options={renderedOptions}
          value={value}
          disabled={disabled}
          onChange={(nextValue) => {
            if (nextValue !== "__custom") onCommit(nextValue);
          }}
        />
        <CommitTextField
          initialValue={initialValue}
          validate={validate}
          disabled={disabled}
          ariaLabel={ariaLabel}
          isLabelVisible={false}
          onCommit={onCommit}
          onDiscard={onDiscard}
          onCancel={onCancel}
        />
      </div>
    </div>
  );
}
