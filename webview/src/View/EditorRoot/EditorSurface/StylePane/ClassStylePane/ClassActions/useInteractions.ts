/**
 * @behavior Class duplicate and delete transaction dispatch.
 */

import { useCallback } from "react";
import { useDispatchTransaction } from "../../../../../contexts";
import type { ClassView } from "../../../../../views/schema";
import { toClassDeleteTransaction, toClassDuplicateTransaction } from "./transactions";

type Interactions = {
  readonly onDuplicate: () => void;
  readonly onDelete: () => void;
};

export function useInteractions(view: readonly ClassView[]): Interactions {
  const dispatchTransaction = useDispatchTransaction();

  const onDuplicate = useCallback(() => {
    dispatchTransaction(toClassDuplicateTransaction(view));
  }, [dispatchTransaction, view]);

  const onDelete = useCallback(() => {
    dispatchTransaction(toClassDeleteTransaction(view));
  }, [dispatchTransaction, view]);

  return { onDuplicate, onDelete };
}
