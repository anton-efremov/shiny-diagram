/**
 * @fileoverview ClassBox interaction pipeline.
 * Translates framework-neutral resize data into class.resize commands.
 */

import { useCallback } from "react";
import type { Rect } from "../../../../../../../shared/geometry";
import type { ClassId } from "../../../../../../../shared/ids";
import { useDispatchCommand } from "../../../../../contexts";
import { toClassResizeCommand } from "./commands";

type UseClassBoxInteractionsResult = {
  readonly onResizeEnd: (rect: Rect) => void;
};

export function useClassBoxInteractions(classId: ClassId): UseClassBoxInteractionsResult {
  const dispatchCommand = useDispatchCommand();

  const onResizeEnd = useCallback(
    (rect: Rect) => {
      // @job logic:command:derive
      const command = toClassResizeCommand(classId, rect);

      // @job connect:command:wire
      dispatchCommand(command);
    },
    [classId, dispatchCommand]
  );

  return { onResizeEnd };
}
