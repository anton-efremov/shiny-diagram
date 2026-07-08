/**
 * @behavior Local class header draft and commit/cancel keyboard adapters.
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
};

export default function HeaderEditField({
  initialText,
  onCommit,
  onCancel,
}: HeaderEditFieldProps): ReactElement {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [draftText, setDraftText] = useState(initialText);
  const [errors, setErrors] = useState<readonly string[]>([]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const onEditCommit = (): void => {
    setErrors(onCommit(draftText.trim()));
  };

  const onEditorBlur = (event: FocusEvent<HTMLSpanElement>): void => {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    onEditCommit();
  };

  return (
    <span
      className={styles.editor}
      onPointerDown={(event) => {
        event.stopPropagation();
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerUp={(event) => {
        event.stopPropagation();
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
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
            onCancel();
          }
        }}
      />
      {errors.length > 0 ? (
        <ValidationPopup messages={errors} onDismiss={() => setErrors([])} />
      ) : null}
    </span>
  );
}
