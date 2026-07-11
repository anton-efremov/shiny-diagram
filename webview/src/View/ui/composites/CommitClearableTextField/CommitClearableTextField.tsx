/**
 * @behavior Clearable commit text field lifecycle.
 * @render Commit text field with clear action.
 */

import { useEffect, useState } from "react";
import type { KeyboardEvent, ReactElement } from "react";
import TextField from "../../primitives/TextField/TextField";
import ValidationPopup from "../../primitives/ValidationPopup/ValidationPopup";
import DismissButton from "../../primitives/DismissButton/DismissButton";
import styles from "./CommitClearableTextField.module.css";

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
  const [draft, setDraft] = useState(initialValue);
  const [messages, setMessages] = useState<readonly string[]>([]);

  useEffect(() => {
    setDraft(initialValue);
    setMessages([]);
  }, [initialValue]);

  function commit(): void {
    const nextMessages = validate(draft);
    if (nextMessages.length > 0) {
      setMessages(nextMessages);
      return;
    }
    setMessages([]);
    onCommit(draft);
  }

  function discardIfInvalid(): void {
    const nextMessages = validate(draft);
    if (nextMessages.length === 0) {
      setMessages([]);
      onCommit(draft);
      return;
    }
    setDraft(initialValue);
    setMessages([]);
    onDiscard(nextMessages);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setDraft(initialValue);
      setMessages([]);
      onCancel();
    }
  }

  function handleClear(): void {
    setDraft("");
    setMessages([]);
    onClear();
  }

  const visibleLabel = isLabelVisible ? ariaLabel : undefined;

  return (
    <div className={visibleLabel === undefined ? styles.fieldWithoutLabel : styles.field}>
      {visibleLabel === undefined ? null : <span className={styles.label}>{visibleLabel}</span>}
      <div className={styles.inputHost}>
        <TextField
          value={draft}
          disabled={disabled}
          invalid={messages.length > 0}
          ariaLabel={ariaLabel}
          hasEndAction={draft !== ""}
          onChange={(value) => {
            setDraft(value);
            setMessages([]);
          }}
          onBlur={discardIfInvalid}
          onKeyDown={handleKeyDown}
        />
        {draft === "" || disabled ? null : (
          <span className={styles.clearButton}>
            <DismissButton label={`Clear ${ariaLabel ?? "value"}`} small onClick={handleClear} />
          </span>
        )}
      </div>
      {messages.length > 0 ? (
        <ValidationPopup messages={messages} onDismiss={() => setMessages([])} />
      ) : null}
    </div>
  );
}
