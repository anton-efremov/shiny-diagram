/**
 * @behavior Named style selector transaction dispatch.
 */

import { useCallback } from "react";
import { useDispatchTransaction } from "../../../../../contexts";
import type { ClassView } from "../../../../../views/schema";
import type { StyleDefId } from "../../../../../../shared/ids";
import { toNamedStyleSelectTransaction } from "./transactions";

type Interactions = {
  readonly onStyleChange: (styleDefId: StyleDefId | null) => void;
};

export function useInteractions(view: readonly ClassView[]): Interactions {
  const dispatchTransaction = useDispatchTransaction();

  // Event handler props derivation
  const onStyleChange = useCallback(
    (styleDefId: StyleDefId | null) => {
      dispatchTransaction(toNamedStyleSelectTransaction(view, styleDefId));
    },
    [dispatchTransaction, view]
  );
  return { onStyleChange };
}
