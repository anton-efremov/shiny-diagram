import { useCallback } from "react";
import { useEditorSelection } from "../../../controller/EditorSelectionContext";

type UseCanvasControllerResult = {
  onPaneClick: () => void;
};

export function useCanvasController(): UseCanvasControllerResult {
  const { onSelectionChange } = useEditorSelection();

  const onPaneClick = useCallback(() => {
    onSelectionChange({ selectedClassId: null });
  }, [onSelectionChange]);

  return { onPaneClick };
}
