import type { EditorCommand } from "../../../../../controller/commands";
import type { CanvasState } from "../../../../contexts/canvasState";

type UseMemberTableControllerOptions = {
  dispatch: (command: EditorCommand) => void;
  setCanvasState: (update: Partial<CanvasState>) => void;
};

// Stub — member editing is not yet implemented in the PoC.
export function useMemberTableController(_opts: UseMemberTableControllerOptions): Record<string, never> {
  return {};
}
