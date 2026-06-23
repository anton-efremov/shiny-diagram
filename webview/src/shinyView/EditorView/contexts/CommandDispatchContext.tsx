/**
 * @role [P] Presentational
 * @presents Transport-only command dispatch context.
 */

import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { EditorDispatch } from "../../commands/editorCommand";

const CommandDispatchContext = createContext<EditorDispatch | null>(null);

type CommandDispatchProviderProps = {
  readonly dispatchCommand: EditorDispatch;
  readonly children: ReactNode;
};

export function CommandDispatchProvider({
  dispatchCommand,
  children,
}: CommandDispatchProviderProps): ReactNode {
  // @job render:ui
  return (
    <CommandDispatchContext.Provider value={dispatchCommand}>
      {children}
    </CommandDispatchContext.Provider>
  );
}

export function useDispatchCommand(): EditorDispatch {
  const dispatchCommand = useContext(CommandDispatchContext);
  if (!dispatchCommand) {
    throw new Error("useDispatchCommand must be used within CommandDispatchProvider");
  }
  return dispatchCommand;
}
