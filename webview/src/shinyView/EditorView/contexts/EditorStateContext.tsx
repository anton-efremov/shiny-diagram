/**
 * @fileoverview EditorView-owned render state context.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { EditorDispatch } from "../../commands/editorCommand";
import type { ClassId } from "../../../shared/ids";
import type { ClassBoxView } from "../ClassDiagram/ClassBox/views";
import type { PlacementMode } from "../placementMode";
import type { EditorViewModel, ElementViews } from "../views";
import { EditorDispatchProvider } from "./EditorDispatchContext";
import type { EditorViewAction } from "./EditorDispatchContext";

type EditorStatusModelState = {
  readonly view: EditorViewModel;
  readonly elements: ElementViews | null;
};

type EditorClassSelectionState = {
  readonly selectedClassIds: readonly ClassId[];
  readonly selectedClassViews: readonly ClassBoxView[];
};

type EditorPlacementModeState = {
  readonly placementMode: PlacementMode | null;
};

type EditorStateContextValue = EditorStatusModelState &
  EditorClassSelectionState &
  EditorPlacementModeState;

const EditorStateContext = createContext<EditorStateContextValue | null>(null);

type EditorViewProviderProps = {
  readonly view: EditorViewModel;
  readonly dispatch: EditorDispatch;
  readonly children: ReactNode;
};

export function EditorViewProvider({
  view,
  dispatch,
  children,
}: EditorViewProviderProps): ReactNode {
  const elements = view.status === "invalidSyntax" ? null : view.elements;
  const [selectedClassIds, setSelectedClassIdsRaw] = useState<readonly ClassId[]>([]);
  const [placementMode, setPlacementMode] = useState<PlacementMode | null>(null);

  useEffect(() => {
    setSelectedClassIdsRaw((prev) => {
      const reconciled = reconcileSelectedClassIds(prev, elements);
      return areClassIdCollectionsEqual(prev, reconciled) ? prev : reconciled;
    });
  }, [elements]);

  const viewDispatch = useCallback((action: EditorViewAction) => {
    switch (action.type) {
      case "selection.setClassIds":
        setSelectedClassIdsRaw((prev) =>
          areClassIdCollectionsEqual(prev, action.classIds) ? prev : action.classIds
        );
        return;
      case "selection.clearClassIds":
        setSelectedClassIdsRaw((prev) => (prev.length === 0 ? prev : []));
        return;
      case "placement.setMode":
        setPlacementMode(action.placementMode);
        return;
      case "placement.complete":
      case "placement.cancel":
        setPlacementMode(null);
        return;
    }
  }, []);

  const selectedClassViews = useMemo(() => {
    const selected = new Set(selectedClassIds);
    return elements?.classes.filter((classView) => selected.has(classView.classId)) ?? [];
  }, [elements, selectedClassIds]);

  const state = useMemo(
    () => ({ view, elements, selectedClassIds, selectedClassViews, placementMode }),
    [view, elements, selectedClassIds, selectedClassViews, placementMode]
  );

  return (
    <EditorStateContext.Provider value={state}>
      <EditorDispatchProvider commandDispatch={dispatch} viewDispatch={viewDispatch}>
        {children}
      </EditorDispatchProvider>
    </EditorStateContext.Provider>
  );
}

export function useEditorStatusModelState(): EditorStatusModelState {
  const state = useEditorStateContext();
  return { view: state.view, elements: state.elements };
}

export function useEditorClassSelectionState(): EditorClassSelectionState {
  const state = useEditorStateContext();
  return {
    selectedClassIds: state.selectedClassIds,
    selectedClassViews: state.selectedClassViews,
  };
}

export function useEditorPlacementModeState(): EditorPlacementModeState {
  const state = useEditorStateContext();
  return { placementMode: state.placementMode };
}

function useEditorStateContext(): EditorStateContextValue {
  const state = useContext(EditorStateContext);
  if (!state) throw new Error("Editor state hooks must be used within EditorViewProvider");
  return state;
}

function reconcileSelectedClassIds(
  selectedClassIds: readonly ClassId[],
  elements: ElementViews | null
): readonly ClassId[] {
  if (selectedClassIds.length === 0 || !elements)
    return selectedClassIds.length === 0 ? selectedClassIds : [];

  const selected = new Set(selectedClassIds);
  return elements.classes.flatMap((view) => (selected.has(view.classId) ? [view.classId] : []));
}

function areClassIdCollectionsEqual(left: readonly ClassId[], right: readonly ClassId[]): boolean {
  return left.length === right.length && left.every((id, index) => id === right[index]);
}
