/**
 * @behavior Canvas note rest/edit swap with multiline commit and cancel routing.
 */

import type { MouseEvent, ReactElement } from "react";
import { useCommitLifecycle } from "../../../core/commitLifecycle";
import InlineTextArea from "../../primitives/InlineTextArea/InlineTextArea";
import InlineTextBlock from "../../primitives/InlineTextBlock/InlineTextBlock";
import InlineTextButton from "../../primitives/InlineTextButton/InlineTextButton";
import styles from "./InlineCommitTextArea.module.css";

type InlineCommitTextAreaProps = {
  readonly initialValue: string;
  readonly displayText: string;
  readonly isEditing: boolean;
  readonly autoFocus?: boolean;
  readonly saveLabel: string;
  readonly onEditRequest: (event: MouseEvent<HTMLDivElement>) => void;
  readonly onCommit: (value: string) => void;
  readonly onCancel: () => void;
};

export default function InlineCommitTextArea({
  initialValue,
  displayText,
  isEditing,
  autoFocus = false,
  saveLabel,
  onEditRequest,
  onCommit,
  onCancel,
}: InlineCommitTextAreaProps): ReactElement {
  const lifecycle = useCommitLifecycle({
    initialValue,
    enterCommits: false,
    onCommit,
    onCancel,
  });

  if (!isEditing) {
    return <InlineTextBlock text={displayText} variant="body" onEditRequest={onEditRequest} />;
  }

  return (
    <div
      className={styles.editor}
      onPointerDown={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <div className={styles.fieldHost}>
        <InlineTextArea
          value={lifecycle.draft}
          autoFocus={autoFocus}
          treatment="body"
          onChange={lifecycle.onDraftChange}
          onBlur={lifecycle.onBlur}
          onKeyDown={lifecycle.onKeyDown}
        />
        <span className={styles.saveAction}>
          <InlineTextButton label={saveLabel} onPress={lifecycle.onCommitAttempt} />
        </span>
      </div>
    </div>
  );
}
