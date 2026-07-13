/**
 * @behavior Clearable commit text field lifecycle.
 * @render Commit text field with clear action.
 */

import type { ReactElement } from "react";
import TextField from "../../primitives/TextField/TextField";
import ValidationPopup from "../../primitives/ValidationPopup/ValidationPopup";
import DismissButton from "../../primitives/DismissButton/DismissButton";
import styles from "./CommitClearableTextField.module.css";
import { useCommitLifecycle } from "../../../core/commitLifecycle";

type CommitClearableTextFieldProps = {
  readonly initialValue: string;
  readonly validate: (draft: string) => readonly string[];
  readonly disabled?: boolean;
  readonly ariaLabel?: string;
  readonly isLabelVisible?: boolean;
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
  isLabelVisible = true,
  onCommit,
  onClear,
  onDiscard,
  onCancel,
}: CommitClearableTextFieldProps): ReactElement {
  const lifecycle = useCommitLifecycle({
    initialValue,
    validate,
    onCommit,
    onDiscard,
    onCancel,
  });

  function handleClear(): void {
    lifecycle.onDraftChange("");
    onClear();
  }

  const visibleLabel = isLabelVisible ? ariaLabel : undefined;

  return (
    <div className={visibleLabel === undefined ? styles.fieldWithoutLabel : styles.field}>
      {visibleLabel === undefined ? null : <span className={styles.label}>{visibleLabel}</span>}
      <div className={styles.inputHost}>
        <TextField
          value={lifecycle.draft}
          disabled={disabled}
          invalid={lifecycle.messages.length > 0}
          ariaLabel={ariaLabel}
          hasEndAction={lifecycle.draft !== ""}
          onChange={lifecycle.onDraftChange}
          onBlur={lifecycle.onBlur}
          onKeyDown={lifecycle.onKeyDown}
        />
        {lifecycle.draft === "" || disabled ? null : (
          <span className={styles.clearButton}>
            <DismissButton label={`Clear ${ariaLabel ?? "value"}`} small onClick={handleClear} />
          </span>
        )}
      </div>
      {lifecycle.messages.length > 0 ? (
        <ValidationPopup messages={lifecycle.messages} onDismiss={lifecycle.onPopupDismiss} />
      ) : null}
    </div>
  );
}
