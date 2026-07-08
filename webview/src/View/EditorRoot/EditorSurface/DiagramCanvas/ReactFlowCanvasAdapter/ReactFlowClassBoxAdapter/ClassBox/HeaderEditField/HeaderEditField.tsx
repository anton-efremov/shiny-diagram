/**
 * @behavior Local class header draft, commit/cancel keyboard adapters, and blur exit handling.
 * @render Class header direct-edit input.
 */

import { useEffect, useRef, useState } from "react";
import type { FocusEvent, KeyboardEvent, ReactElement } from "react";
import ValidationPopup from "../../../../../../../ui/ValidationPopup/ValidationPopup";
import styles from "./HeaderEditField.module.css";

type HeaderEditFieldProps = {
  readonly initialText: string;
  readonly onCommit: (text: string) => readonly string[];
  readonly onCancel: () => void;
  readonly onEditDiscard: (messages: readonly string[]) => void;
};

export default function HeaderEditField({
  initialText,
  onCommit,
  onCancel,
  onEditDiscard,
}: HeaderEditFieldProps): ReactElement {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const settledRef = useRef(false);
  const [draftText, setDraftText] = useState(initialText);
  const [errors, setErrors] = useState<readonly string[]>([]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const onEditCommit = (): void => {
    const nextErrors = onCommit(draftText.trim());
    if (nextErrors.length === 0) {
      settledRef.current = true;
      return;
    }
    setErrors(nextErrors);
  };

  const onEditorBlur = (event: FocusEvent<HTMLSpanElement>): void => {
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

  return (
    <span
      className={styles.editor}
      onPointerDown={(event) => {
        event.stopPropagation();
      }}
      onPointerMove={(event) => event.stopPropagation()}
      onPointerUp={(event) => {
        event.stopPropagation();
      }}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
      onBlur={onEditorBlur}
    >
      <input
        ref={inputRef}
        className={`${styles.input} nodrag`}
        value={draftText}
        onChange={(event) => setDraftText(event.currentTarget.value)}
        onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
          if (event.key === "Enter") {
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
        <ValidationPopup messages={errors} onDismiss={() => setErrors([])} />
      ) : null}
    </span>
  );
}
