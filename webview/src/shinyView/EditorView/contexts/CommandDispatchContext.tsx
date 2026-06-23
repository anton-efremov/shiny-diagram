/**
 * @role [P] Presentational
 * @presents Transport-only command dispatch context.
 */

import { createContext, useContext } from "react";
import type { EditorDispatch } from "../../commands/editorCommand";

export const CommandDispatchContext = createContext<EditorDispatch | null>(null);

export function useDispatchCommand(): EditorDispatch {
  const dispatchCommand = useContext(CommandDispatchContext);
  if (!dispatchCommand) {
    throw new Error("useDispatchCommand must be used within CommandDispatchProvider");
  }
  return dispatchCommand;
}
