/**
 * @behavior Note action dispatch and attach-mode handoff.
 */

import { useCallback } from "react";
import type { NoteId } from "../../../../../shared/ids";
import type { TransactionResult } from "../../../../commands/editorCommands";
import { useDispatchTransaction } from "../../../../contexts";
import type { NoteView } from "../../../../views/schema";
import {
  toNoteDeleteTransaction,
  toNoteDetachTransaction,
  toNoteDuplicateTransaction,
} from "./transactions";

type Interactions = {
  readonly onAttachmentToggle: () => void;
  readonly onDuplicate: () => void;
  readonly onDelete: () => void;
};

type UseInteractionsInput = {
  readonly view: NoteView;
  readonly onNoteAttachStart: (noteId: NoteId) => void;
  readonly onNoteDuplicateCommitted: (result: TransactionResult) => void;
};

export function useInteractions({
  view,
  onNoteAttachStart,
  onNoteDuplicateCommitted,
}: UseInteractionsInput): Interactions {
  const dispatchTransaction = useDispatchTransaction();

  // Event handler props derivation
  const onAttachmentToggle = useCallback(() => {
    if (view.attachedToClassId) {
      dispatchTransaction(toNoteDetachTransaction(view));
      return;
    }
    onNoteAttachStart(view.noteId);
  }, [dispatchTransaction, onNoteAttachStart, view]);

  const onDuplicate = useCallback(() => {
    const result = dispatchTransaction(toNoteDuplicateTransaction(view));
    onNoteDuplicateCommitted(result);
  }, [dispatchTransaction, onNoteDuplicateCommitted, view]);

  const onDelete = useCallback(() => {
    dispatchTransaction(toNoteDeleteTransaction(view));
  }, [dispatchTransaction, view]);

  return { onAttachmentToggle, onDuplicate, onDelete };
}
