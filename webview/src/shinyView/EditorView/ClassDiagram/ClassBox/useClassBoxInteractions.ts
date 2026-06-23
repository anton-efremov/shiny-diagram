/**
 * @fileoverview Hook for translating class-box interactions into editor commands.
 */

import { useCallback } from "react";
import type { OnResizeEnd } from "@xyflow/react";
import { useDispatchCommand } from "../../contexts";
import type { ClassBoxView } from "./views";

type UseClassBoxInteractionsResult = {
  onResizeEnd: OnResizeEnd;
};

/**
 * Dispatches class-box resize commands from ReactFlow node resize events.
 */
export function useClassBoxInteractions(data: ClassBoxView): UseClassBoxInteractionsResult {
  const dispatchCommand = useDispatchCommand();
  const onResizeEnd = useCallback<OnResizeEnd>(
    (_event, params) => {
      dispatchCommand({
        type: "class.resize",
        classId: data.classId,
        rect: {
          x: params.x,
          y: params.y,
          w: params.width,
          h: params.height,
        },
      });
    },
    [data.classId, dispatchCommand]
  );

  return { onResizeEnd };
}
