/**
 * @behavior Emphasis text field commit lifecycle.
 * @render Commit text field with mutually-exclusive emphasis toggles.
 */

import { useEffect, useState } from "react";
import type { KeyboardEvent, ReactElement } from "react";
import TextField from "../../primitives/TextField/TextField";
import ToggleButton from "../../primitives/ToggleButton/ToggleButton";
import ValidationPopup from "../../primitives/ValidationPopup/ValidationPopup";
import styles from "./EmphasisCommitTextField.module.css";

export type TextEmphasis = "underline" | "italic";

type EmphasisCommitTextFieldProps = {
  readonly initialValue: string;
  readonly initialEmphasis: TextEmphasis | null;
  readonly validate: (draft: string) => readonly string[];
  readonly disabled?: boolean;
  readonly autoFocus?: boolean;
  readonly onCommit: (value: string, emphasis: TextEmphasis | null) => void;
  readonly onDiscard: (messages: readonly string[]) => void;
  readonly onCancel: () => void;
};

export default function EmphasisCommitTextField({
  initialValue,
  initialEmphasis,
  validate,
  disabled = false,
  autoFocus = false,
  onCommit,
  onDiscard,
  onCancel,
}: EmphasisCommitTextFieldProps): ReactElement {
  const [draft, setDraft] = useState(initialValue);
  const [emphasis, setEmphasis] = useState<TextEmphasis | null>(initialEmphasis);
  const [messages, setMessages] = useState<readonly string[]>([]);

  useEffect(() => {
    setDraft(initialValue);
    setEmphasis(initialEmphasis);
    setMessages([]);
  }, [initialEmphasis, initialValue]);

  function commit(): void {
    const nextMessages = validate(draft);
    if (nextMessages.length > 0) {
      setMessages(nextMessages);
      return;
    }
    setMessages([]);
    onCommit(draft, emphasis);
  }

  function discardIfInvalid(): void {
    const nextMessages = validate(draft);
    if (nextMessages.length === 0) {
      setMessages([]);
      onCommit(draft, emphasis);
      return;
    }
    setDraft(initialValue);
    setEmphasis(initialEmphasis);
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
      setEmphasis(initialEmphasis);
      setMessages([]);
      onCancel();
    }
  }

  return (
    <div className={styles.editor}>
      <div className={styles.toolbar}>
        <ToggleButton
          icon={<UnderlineIcon />}
          title="Underline"
          pressed={emphasis === "underline"}
          disabled={disabled}
          onClick={() => setEmphasis((value) => (value === "underline" ? null : "underline"))}
        />
        <ToggleButton
          icon={<ItalicIcon />}
          title="Italic"
          pressed={emphasis === "italic"}
          disabled={disabled}
          onClick={() => setEmphasis((value) => (value === "italic" ? null : "italic"))}
        />
      </div>
      <TextField
        value={draft}
        disabled={disabled}
        invalid={messages.length > 0}
        autoFocus={autoFocus}
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

function UnderlineIcon(): ReactElement {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4 2v5a4 4 0 0 0 8 0V2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 14h10" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function ItalicIcon(): ReactElement {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M7 2h6M3 14h6M10 2 6 14" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
