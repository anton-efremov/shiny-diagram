import type { EditorCommand } from "../../domain/classDiagram/commands/commandTypes";

type UseToolPaneControllerOptions = {
  dispatch: (command: EditorCommand) => void;
};

// Stub — tool drag-to-canvas is not yet implemented in the PoC.
export function useToolPaneController(_opts: UseToolPaneControllerOptions): Record<string, never> {
  return {};
}
