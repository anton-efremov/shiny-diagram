/**
 * @fileoverview ClassDiagram interaction pipeline.
 * Translates drag events into commands.
 */

import { useCallback } from "react";
import type { ClassView } from "../../../views/schema";
import type { ClassPositionChange } from "./state";
import { toClassMoveTransaction } from "./commands";
import { useDispatchTransaction } from "../../contexts";

type UseClassDiagramInteractionsResult = {
  readonly onDragComplete: (finalPositions: readonly ClassPositionChange[]) => void;
};

export function useClassDiagramInteractions(
  classes: readonly ClassView[]
): UseClassDiagramInteractionsResult {
  const dispatchCommand = useDispatchTransaction();

  // @job logic:command:derive
  const onDragComplete = useCallback(
    (finalPositions: readonly ClassPositionChange[]) => {
      const moves = finalPositions.flatMap((pos) => {
        if (!classes.some((classView) => classView.classId === pos.classId)) return [];
        return [{ classId: pos.classId, position: { x: pos.x, y: pos.y } }];
      });
      if (moves.length > 0) {
        dispatchCommand(toClassMoveTransaction(moves));
      }
    },
    [classes, dispatchCommand]
  );

  return { onDragComplete };
}
