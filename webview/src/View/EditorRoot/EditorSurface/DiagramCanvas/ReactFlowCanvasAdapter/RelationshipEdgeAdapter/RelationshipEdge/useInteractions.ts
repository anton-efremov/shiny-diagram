/**
 * @behavior Relationship edge selection and inline edit command dispatch handlers.
 */

import { useCallback } from "react";
import type { Dispatch, KeyboardEvent, MouseEvent, SetStateAction } from "react";
import type { RelationshipId } from "../../../../../../../shared/ids";
import type { RelationshipView } from "../../../../../../views/schema";
import { useDispatchTransaction } from "../../../../../../contexts";
import {
  toRelationshipLabelSetTransaction,
  toRelationshipMultiplicitySetTransaction,
} from "./transactions";

type EditTarget = "label" | "sourceMultiplicity" | "targetMultiplicity";

type Interactions = {
  readonly onEdgeSelect: (event: MouseEvent<SVGGElement>) => void;
  readonly onTextEditStart: (target: EditTarget, value: string) => void;
  readonly onDraftChange: (value: string) => void;
  readonly onDraftKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  readonly onDraftBlur: () => void;
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
  const onEdgeSelect = useCallback(
    (event: MouseEvent<SVGGElement>) => {
      event.stopPropagation();
      onRelationshipSelect(view.relationshipId);
    },
    [onRelationshipSelect, view.relationshipId]
  );

  const onTextEditStart = useCallback(
    (target: EditTarget, value: string) => {
      if (!isSelected) onRelationshipSelect(view.relationshipId);
      setEditTarget(target);
      setDraft(value);
    },
    [isSelected, onRelationshipSelect, setDraft, setEditTarget, view.relationshipId]
  );

  const onDraftChange = useCallback((value: string) => setDraft(value), [setDraft]);

  const onDraftKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Escape") {
        setEditTarget(null);
        setDraft("");
        return;
      }
      if (event.key !== "Enter" || editTarget === null) return;
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
    },
    [dispatchTransaction, draft, editTarget, setDraft, setEditTarget, view.relationshipId]
  );

  const onDraftBlur = useCallback(() => {
    setEditTarget(null);
    setDraft("");
  }, [setDraft, setEditTarget]);

  return { onEdgeSelect, onTextEditStart, onDraftChange, onDraftKeyDown, onDraftBlur };
}
