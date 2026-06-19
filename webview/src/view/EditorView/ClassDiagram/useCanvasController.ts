import { useCallback } from "react";
import { useCanvasState } from "../../contexts/CanvasStateContext";

type UseCanvasControllerResult = {
  onPaneClick: () => void;
};

export function useCanvasController(): UseCanvasControllerResult {
  const { setCanvasState } = useCanvasState();

  const onPaneClick = useCallback(() => {
    setCanvasState({ selectedClassId: null });
  }, [setCanvasState]);

  return { onPaneClick };
}
