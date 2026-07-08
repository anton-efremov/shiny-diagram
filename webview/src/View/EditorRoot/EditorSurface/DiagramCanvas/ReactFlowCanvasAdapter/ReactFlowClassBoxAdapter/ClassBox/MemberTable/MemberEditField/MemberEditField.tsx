/**
 * @behavior Local member draft text, classifier toggles, and commit/cancel keyboard adapters.
 * @render Member direct-edit row.
 */

import { useEffect, useRef, useState } from "react";
import type { FocusEvent, KeyboardEvent, ReactElement } from "react";
import type { MemberClassifier } from "../../../../../../../../../shared/uml";
import ValidationPopup from "../../../../../../../../ui/ValidationPopup/ValidationPopup";
import styles from "./MemberEditField.module.css";

type MemberEditFieldProps = {
  readonly initialText: string;
  readonly initialClassifier: MemberClassifier | null;
  readonly onCommit: (text: string, classifier: MemberClassifier | null) => readonly string[];
  readonly onCancel: () => void;
};

export default function MemberEditField({
  initialText,
  initialClassifier,
  onCommit,
  onCancel,
}: MemberEditFieldProps): ReactElement {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [draftText, setDraftText] = useState(initialText);
  const [draftClassifier, setDraftClassifier] = useState<MemberClassifier | null>(
    initialClassifier
  );
  const [errors, setErrors] = useState<readonly string[]>([]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const onEditCommit = (): void => {
    const nextText = draftText.trim();
    const nextErrors = onCommit(nextText, draftClassifier);
    setErrors(nextErrors);
  };

  const onEditorBlur = (event: FocusEvent<HTMLDivElement>): void => {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    onEditCommit();
  };

  const onStaticToggle = (): void => {
    setDraftClassifier((classifier) => (classifier === "static" ? null : "static"));
  };

  const onAbstractToggle = (): void => {
    setDraftClassifier((classifier) => (classifier === "abstract" ? null : "abstract"));
  };

  return (
    <div
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
      <div className={styles.toolbar} aria-label="Member classifier">
        <button
          type="button"
          className={draftClassifier === "static" ? styles.activeToggle : styles.toggle}
          onClick={onStaticToggle}
          aria-label="Static"
        >
          U
        </button>
        <button
          type="button"
          className={draftClassifier === "abstract" ? styles.activeToggle : styles.toggle}
          onClick={onAbstractToggle}
          aria-label="Abstract"
        >
          I
        </button>
      </div>
      <input
        ref={inputRef}
        className={`${styles.input} nodrag`}
        value={draftText}
        onChange={(event) => setDraftText(event.target.value)}
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
    </div>
  );
}
