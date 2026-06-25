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

// @job-helper connect:command:wire
export function useClassBoxInteractions(classId: ClassId): UseClassBoxInteractionsResult {
  const dispatchCommand = useDispatchCommand();

  // @job logic:command:derive
  const onResizeEnd = useCallback(
    (rect: Rect) => {
      // @job connect:command:wire
      dispatchCommand(toClassResizeCommand(classId, rect));
    },
    [classId, dispatchCommand]
  );

  return { onResizeEnd };
}
