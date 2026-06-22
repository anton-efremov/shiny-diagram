/**
 * @fileoverview Hook for translating ReactFlow class-box interactions into editor commands.
 */

import { useCallback } from "react";
import type { OnNodeDrag } from "@xyflow/react";
import type { EditorDispatch } from "../../commands/editorCommand";
import type { ElementViews } from "../views";
import type { ClassBoxNodeDescriptor } from "./reactFlowAdapters";

type UseClassBoxInteractionsResult = {
  onNodeDragStop: OnNodeDrag<ClassBoxNodeDescriptor>;
};

/**
 * Dispatches class movement and selection updates from ReactFlow node events.
 */
export function useClassBoxNodeInteractions(
  views: ElementViews,
  dispatch: EditorDispatch
): UseClassBoxInteractionsResult {
  const onNodeDragStop = useCallback<OnNodeDrag<ClassBoxNodeDescriptor>>(
    (_event, _rfNode, rfNodes) => {
      const viewsById = new Map(views.classes.map((view) => [view.classId, view]));
      const finalPositionsByClassId = new Map(
        rfNodes.flatMap((rfNode) => {
          if (rfNode.type !== "classBox") return [];

          const view = viewsById.get(rfNode.data.classId);
          if (!view) return [];

          return [[view.classId, rfNode.position] as const];
        })
      );

      const moves = views.classes.flatMap((view) => {
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
      dispatch({ type: "class.move", moves });
    },
    [views, dispatch]
  );

  return { onNodeDragStop };
}
