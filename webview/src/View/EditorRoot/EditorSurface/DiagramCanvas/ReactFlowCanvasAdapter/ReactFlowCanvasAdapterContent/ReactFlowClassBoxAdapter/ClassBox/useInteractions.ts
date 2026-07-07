/**
 * @behavior Class-box selection and class resize semantic handlers.
 * @framework DOM click modifier state to additive class selection fact.
 */

import { useCallback } from "react";
import type { MouseEvent } from "react";
import type { Rect } from "../../../../../../../../shared/geometry";
import type { ClassId } from "../../../../../../../../shared/ids";
import { useDispatchTransaction } from "../../../../../../../contexts";
import { toClassResizeTransaction } from "./transactions";

type Interactions = {
  readonly onClassBoxClick: (event: MouseEvent<HTMLDivElement>) => void;
  readonly onResizeEnd: (rect: Rect) => void;
};

export function useInteractions(
  classId: ClassId,
  onClassSelect: (classId: ClassId, additive: boolean) => void
): Interactions {
  const dispatchCommand = useDispatchTransaction();

  // Event handler props derivation
  const onClassBoxClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();
      onClassSelect(classId, event.ctrlKey || event.metaKey);
    },
    [classId, onClassSelect]
  );

  const onResizeEnd = useCallback(
    (rect: Rect) => {
      // Implementing interaction through command transaction
      const transaction = toClassResizeTransaction(classId, rect);
      dispatchCommand(transaction);
    },
    [classId, dispatchCommand]
  );

  return { onClassBoxClick, onResizeEnd };
}
