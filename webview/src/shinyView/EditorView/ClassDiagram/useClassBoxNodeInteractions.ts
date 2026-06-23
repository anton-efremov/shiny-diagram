/**
 * @fileoverview Hook for translating ReactFlow class-box interactions into editor commands.
 */

import { useCallback } from "react";
import type { OnNodeDrag } from "@xyflow/react";
import { useDispatchCommand } from "../contexts";
import type { ClassBoxView } from "./ClassBox/views";
import type { ClassBoxNodeDescriptor } from "./reactFlowAdapters";

type UseClassBoxInteractionsResult = {
  onNodeDragStop: OnNodeDrag<ClassBoxNodeDescriptor>;
};

/**
 * Dispatches class movement and selection updates from ReactFlow node events.
 */
export function useClassBoxNodeInteractions(
  classes: readonly ClassBoxView[]
): UseClassBoxInteractionsResult {
  const dispatchCommand = useDispatchCommand();
  const onNodeDragStop = useCallback<OnNodeDrag<ClassBoxNodeDescriptor>>(
    (_event, _rfNode, rfNodes) => {
      const viewsById = new Map(classes.map((view) => [view.classId, view]));
      const finalPositionsByClassId = new Map(
        rfNodes.flatMap((rfNode) => {
          if (rfNode.type !== "classBox") return [];

          const view = viewsById.get(rfNode.data.view.view.classId);
          if (!view) return [];

          return [[view.classId, rfNode.position] as const];
        })
      );

      const moves = classes.flatMap((view) => {
        const position = finalPositionsByClassId.get(view.classId);
        if (!position) return [];

        return [
          {
            classId: view.classId,
            rect: {
              x: position.x,
              y: position.y,
              w: view.w,
              h: view.h,
            },
          },
        ];
      });

      if (moves.length === 0) return;
      dispatchCommand({ type: "class.move", moves });
    },
    [classes, dispatchCommand]
  );

  return { onNodeDragStop };
}
