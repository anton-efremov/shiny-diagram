import type { EditorCommand } from "../../domain/classDiagram/commands/commandTypes";
import type { Selection } from "../selection";

type UseNamespaceControllerOptions = {
  dispatch: (command: EditorCommand) => void;
  onSelectionChange: (selection: Selection) => void;
};

// Stub — namespace drag is not yet implemented in the PoC.
export function useNamespaceController(_opts: UseNamespaceControllerOptions): Record<string, never> {
  return {};
}
