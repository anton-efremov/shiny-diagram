/**
 * @behavior Relationship label input semantic handlers and command dispatch.
 * @state Relationship label draft state updates.
 */

import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { RelationshipId } from "../../../../../../shared/ids";
import { useDispatchTransaction } from "../../../../../contexts";
import { toRelationshipLabelSetTransaction } from "./transactions";

type Interactions = {
  readonly onInputChange: (value: string) => void;
  readonly onInputKeyDown: (key: string) => void;
  readonly onLabelRemove: () => void;
};

type UseInteractionsInput = {
  readonly relationshipId: RelationshipId;
  readonly label: string | null | undefined;
  readonly draft: string;
  readonly setDraft: Dispatch<SetStateAction<string>>;
};

export function useInteractions({
  relationshipId,
  label,
  draft,
  setDraft,
}: UseInteractionsInput): Interactions {
  const dispatchTransaction = useDispatchTransaction();

  // Event handler props derivation
  const onInputChange = useCallback(
    (value: string) => {
      setDraft(value);
    },
    [setDraft]
  );

  const onInputKeyDown = useCallback(
    (key: string) => {
      if (key === "Escape") {
        setDraft(label ?? "");
        return;
      }
      if (key !== "Enter") return;
      const value = draft.trim();
      dispatchTransaction(
        toRelationshipLabelSetTransaction(relationshipId, value === "" ? null : value)
      );
    },
    [dispatchTransaction, draft, label, relationshipId, setDraft]
  );

  const onLabelRemove = useCallback(() => {
    setDraft("");
    dispatchTransaction(toRelationshipLabelSetTransaction(relationshipId, null));
  }, [dispatchTransaction, relationshipId, setDraft]);

  return { onInputChange, onInputKeyDown, onLabelRemove };
}
