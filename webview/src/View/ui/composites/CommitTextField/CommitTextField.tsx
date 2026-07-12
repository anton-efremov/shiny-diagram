/**
 * @behavior Commit text field validation and commit lifecycle.
 * @render Commit text field with validation popup.
 */

import type { ReactElement } from "react";
import TextField from "../../primitives/TextField/TextField";
import ValidationPopup from "../../primitives/ValidationPopup/ValidationPopup";
import DismissButton from "../../primitives/DismissButton/DismissButton";
import styles from "./CommitTextField.module.css";
import { useCommitLifecycle } from "../commitLifecycle";

type CommitTextFieldProps = {
  readonly initialValue: string;
  readonly validate: (draft: string) => readonly string[];
  readonly disabled?: boolean;
  readonly ariaLabel?: string;
  readonly isLabelVisible?: boolean;
  readonly autoFocus?: boolean;
  readonly appearance?: "pane" | "inline";
  readonly situation?: "edgeLabel" | "edgeCaption";
  readonly isCancelVisible?: boolean;
  readonly onCommit: (value: string) => void;
  readonly onDraftChange?: (value: string) => void;
  readonly onDiscard: (messages: readonly string[]) => void;
  readonly onCancel: () => void;
};

export default function CommitTextField({
  initialValue,
  validate,
  disabled = false,
  ariaLabel,
  isLabelVisible = true,
  autoFocus = false,
  appearance = "pane",
  situation,
  isCancelVisible = false,
  onCommit,
  onDraftChange,
  onDiscard,
  onCancel,
}: CommitTextFieldProps): ReactElement {
  const lifecycle = useCommitLifecycle({
    initialValue,
    validate,
    onCommit,
    onDraftChange,
    onDiscard,
    onCancel,
  });

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
          autoFocus={autoFocus}
          appearance={appearance}
          situation={situation}
          hasEndAction={isCancelVisible}
          onChange={lifecycle.onDraftChange}
          onBlur={lifecycle.onBlur}
          onKeyDown={lifecycle.onKeyDown}
        />
        {isCancelVisible ? (
          <span className={styles.cancelButton}>
            <DismissButton label="Cancel editing" small onClick={lifecycle.onCancel} />
          </span>
        ) : null}
      </div>
      {lifecycle.messages.length > 0 ? (
        <ValidationPopup messages={lifecycle.messages} onDismiss={lifecycle.onPopupDismiss} />
      ) : null}
    </div>
  );
}
