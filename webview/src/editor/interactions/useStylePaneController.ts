import { useCallback } from "react";
import type { EditorCommand } from "../../domain/classDiagram/commands/commandTypes";
import type { ClassBoxView } from "../../domain/classDiagram/derive/viewModel";
import type { ClassId } from "../../domain/classDiagram/model/primitives";

type UseStylePaneControllerOptions = {
  selectedClassId: ClassId | null;
  selectedView: ClassBoxView | undefined;
  dispatch: (command: EditorCommand) => void;
};

type UseStylePaneControllerResult = {
  onFillColorChange: (fill: string) => void;
};

export function useStylePaneController({
  selectedClassId,
  selectedView,
  dispatch,
}: UseStylePaneControllerOptions): UseStylePaneControllerResult {
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
