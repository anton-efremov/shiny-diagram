/**
 * @fileoverview Hook for translating style-pane edits into editor commands.
 */

import { useCallback } from "react";
import type { ClassBoxView } from "../../../controller/deriveViews";
import type { ClassId } from "../../../shared/ids";
import { useEditorDispatch } from "../../contexts/EditorDispatchContext";

type UseStylePaneControllerOptions = {
  selectedClassId: ClassId | null;
  selectedView: ClassBoxView | undefined;
};

type UseStylePaneControllerResult = {
  onFillColorChange: (fill: string) => void;
};

/**
 * Dispatches class style updates from style-pane controls.
 */
export function useStylePaneController({
  selectedClassId,
  selectedView,
}: UseStylePaneControllerOptions): UseStylePaneControllerResult {
  const dispatch = useEditorDispatch();

  const onFillColorChange = useCallback(
    (fill: string) => {
      if (!selectedClassId || !selectedView?.style) return;
      dispatch({
        type: "style.setClassProperty",
        classId: selectedClassId,
        property: "fill",
        value: fill,
      });
    },
    [selectedClassId, selectedView, dispatch]
  );

  return { onFillColorChange };
}
