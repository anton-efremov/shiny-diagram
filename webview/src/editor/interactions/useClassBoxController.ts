import { useCallback } from "react";
import type { MouseEvent } from "react";
import type { OnNodeDrag } from "@xyflow/react";
import type { EditorCommand } from "../../domain/classDiagram/commands/commandTypes";
import type { ElementViews } from "../../domain/classDiagram/derive/viewModel";
import type { Selection } from "../selection";
import type { ClassBoxNodeDescriptor } from "../components/reactFlowAdapters";

type UseClassBoxControllerOptions = {
  views: ElementViews;
  dispatch: (command: EditorCommand) => void;
  onSelectionChange: (selection: Selection) => void;
};

type UseClassBoxControllerResult = {
  onNodeDragStop: OnNodeDrag<ClassBoxNodeDescriptor>;
  onNodeClick: (event: MouseEvent, node: ClassBoxNodeDescriptor) => void;
};

export function useClassBoxController({
  views,
  dispatch,
  onSelectionChange,
}: UseClassBoxControllerOptions): UseClassBoxControllerResult {
  const onNodeDragStop = useCallback<OnNodeDrag<ClassBoxNodeDescriptor>>(
    (_event, rfNode) => {
      const view = views.classes.find((v) => v.classId === rfNode.id);
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
      const view = views.classes.find((v) => v.classId === rfNode.id);
      if (!view) return;
      onSelectionChange({ selectedClassId: view.classId });
    },
    [views, onSelectionChange]
  );

  return { onNodeDragStop, onNodeClick };
}
