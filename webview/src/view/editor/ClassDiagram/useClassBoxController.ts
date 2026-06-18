import { useCallback } from "react";
import type { MouseEvent } from "react";
import type { OnNodeDrag } from "@xyflow/react";
import type { ElementViews } from "../../../controller/derive/viewModel";
import { useEditorDispatch } from "../../../controller/EditorDispatchContext";
import { useEditorSelection } from "../../../controller/EditorSelectionContext";
import type { ClassBoxNodeDescriptor } from "./reactFlowAdapters";

type UseClassBoxControllerResult = {
  onNodeDragStop: OnNodeDrag<ClassBoxNodeDescriptor>;
  onNodeClick: (event: MouseEvent, node: ClassBoxNodeDescriptor) => void;
};

export function useClassBoxController(views: ElementViews | null): UseClassBoxControllerResult {
  const dispatch = useEditorDispatch();
  const { onSelectionChange } = useEditorSelection();

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
      onSelectionChange({ selectedClassId: view.classId });
    },
    [views, onSelectionChange]
  );

  return { onNodeDragStop, onNodeClick };
}
