/**
 * @behavior Class resize command dispatch handler.
 */

import { useCallback } from "react";
import type { Rect } from "../../../../../../../shared/geometry";
import type { ClassId } from "../../../../../../../shared/ids";
import { useDispatchTransaction } from "../../../../../../contexts";
import { toClassResizeTransaction } from "./transactions";

type Interactions = {
  readonly onResizeEnd: (rect: Rect) => void;
};

export function useInteractions(classId: ClassId): Interactions {
  const dispatchCommand = useDispatchTransaction();

  // Event handler props derivation
  const onResizeEnd = useCallback(
    (rect: Rect) => {
      // Implementing interaction through command transaction
      const transaction = toClassResizeTransaction(classId, rect);
      dispatchCommand(transaction);
    },
    [classId, dispatchCommand]
  );

  return { onResizeEnd };
}
