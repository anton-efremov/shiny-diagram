/**
 * @behavior Selected note action routing.
 * @render Note inspector actions.
 */

import type { ReactElement } from "react";
import type { NoteId } from "../../../../../shared/ids";
import type { TransactionResult } from "../../../../commands/editorCommands";
import type { NoteView } from "../../../../views/schema";
import { useInteractions } from "./useInteractions";
import styles from "./NoteStylePane.module.css";

type NoteStylePaneProps = {
  readonly view: NoteView;
  readonly onNoteAttachStart: (noteId: NoteId) => void;
  readonly onNoteDuplicateCommitted: (result: TransactionResult) => void;
};

export default function NoteStylePane({
  view,
  onNoteAttachStart,
  onNoteDuplicateCommitted,
}: NoteStylePaneProps): ReactElement {
  // UI props derivation
  const attachmentLabel = view.attachedToClassId ? "Detach from class" : "Attach to class";

  // Event handler props derivation
  const { onAttachmentToggle, onDuplicate, onDelete } = useInteractions({
    view,
    onNoteAttachStart,
    onNoteDuplicateCommitted,
  });

  return (
    <section className={styles.selectionPanel} aria-label="Selected note styles">
      <button type="button" onClick={onAttachmentToggle}>
        {attachmentLabel}
      </button>
      <button type="button" onClick={onDuplicate}>
        Duplicate
      </button>
      <button type="button" className={styles.danger} onClick={onDelete}>
        Delete
      </button>
    </section>
  );
}
