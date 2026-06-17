import type { EditorCommand } from "../../domain/classDiagram/commands/commandTypes";
import type { Selection } from "../selection";

type UseRelationshipControllerOptions = {
  dispatch: (command: EditorCommand) => void;
  onSelectionChange: (selection: Selection) => void;
};

// Stub — relationship editing is not yet implemented in the PoC.
export function useRelationshipController(_opts: UseRelationshipControllerOptions): Record<string, never> {
  return {};
}
