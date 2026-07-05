/**
 * @behavior Named style delete transaction dispatch.
 */

import { useCallback } from "react";
import { useDispatchTransaction } from "../../../../contexts";
import type { StyleView } from "../../../../views/schema";
import { toStyleDeleteTransaction } from "./transactions";

type Interactions = {
  readonly onDelete: () => void;
};

export function useInteractions(view: StyleView): Interactions {
  const dispatchTransaction = useDispatchTransaction();

  const onDelete = useCallback(() => {
    dispatchTransaction(toStyleDeleteTransaction(view));
  }, [dispatchTransaction, view]);

  return { onDelete };
}
