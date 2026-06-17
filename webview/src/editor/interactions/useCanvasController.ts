import { useCallback } from "react";
import type { Selection } from "../selection";

type UseCanvasControllerOptions = {
  onSelectionChange: (selection: Selection) => void;
};

type UseCanvasControllerResult = {
  onPaneClick: () => void;
};

export function useCanvasController({
  onSelectionChange,
}: UseCanvasControllerOptions): UseCanvasControllerResult {
  const onPaneClick = useCallback(() => {
    onSelectionChange({ selectedClassId: null });
  }, [onSelectionChange]);

  return { onPaneClick };
}
