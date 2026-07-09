/**
 * @behavior Relationship multiplicity draft and custom mode reconciliation when multiplicities change.
 */

import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";

type StateReconciliationInput = {
  readonly sourceMultiplicity: string | undefined;
  readonly targetMultiplicity: string | undefined;
  readonly presetOptions: readonly string[];
  readonly setSourceDraft: Dispatch<SetStateAction<string>>;
  readonly setTargetDraft: Dispatch<SetStateAction<string>>;
  readonly setIsSourceCustom: Dispatch<SetStateAction<boolean>>;
  readonly setIsTargetCustom: Dispatch<SetStateAction<boolean>>;
};

export function useStateReconciliation({
  sourceMultiplicity,
  targetMultiplicity,
  presetOptions,
  setSourceDraft,
  setTargetDraft,
  setIsSourceCustom,
  setIsTargetCustom,
}: StateReconciliationInput): void {
  useEffect(() => {
    setSourceDraft(sourceMultiplicity ?? "");
    setIsSourceCustom(isCustomMultiplicity(sourceMultiplicity, presetOptions));
  }, [presetOptions, sourceMultiplicity, setIsSourceCustom, setSourceDraft]);

  useEffect(() => {
    setTargetDraft(targetMultiplicity ?? "");
    setIsTargetCustom(isCustomMultiplicity(targetMultiplicity, presetOptions));
  }, [presetOptions, targetMultiplicity, setIsTargetCustom, setTargetDraft]);
}

// Private helpers
function isCustomMultiplicity(
  value: string | undefined,
  presetOptions: readonly string[]
): boolean {
  return value !== undefined && value !== "" && !presetOptions.includes(value);
}
