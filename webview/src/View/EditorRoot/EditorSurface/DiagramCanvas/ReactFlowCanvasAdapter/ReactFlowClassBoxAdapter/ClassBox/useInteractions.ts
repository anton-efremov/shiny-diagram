/**
 * @behavior Class-box selection and class resize semantic handlers.
 * @framework DOM click modifier state to additive class selection fact.
 */

import { useCallback } from "react";
import type { MouseEvent } from "react";
import type { Rect } from "../../../../../../../shared/geometry";
import type { ClassId } from "../../../../../../../shared/ids";
import { useDispatchTransaction } from "../../../../../../contexts";
import { toClassHeaderCommitTransaction, toClassResizeTransaction } from "./transactions";

type Interactions = {
  readonly onClassBoxClick: (event: MouseEvent<HTMLDivElement>) => void;
  readonly onResizeEnd: (rect: Rect) => void;
  readonly onHeaderCommit: (
    block: "annotation" | "name" | "label",
    value: string | null
  ) => readonly string[];
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

  const onHeaderCommit = useCallback(
    (block: "annotation" | "name" | "label", value: string | null) => {
      const result = dispatchCommand(toClassHeaderCommitTransaction(classId, block, value));
      return result.status === "rejected" ? result.errors.map((error) => error.message) : [];
    },
    [classId, dispatchCommand]
  );

  return { onClassBoxClick, onResizeEnd, onHeaderCommit };
}
