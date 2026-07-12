/**
 * @behavior Commit textarea lifecycle.
 * @render Commit textarea with save button.
 */

import type { ReactElement } from "react";
import Button from "../../primitives/Button/Button";
import styles from "./CommitTextArea.module.css";
import { useCommitLifecycle } from "../commitLifecycle";

type CommitTextAreaProps = {
  readonly initialValue: string;
  readonly disabled?: boolean;
  readonly autoFocus?: boolean;
  readonly appearance?: "pane" | "inline";
  readonly onCommit: (value: string) => void;
  readonly onCancel: () => void;
};

export default function CommitTextArea({
  initialValue,
  disabled = false,
  autoFocus = false,
  appearance = "pane",
  onCommit,
  onCancel,
}: CommitTextAreaProps): ReactElement {
  const lifecycle = useCommitLifecycle({
    initialValue,
    enterCommits: false,
    onCommit,
    onCancel,
  });

  return (
    <div className={`${styles.editor} ${appearance === "inline" ? styles.inline : ""}`}>
      <textarea
        className={styles.input}
        value={lifecycle.draft}
        disabled={disabled}
        autoFocus={autoFocus}
        onChange={(event) => lifecycle.onDraftChange(event.currentTarget.value)}
        onBlur={lifecycle.onBlur}
        onKeyDown={lifecycle.onKeyDown}
      />
      <div className={styles.saveAction}>
        <Button
          label="Save"
          disabled={disabled}
          tone={appearance === "inline" ? "accent" : "neutral"}
          size={appearance === "inline" ? "compact" : "default"}
          shape={appearance === "inline" ? "pill" : "rounded"}
          onClick={lifecycle.onCommitAttempt}
        />
      </div>
    </div>
  );
}
