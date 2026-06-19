/**
 * @fileoverview Hook placeholder for class member table interactions.
 */

import type { EditorCommand } from "../../../../../controller/commands";
import type { CanvasState } from "../../../../contexts/canvasState";

type UseMemberTableControllerOptions = {
  dispatch: (command: EditorCommand) => void;
  setCanvasState: (update: Partial<CanvasState>) => void;
};

/**
 * Returns no member interactions while member editing is not implemented.
 */
export function useMemberTableController(
  _opts: UseMemberTableControllerOptions
): Record<string, never> {
  return {};
}
