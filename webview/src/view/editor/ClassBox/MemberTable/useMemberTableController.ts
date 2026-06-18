import type { EditorCommand } from "../../../../controller/commands/commandTypes";
import type { Selection } from "../../../../controller/selection";

type UseMemberTableControllerOptions = {
  dispatch: (command: EditorCommand) => void;
  onSelectionChange: (selection: Selection) => void;
};

// Stub — member editing is not yet implemented in the PoC.
export function useMemberTableController(_opts: UseMemberTableControllerOptions): Record<string, never> {
  return {};
}
