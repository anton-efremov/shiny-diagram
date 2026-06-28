/**
 * @fileoverview ClassBox interaction pipeline.
 * Translates framework-neutral resize data into class position and size transactions.
 */

import { useCallback } from "react";
import type { Rect } from "../../../../../../../shared/geometry";
import type { ClassId } from "../../../../../../../shared/ids";
import { useDispatchTransaction } from "../../../../../contexts";
import { toClassResizeTransaction } from "./commands";

type UseClassBoxInteractionsResult = {
  readonly onResizeEnd: (rect: Rect) => void;
};

export function useClassBoxInteractions(classId: ClassId): UseClassBoxInteractionsResult {
  const dispatchCommand = useDispatchTransaction();

  const onResizeEnd = useCallback(
    (rect: Rect) => {
      // @job logic:command:derive
      const transaction = toClassResizeTransaction(classId, rect);

      // @job connect:command:wire
      dispatchCommand(transaction);
    },
    [classId, dispatchCommand]
  );

  return { onResizeEnd };
}
