/**
 * @behavior Commit textarea lifecycle.
 * @render Commit textarea with save button.
 */

import { useEffect, useState } from "react";
import type { KeyboardEvent, ReactElement } from "react";
import Button from "../../primitives/Button/Button";
import styles from "./CommitTextArea.module.css";

type CommitTextAreaProps = {
  readonly initialValue: string;
  readonly disabled?: boolean;
  readonly autoFocus?: boolean;
  readonly onCommit: (value: string) => void;
  readonly onCancel: () => void;
};

export default function CommitTextArea({
  initialValue,
  disabled = false,
  autoFocus = false,
  onCommit,
  onCancel,
}: CommitTextAreaProps): ReactElement {
  const [draft, setDraft] = useState(initialValue);

  useEffect(() => {
    setDraft(initialValue);
  }, [initialValue]);

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
    if (event.key === "Escape") {
      event.preventDefault();
      setDraft(initialValue);
      onCancel();
    }
  }

  return (
    <div className={styles.editor}>
      <textarea
        className={styles.input}
        value={draft}
        disabled={disabled}
        autoFocus={autoFocus}
        onChange={(event) => setDraft(event.currentTarget.value)}
        onBlur={() => onCommit(draft)}
        onKeyDown={handleKeyDown}
      />
      <Button label="Save" disabled={disabled} onClick={() => onCommit(draft)} />
    </div>
  );
}
