/**
 * @behavior Class style palette transaction dispatch.
 */

import { useCallback } from "react";
import { useDispatchTransaction } from "../../../../../contexts";
import type { ClassView } from "../../../../../views/schema";
import type { StylePropertyName } from "../../../../../../shared/style";
import { toClassStylePropertySetTransaction } from "./transactions";

type Interactions = {
  readonly onPropertyChange: (property: StylePropertyName, value: string | null) => void;
};

export function useInteractions(view: readonly ClassView[]): Interactions {
  const dispatchTransaction = useDispatchTransaction();

  const onPropertyChange = useCallback(
    (property: StylePropertyName, value: string | null) => {
      dispatchTransaction(toClassStylePropertySetTransaction(view, property, value));
    },
    [dispatchTransaction, view]
  );

  return { onPropertyChange };
}
