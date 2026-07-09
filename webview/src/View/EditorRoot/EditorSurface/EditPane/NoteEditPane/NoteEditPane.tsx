/**
 * @behavior Selected note action routing.
 * @render Note inspector actions.
 */

import type { ReactElement } from "react";
import type { NoteId } from "../../../../../shared/ids";
import type { TransactionResult } from "../../../../commands/editorCommands";
import type { NoteView } from "../../../../views/schema";
import Button from "../../../../ui/primitives/Button/Button";
import PaneSection from "../../../../ui/templates/PaneSection/PaneSection";
import { useInteractions } from "./useInteractions";

type NoteEditPaneProps = {
  readonly view: NoteView;
  readonly onNoteAttachStart: (noteId: NoteId) => void;
  readonly onNoteDuplicateCommitted: (result: TransactionResult) => void;
};

export default function NoteEditPane({
  view,
  onNoteAttachStart,
  onNoteDuplicateCommitted,
}: NoteEditPaneProps): ReactElement {
  // UI props derivation
  const attachmentLabel = view.attachedToClassId ? "Detach from class" : "Attach to class";

  // Event handler props derivation
  const { onAttachmentToggle, onDuplicate, onDelete } = useInteractions({
    view,
    onNoteAttachStart,
    onNoteDuplicateCommitted,
  });

  return (
    <PaneSection label="">
      <Button label={attachmentLabel} onClick={onAttachmentToggle} />
      <Button label="Duplicate" onClick={onDuplicate} />
      <Button label="Delete" tone="danger" onClick={onDelete} />
    </PaneSection>
  );
}
