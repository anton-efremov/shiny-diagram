/**
 * @behavior Local note draft text, commit/cancel keyboard adapters, and blur exit handling.
 * @render Note direct-edit textarea.
 */

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FocusEvent, KeyboardEvent, ReactElement } from "react";
import ValidationPopup from "../../../../../../../ui/ValidationPopup/ValidationPopup";
import styles from "./NoteEditField.module.css";

type NoteEditFieldProps = {
  readonly initialText: string;
  readonly onCommit: (text: string) => readonly string[];
  readonly onCancel: () => void;
  readonly onEditDiscard: (messages: readonly string[]) => void;
};

export default function NoteEditField({
  initialText,
  onCommit,
  onCancel,
  onEditDiscard,
}: NoteEditFieldProps): ReactElement {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const settledRef = useRef(false);
  const [draftText, setDraftText] = useState(initialText.trim());
  const [errors, setErrors] = useState<readonly string[]>([]);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const onEditCommit = (): void => {
    const nextErrors = onCommit(draftText.trim());
    if (nextErrors.length === 0) {
      settledRef.current = true;
      return;
    }
    setErrors(nextErrors);
  };

  const onEditorBlur = (event: FocusEvent<HTMLDivElement>): void => {
    if (settledRef.current) return;
    if (event.currentTarget.contains(event.relatedTarget)) return;
    const nextErrors = onCommit(draftText.trim());
    settledRef.current = true;
    if (nextErrors.length > 0) onEditDiscard(nextErrors);
  };

  const onEditCancel = (): void => {
    settledRef.current = true;
    onCancel();
  };

  const onDraftTextChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    setDraftText(event.currentTarget.value);
  };

  const onValidationDismiss = (): void => {
    setErrors([]);
  };

  return (
    <div
      className={styles.editor}
      onPointerDown={(event) => event.stopPropagation()}
      onPointerMove={(event) => event.stopPropagation()}
      onPointerUp={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
      onBlur={onEditorBlur}
    >
      <textarea
        ref={inputRef}
        className={`${styles.input} nodrag`}
        value={draftText}
        onChange={onDraftTextChange}
        onKeyDown={(event: KeyboardEvent<HTMLTextAreaElement>) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onEditCommit();
          }
          if (event.key === "Escape") {
            event.preventDefault();
            onEditCancel();
          }
        }}
      />
      {errors.length > 0 ? (
        <ValidationPopup messages={errors} onDismiss={onValidationDismiss} />
      ) : null}
    </div>
  );
}
