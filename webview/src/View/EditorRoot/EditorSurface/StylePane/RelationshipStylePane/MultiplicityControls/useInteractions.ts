/**
 * @behavior Relationship multiplicity preset and draft semantic handlers with command dispatch.
 * @state Relationship multiplicity draft and custom mode state updates.
 */

import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { RelationshipId } from "../../../../../../shared/ids";
import { useDispatchTransaction } from "../../../../../contexts";
import { toRelationshipMultiplicitySetTransaction } from "./transactions";

type Interactions = {
  readonly onSourcePresetChange: (option: string) => void;
  readonly onTargetPresetChange: (option: string) => void;
  readonly onSourceDraftChange: (value: string) => void;
  readonly onTargetDraftChange: (value: string) => void;
  readonly onSourceDraftKeyDown: (key: string) => void;
  readonly onTargetDraftKeyDown: (key: string) => void;
};

type UseInteractionsInput = {
  readonly relationshipId: RelationshipId;
  readonly sourceMultiplicity: string | undefined;
  readonly targetMultiplicity: string | undefined;
  readonly sourceDraft: string;
  readonly targetDraft: string;
  readonly noneOption: string;
  readonly customOption: string;
  readonly setSourceDraft: Dispatch<SetStateAction<string>>;
  readonly setTargetDraft: Dispatch<SetStateAction<string>>;
  readonly setIsSourceCustom: Dispatch<SetStateAction<boolean>>;
  readonly setIsTargetCustom: Dispatch<SetStateAction<boolean>>;
};

export function useInteractions({
  relationshipId,
  sourceMultiplicity,
  targetMultiplicity,
  sourceDraft,
  targetDraft,
  noneOption,
  customOption,
  setSourceDraft,
  setTargetDraft,
  setIsSourceCustom,
  setIsTargetCustom,
}: UseInteractionsInput): Interactions {
  const dispatchTransaction = useDispatchTransaction();

  // Event handler props derivation
  const onSourcePresetChange = useCallback(
    (option: string) => {
      if (option === customOption) {
        setIsSourceCustom(true);
        return;
      }

      setIsSourceCustom(false);
      const multiplicity = option === noneOption ? null : option;
      setSourceDraft(multiplicity ?? "");
      if (multiplicity === (sourceMultiplicity ?? null)) return;
      dispatchTransaction(
        toRelationshipMultiplicitySetTransaction(relationshipId, "source", multiplicity)
      );
    },
    [
      customOption,
      dispatchTransaction,
      noneOption,
      relationshipId,
      setIsSourceCustom,
      setSourceDraft,
      sourceMultiplicity,
    ]
  );

  const onTargetPresetChange = useCallback(
    (option: string) => {
      if (option === customOption) {
        setIsTargetCustom(true);
        return;
      }

      setIsTargetCustom(false);
      const multiplicity = option === noneOption ? null : option;
      setTargetDraft(multiplicity ?? "");
      if (multiplicity === (targetMultiplicity ?? null)) return;
      dispatchTransaction(
        toRelationshipMultiplicitySetTransaction(relationshipId, "target", multiplicity)
      );
    },
    [
      customOption,
      dispatchTransaction,
      noneOption,
      relationshipId,
      setIsTargetCustom,
      setTargetDraft,
      targetMultiplicity,
    ]
  );

  const onSourceDraftChange = useCallback(
    (value: string) => {
      setSourceDraft(value);
    },
    [setSourceDraft]
  );

  const onTargetDraftChange = useCallback(
    (value: string) => {
      setTargetDraft(value);
    },
    [setTargetDraft]
  );

  const onSourceDraftKeyDown = useCallback(
    (key: string) => {
      if (key === "Escape") {
        setSourceDraft(sourceMultiplicity ?? "");
        return;
      }
      if (key !== "Enter") return;
      const multiplicity = sourceDraft.trim();
      dispatchTransaction(
        toRelationshipMultiplicitySetTransaction(
          relationshipId,
          "source",
          multiplicity === "" ? null : multiplicity
        )
      );
    },
    [dispatchTransaction, relationshipId, setSourceDraft, sourceDraft, sourceMultiplicity]
  );

  const onTargetDraftKeyDown = useCallback(
    (key: string) => {
      if (key === "Escape") {
        setTargetDraft(targetMultiplicity ?? "");
        return;
      }
      if (key !== "Enter") return;
      const multiplicity = targetDraft.trim();
      dispatchTransaction(
        toRelationshipMultiplicitySetTransaction(
          relationshipId,
          "target",
          multiplicity === "" ? null : multiplicity
        )
      );
    },
    [dispatchTransaction, relationshipId, setTargetDraft, targetDraft, targetMultiplicity]
  );

  return {
    onSourcePresetChange,
    onTargetPresetChange,
    onSourceDraftChange,
    onTargetDraftChange,
    onSourceDraftKeyDown,
    onTargetDraftKeyDown,
  };
}
