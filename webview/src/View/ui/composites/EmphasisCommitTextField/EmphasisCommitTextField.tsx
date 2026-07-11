/**
 * @behavior Emphasis text field commit lifecycle.
 * @render Commit text field with mutually-exclusive emphasis toggles.
 */

import { useEffect, useState } from "react";
import type { KeyboardEvent, ReactElement } from "react";
import TextArea from "../../primitives/TextArea/TextArea";
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
  readonly appearance?: "pane" | "inline";
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
  appearance = "pane",
  onCommit,
  onDiscard,
  onCancel,
}: EmphasisCommitTextFieldProps): ReactElement {
  const [draft, setDraft] = useState(() => toSingleLine(initialValue));
  const [emphasis, setEmphasis] = useState<TextEmphasis | null>(initialEmphasis);
  const [messages, setMessages] = useState<readonly string[]>([]);

  useEffect(() => {
    setDraft(toSingleLine(initialValue));
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
    setDraft(toSingleLine(initialValue));
    setEmphasis(initialEmphasis);
    setMessages([]);
    onDiscard(nextMessages);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setDraft(toSingleLine(initialValue));
      setEmphasis(initialEmphasis);
      setMessages([]);
      onCancel();
    }
  }

  function onDraftChange(value: string): void {
    setDraft(toSingleLine(value));
    setMessages([]);
  }

  return (
    <div
      className={`${styles.editor} ${emphasis === "underline" ? styles.underlined : ""} ${emphasis === "italic" ? styles.italic : ""}`}
    >
      <div className={styles.toolbar} onMouseDown={(event) => event.preventDefault()}>
        <ToggleButton
          icon={<UnderlineIcon />}
          title="Underline"
          pressed={emphasis === "underline"}
          disabled={disabled}
          size="micro"
          onClick={() => setEmphasis((value) => (value === "underline" ? null : "underline"))}
        />
        <ToggleButton
          icon={<ItalicIcon />}
          title="Italic"
          pressed={emphasis === "italic"}
          disabled={disabled}
          size="micro"
          onClick={() => setEmphasis((value) => (value === "italic" ? null : "italic"))}
        />
      </div>
      <TextArea
        value={draft}
        rows={toLineCount(draft)}
        disabled={disabled}
        invalid={messages.length > 0}
        autoFocus={autoFocus}
        appearance={appearance}
        onChange={onDraftChange}
        onBlur={discardIfInvalid}
        onKeyDown={handleKeyDown}
      />
      {messages.length > 0 ? (
        <ValidationPopup messages={messages} onDismiss={() => setMessages([])} />
      ) : null}
    </div>
  );
}

function toLineCount(value: string): number {
  return Math.max(1, value.split("\n").length);
}

function toSingleLine(value: string): string {
  return value.replace(/[\r\n]+/g, " ");
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
