/**
 * @fileoverview ClassDiagram interaction pipeline.
 * Translates drag, selection, and pane events into commands and state actions.
 */

import { useCallback } from "react";
import type { ClassId } from "../../../../shared/ids";
import type { ClassBoxView } from "./ClassBox/views";
import type { ClassPositionChange } from "./state";
import { toClassMoveCommand } from "./commands";
import { useDispatchCommand } from "../../contexts";
import { useDispatchEditorStateAction } from "../contexts";

type UseClassDiagramInteractionsResult = {
  readonly onDragComplete: (finalPositions: readonly ClassPositionChange[]) => void;
  readonly onSelectionChange: (classIds: readonly ClassId[]) => void;
  readonly onPaneClick: () => void;
};

// @job-helper logic:action:derive
export function useClassDiagramInteractions(
  classes: readonly ClassBoxView[]
): UseClassDiagramInteractionsResult {
  const dispatchCommand = useDispatchCommand();
  const dispatchEditorStateAction = useDispatchEditorStateAction();

  // @job logic:command:derive
  const onDragComplete = useCallback(
    (finalPositions: readonly ClassPositionChange[]) => {
      const sizeByClassId = new Map(classes.map((c) => [c.classId, { w: c.w, h: c.h }]));
      const moves = finalPositions.flatMap((pos) => {
        const size = sizeByClassId.get(pos.classId);
        if (!size) return [];
        return [{ classId: pos.classId, rect: { x: pos.x, y: pos.y, w: size.w, h: size.h } }];
      });
      if (moves.length > 0) {
        dispatchCommand(toClassMoveCommand(moves));
      }
    },
    [classes, dispatchCommand]
  );

  // @job connect:state:wire
  const onSelectionChange = useCallback(
    (classIds: readonly ClassId[]) => {
      dispatchEditorStateAction({ type: "selection.setClassIds", classIds });
    },
    [dispatchEditorStateAction]
  );

  // @job connect:state:wire
  const onPaneClick = useCallback(() => {
    dispatchEditorStateAction({ type: "selection.clearClassIds" });
  }, [dispatchEditorStateAction]);

  return { onDragComplete, onSelectionChange, onPaneClick };
}
