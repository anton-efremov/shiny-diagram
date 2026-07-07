/**
 * @behavior Relationship label draft state reconciliation when the relationship label changes.
 */

import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";

type StateReconciliationInput = {
  readonly label: string | null | undefined;
  readonly setDraft: Dispatch<SetStateAction<string>>;
};

export function useStateReconciliation({ label, setDraft }: StateReconciliationInput): void {
  useEffect(() => {
    setDraft(label ?? "");
  }, [label, setDraft]);
}
