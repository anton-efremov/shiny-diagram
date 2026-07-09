/**
 * @behavior Commit text field validation and commit lifecycle.
 * @render Commit text field with validation popup.
 */

import { useEffect, useState } from "react";
import type { KeyboardEvent, ReactElement } from "react";
import TextField from "../../primitives/TextField/TextField";
import ValidationPopup from "../../primitives/ValidationPopup/ValidationPopup";
import styles from "./CommitTextField.module.css";

type CommitTextFieldProps = {
  readonly initialValue: string;
  readonly validate: (draft: string) => readonly string[];
  readonly disabled?: boolean;
  readonly ariaLabel?: string;
  readonly isLabelVisible?: boolean;
  readonly onCommit: (value: string) => void;
  readonly onDiscard: (messages: readonly string[]) => void;
  readonly onCancel: () => void;
};

export default function CommitTextField({
  initialValue,
  validate,
  disabled = false,
  ariaLabel,
  isLabelVisible = true,
  onCommit,
  onDiscard,
  onCancel,
}: CommitTextFieldProps): ReactElement {
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

  const visibleLabel = isLabelVisible ? ariaLabel : undefined;

  return (
    <div className={visibleLabel === undefined ? styles.fieldWithoutLabel : styles.field}>
      {visibleLabel === undefined ? null : <span className={styles.label}>{visibleLabel}</span>}
      <TextField
        value={draft}
        disabled={disabled}
        invalid={messages.length > 0}
        ariaLabel={ariaLabel}
        onChange={setDraft}
        onBlur={discardIfInvalid}
        onKeyDown={handleKeyDown}
      />
      {messages.length > 0 ? (
        <ValidationPopup messages={messages} onDismiss={() => setMessages([])} />
      ) : null}
    </div>
  );
}
