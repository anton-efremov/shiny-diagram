import { useCallback } from "react";
import type { ClassBoxView, ClassId } from "../../../controller";
import { useEditorDispatch } from "../../../controller";

type UseStylePaneControllerOptions = {
  selectedClassId: ClassId | null;
  selectedView: ClassBoxView | undefined;
};

type UseStylePaneControllerResult = {
  onFillColorChange: (fill: string) => void;
};

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
