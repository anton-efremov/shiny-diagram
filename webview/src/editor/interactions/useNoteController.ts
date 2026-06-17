import type { EditorCommand } from "../../domain/classDiagram/commands/commandTypes";
import type { Selection } from "../selection";

type UseNoteControllerOptions = {
  dispatch: (command: EditorCommand) => void;
  onSelectionChange: (selection: Selection) => void;
};

// Stub — note editing is not yet implemented in the PoC.
export function useNoteController(_opts: UseNoteControllerOptions): Record<string, never> {
  return {};
}
