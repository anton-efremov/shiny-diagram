/**
 * Multiline commit field swapping wrapped display text for a full-area editor.
 *
 * Displays `displayText`; clicking it reports `onEditRequest`. Editing begins
 * from `initialValue`; leaving the editor or using the action labeled by
 * `saveLabel` reports `onCommit`, while backing out restores the initial value
 * and reports `onCancel`. Line breaks are typed as ordinary input; committing is
 * only by the save action or by leaving the editor.
 *
 * Used by: note-body display and editing.
 *
 * Lifecycle:
 * - `isEditing` — off renders wrapped display text; on renders the editor and
 *   save action
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
  readonly saveLabel: string;
  readonly isEditing: boolean;
  readonly onEditRequest: (event: MouseEvent<HTMLDivElement>) => void;
  readonly onCommit: (value: string) => void;
  readonly onCancel: () => void;
};

export default function InlineCommitTextArea({
  initialValue,
  displayText,
  isEditing,
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
          treatment="body"
          onChange={lifecycle.onDraftChange}
          onBlur={lifecycle.onBlur}
          onKeyDown={lifecycle.onKeyDown}
        />
        <span className={styles.saveAction}>
          <InlineTextButton label={saveLabel} onClick={lifecycle.onCommitAttempt} />
        </span>
      </div>
    </div>
  );
}
