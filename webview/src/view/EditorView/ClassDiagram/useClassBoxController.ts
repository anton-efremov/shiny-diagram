/**
 * @fileoverview Hook for translating ReactFlow class-box interactions into editor commands.
 */

import { useCallback } from "react";
import type { MouseEvent } from "react";
import type { OnNodeDrag } from "@xyflow/react";
import type { ElementViews } from "../../../controller/deriveViews";
import { useEditorDispatch } from "../../contexts/EditorDispatchContext";
import { useCanvasState } from "../../contexts/CanvasStateContext";
import type { ClassBoxNodeDescriptor } from "./reactFlowAdapters";

type UseClassBoxControllerResult = {
  onNodeDragStop: OnNodeDrag<ClassBoxNodeDescriptor>;
  onNodeClick: (event: MouseEvent, node: ClassBoxNodeDescriptor) => void;
};

/**
 * Dispatches class movement and selection updates from ReactFlow node events.
 */
export function useClassBoxController(views: ElementViews | null): UseClassBoxControllerResult {
  const dispatch = useEditorDispatch();
  const { setCanvasState } = useCanvasState();

  const onNodeDragStop = useCallback<OnNodeDrag<ClassBoxNodeDescriptor>>(
    (_event, rfNode) => {
      const view = views?.classes.find((v) => v.classId === rfNode.id);
      if (!view) return;

      dispatch({
        type: "class.move",
        classId: view.classId,
        rect: {
          x: rfNode.position.x,
          y: rfNode.position.y,
          w: view.w,
          h: view.h,
        },
      });
    },
    [views, dispatch]
  );

  const onNodeClick = useCallback(
    (_event: MouseEvent, rfNode: ClassBoxNodeDescriptor) => {
      const view = views?.classes.find((v) => v.classId === rfNode.id);
      if (!view) return;
      setCanvasState({ selectedClassId: view.classId });
    },
    [views, setCanvasState]
  );

  return { onNodeDragStop, onNodeClick };
}
