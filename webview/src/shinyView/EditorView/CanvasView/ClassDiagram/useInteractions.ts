/**
 * @fileoverview ClassDiagram interaction pipeline.
 * Translates drag, selection, and pane events into commands and state actions.
 */

import { useCallback } from "react";
import type { ClassId } from "../../../../shared/ids";
import type { ClassView } from "../../../views/schema";
import type { ClassPositionChange } from "./state";
import { toClassMoveTransaction } from "./commands";
import { useDispatchCommand } from "../../contexts";
import { useDispatchCanvasViewStateAction } from "../contexts";

type UseClassDiagramInteractionsResult = {
  readonly onDragComplete: (finalPositions: readonly ClassPositionChange[]) => void;
  readonly onSelectionChange: (classIds: readonly ClassId[]) => void;
  readonly onPaneClick: () => void;
};

export function useClassDiagramInteractions(
  classes: readonly ClassView[]
): UseClassDiagramInteractionsResult {
  const dispatchCommand = useDispatchCommand();
  const dispatchCanvasViewStateAction = useDispatchCanvasViewStateAction();

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

  // @job connect:state:wire
  const onSelectionChange = useCallback(
    (classIds: readonly ClassId[]) => {
      dispatchCanvasViewStateAction({ type: "selection.setClassIds", classIds });
    },
    [dispatchCanvasViewStateAction]
  );

  const onPaneClick = useCallback(() => {
    dispatchCanvasViewStateAction({ type: "selection.clearClassIds" });
  }, [dispatchCanvasViewStateAction]);

  return { onDragComplete, onSelectionChange, onPaneClick };
}
