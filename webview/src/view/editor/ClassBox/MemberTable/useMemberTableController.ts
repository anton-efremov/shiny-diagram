import type { EditorCommand, CanvasState } from "../../../../controller";

type UseMemberTableControllerOptions = {
  dispatch: (command: EditorCommand) => void;
  setCanvasState: (update: Partial<CanvasState>) => void;
};

// Stub — member editing is not yet implemented in the PoC.
export function useMemberTableController(_opts: UseMemberTableControllerOptions): Record<string, never> {
  return {};
}
