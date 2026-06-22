/**
 * @fileoverview Hook for translating ReactFlow class-box interactions into editor commands.
 */

import { useCallback } from "react";
import type { OnNodeDrag } from "@xyflow/react";
import type { ElementViews } from "../views";
import { useEditorDispatch } from "../../contexts/EditorDispatchContext";
import type { ClassBoxNodeDescriptor } from "./reactFlowAdapters";

type UseClassBoxInteractionsResult = {
  onNodeDragStop: OnNodeDrag<ClassBoxNodeDescriptor>;
};

/**
 * Dispatches class movement and selection updates from ReactFlow node events.
 */
export function useClassBoxNodeInteractions(
  views: ElementViews | null
): UseClassBoxInteractionsResult {
  const dispatch = useEditorDispatch();

  const onNodeDragStop = useCallback<OnNodeDrag<ClassBoxNodeDescriptor>>(
    (_event, _rfNode, rfNodes) => {
      const viewsById = new Map(views?.classes.map((view) => [view.classId, view]) ?? []);
      const moves = rfNodes.flatMap((rfNode) => {
        const view = viewsById.get(rfNode.data.classId);
        if (!view) return [];

        return [
          {
            classId: view.classId,
            rect: {
              x: rfNode.position.x,
              y: rfNode.position.y,
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
