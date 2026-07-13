/**
 * Text field with validation, commit lifecycle, and optional cancellation.
 *
 * Holds `initialValue` as a draft, reports each edit through `onDraftChange`,
 * and resets when the incoming value changes. `validate` gates completion:
 * Enter or valid blur reports `onCommit`; invalid blur restores the committed
 * value and reports `onDiscard` with its messages. Escape and the optional
 * cancel action restore the value and report `onCancel`. Enter failures remain
 * visible until dismissed or edited. `ariaLabel` always supplies the accessible
 * name.
 *
 * Options:
 * - `disabled` — on prevents editing
 * - `isLabelVisible` — on shows `ariaLabel` in a fixed label column; off keeps
 *   only the accessible name
 * - `autoFocus` — on requests focus when the field mounts
 * - `appearance` — `pane` uses standard control framing; `inline` inherits its
 *   surrounding text treatment
 * - `situation` — absent uses neutral treatment; `edgeLabel` and `edgeCaption`
 *   apply their respective edge-text editing surfaces
 * - `isCancelVisible` — on reserves trailing space and shows a cancel action
 */

import type { ReactElement } from "react";
import TextField from "../../primitives/TextField/TextField";
import ValidationPopup from "../../primitives/ValidationPopup/ValidationPopup";
import DismissButton from "../../primitives/DismissButton/DismissButton";
import styles from "./CommitTextField.module.css";
import { useCommitLifecycle } from "../../../core/commitLifecycle";

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
