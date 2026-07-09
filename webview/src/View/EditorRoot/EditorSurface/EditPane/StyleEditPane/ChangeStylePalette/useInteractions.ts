/**
 * @behavior Named style palette transaction dispatch.
 */

import { useCallback } from "react";
import { useDispatchTransaction } from "../../../../../contexts";
import type { StyleView } from "../../../../../views/schema";
import type { StylePropertyName } from "../../../../../../shared/style";
import { toStylePropertySetTransaction } from "./transactions";

type Interactions = {
  readonly onPropertyChange: (property: StylePropertyName, value: string | null) => void;
};

export function useInteractions(view: StyleView): Interactions {
  const dispatchTransaction = useDispatchTransaction();

  // Event handler props derivation
  const onPropertyChange = useCallback(
    (property: StylePropertyName, value: string | null) => {
      dispatchTransaction(toStylePropertySetTransaction(view, property, value));
    },
    [dispatchTransaction, view]
  );

  return { onPropertyChange };
}
