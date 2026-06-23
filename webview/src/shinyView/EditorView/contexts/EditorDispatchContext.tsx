/**
 * @fileoverview EditorView-owned dispatch contexts.
 */

import { createContext, useContext } from "react";
import type { Dispatch, ReactNode } from "react";
import type { EditorDispatch } from "../../commands/editorCommand";
import type { ClassId } from "../../../shared/ids";
import type { PlacementMode } from "../placementMode";

export type EditorViewAction =
  | {
      readonly type: "selection.setClassIds";
      readonly classIds: readonly ClassId[];
    }
  | {
      readonly type: "selection.clearClassIds";
    }
  | {
      readonly type: "placement.setMode";
      readonly placementMode: PlacementMode;
    }
  | {
      readonly type: "placement.complete";
    }
  | {
      readonly type: "placement.cancel";
    };

const EditorCommandDispatchContext = createContext<EditorDispatch | null>(null);
const EditorViewDispatchContext = createContext<Dispatch<EditorViewAction> | null>(null);

type EditorDispatchProviderProps = {
  readonly commandDispatch: EditorDispatch;
  readonly viewDispatch: Dispatch<EditorViewAction>;
  readonly children: ReactNode;
};

export function EditorDispatchProvider({
  commandDispatch,
  viewDispatch,
  children,
}: EditorDispatchProviderProps): ReactNode {
  return (
    <EditorCommandDispatchContext.Provider value={commandDispatch}>
      <EditorViewDispatchContext.Provider value={viewDispatch}>
        {children}
      </EditorViewDispatchContext.Provider>
    </EditorCommandDispatchContext.Provider>
  );
}

export function useEditorCommandDispatch(): EditorDispatch {
  const dispatch = useContext(EditorCommandDispatchContext);
  if (!dispatch) throw new Error("useEditorCommandDispatch must be used within EditorViewProvider");
  return dispatch;
}

export function useEditorViewDispatch(): Dispatch<EditorViewAction> {
  const dispatch = useContext(EditorViewDispatchContext);
  if (!dispatch) throw new Error("useEditorViewDispatch must be used within EditorViewProvider");
  return dispatch;
}
