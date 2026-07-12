/**
 * @behavior Emphasis text field commit lifecycle.
 * @render Commit text field with mutually-exclusive emphasis toggles.
 */

import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import TextArea from "../../primitives/TextArea/TextArea";
import ToggleButton from "../../primitives/ToggleButton/ToggleButton";
import ValidationPopup from "../../primitives/ValidationPopup/ValidationPopup";
import DismissButton from "../../primitives/DismissButton/DismissButton";
import styles from "./EmphasisCommitTextField.module.css";
import { useCommitLifecycle } from "../commitLifecycle";

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
  const [emphasis, setEmphasis] = useState<TextEmphasis | null>(initialEmphasis);
  const lifecycle = useCommitLifecycle({
    initialValue: toSingleLine(initialValue),
    validate,
    onCommit: (draft) => onCommit(draft, emphasis),
    onDiscard,
    onCancel,
    onReset: () => setEmphasis(initialEmphasis),
  });

  useEffect(() => {
    setEmphasis(initialEmphasis);
  }, [initialEmphasis, initialValue]);

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
        value={lifecycle.draft}
        rows={toLineCount(lifecycle.draft)}
        disabled={disabled}
        invalid={lifecycle.messages.length > 0}
        autoFocus={autoFocus}
        appearance={appearance}
        hasEndAction
        onChange={(value) => lifecycle.onDraftChange(toSingleLine(value))}
        onBlur={lifecycle.onBlur}
        onKeyDown={lifecycle.onKeyDown}
      />
      <span className={styles.cancelButton}>
        <DismissButton label="Cancel editing" small onClick={lifecycle.onCancel} />
      </span>
      {lifecycle.messages.length > 0 ? (
        <ValidationPopup messages={lifecycle.messages} onDismiss={lifecycle.onPopupDismiss} />
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
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M4 3v4a4 4 0 0 0 8 0V3M3 13h10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ItalicIcon(): ReactElement {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M7 3h5M4 13h5M10 3 6 13"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
