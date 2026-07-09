/**
 * @behavior Clearable commit text field lifecycle.
 * @render Commit text field with clear action.
 */

import type { ReactElement } from "react";
import Button from "../../primitives/Button/Button";
import CommitTextField from "../CommitTextField/CommitTextField";
import styles from "./CommitClearableTextField.module.css";

type CommitClearableTextFieldProps = {
  readonly initialValue: string;
  readonly validate: (draft: string) => readonly string[];
  readonly disabled?: boolean;
  readonly ariaLabel?: string;
  readonly onCommit: (value: string) => void;
  readonly onClear: () => void;
  readonly onDiscard: (messages: readonly string[]) => void;
  readonly onCancel: () => void;
};

export default function CommitClearableTextField({
  initialValue,
  validate,
  disabled = false,
  ariaLabel,
  onCommit,
  onClear,
  onDiscard,
  onCancel,
}: CommitClearableTextFieldProps): ReactElement {
  return (
    <div className={styles.field}>
      {ariaLabel === undefined ? null : <span className={styles.label}>{ariaLabel}</span>}
      <div className={styles.controls}>
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
        <Button label="Clear" disabled={disabled || initialValue === ""} onClick={onClear} />
      </div>
    </div>
  );
}
