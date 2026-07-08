/**
 * @behavior Relationship edge selection and inline edit semantic handlers with commit dispatch, inline edit target, and draft updates.
 */

import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { RelationshipId } from "../../../../../../../shared/ids";
import type { RelationshipView } from "../../../../../../views/schema";
import { useDispatchTransaction } from "../../../../../../contexts";
import type { EditTarget } from "./state";
import {
  toRelationshipLabelSetTransaction,
  toRelationshipMultiplicitySetTransaction,
} from "./transactions";

type Interactions = {
  readonly onEdgeSelect: () => void;
  readonly onEditStart: (target: EditTarget, value: string) => void;
  readonly onDraftChange: (value: string) => void;
  readonly onDraftCommit: () => void;
  readonly onDraftDiscard: () => void;
};

type UseInteractionsInput = {
  readonly view: RelationshipView;
  readonly isSelected: boolean;
  readonly onRelationshipSelect: (relationshipId: RelationshipId) => void;
  readonly editTarget: EditTarget | null;
  readonly setEditTarget: Dispatch<SetStateAction<EditTarget | null>>;
  readonly draft: string;
  readonly setDraft: Dispatch<SetStateAction<string>>;
};

export function useInteractions({
  view,
  isSelected,
  onRelationshipSelect,
  editTarget,
  setEditTarget,
  draft,
  setDraft,
}: UseInteractionsInput): Interactions {
  const dispatchTransaction = useDispatchTransaction();

  // Event handler props derivation
  const onEdgeSelect = useCallback(() => {
    onRelationshipSelect(view.relationshipId);
  }, [onRelationshipSelect, view.relationshipId]);

  const onEditStart = useCallback(
    (target: EditTarget, value: string) => {
      if (!isSelected) onRelationshipSelect(view.relationshipId);
      setEditTarget(target);
      setDraft(value);
    },
    [isSelected, onRelationshipSelect, setDraft, setEditTarget, view.relationshipId]
  );

  const onDraftChange = useCallback((value: string) => setDraft(value), [setDraft]);

  const onDraftCommit = useCallback(() => {
    if (editTarget === null) return;
    const value = draft.trim();
    // Implementing interaction through command transaction
    dispatchTransaction(
      editTarget === "label"
        ? toRelationshipLabelSetTransaction(view.relationshipId, value === "" ? null : value)
        : toRelationshipMultiplicitySetTransaction(
            view.relationshipId,
            editTarget === "sourceMultiplicity" ? "source" : "target",
            value === "" ? null : value
          )
    );
    setEditTarget(null);
    setDraft("");
  }, [dispatchTransaction, draft, editTarget, setDraft, setEditTarget, view.relationshipId]);

  const onDraftDiscard = useCallback(() => {
    setEditTarget(null);
    setDraft("");
  }, [setDraft, setEditTarget]);

  return { onEdgeSelect, onEditStart, onDraftChange, onDraftCommit, onDraftDiscard };
}
