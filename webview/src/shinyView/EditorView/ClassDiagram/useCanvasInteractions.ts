/**
 * @fileoverview Hook for translating canvas pane interactions into View state updates.
 */

import { useCallback, useRef } from "react";
import type { OnSelectionChangeFunc } from "@xyflow/react";
import type { ClassId } from "../../../shared/ids";
import {
  useEditorClassSelectionState,
  useEditorStatusModelState,
  useEditorViewDispatch,
} from "../contexts";
import type { ClassBoxNodeDescriptor, RelationshipEdgeDescriptor } from "./reactFlowAdapters";

type UseCanvasInteractionsResult = {
  onSelectionChange: OnSelectionChangeFunc<ClassBoxNodeDescriptor, RelationshipEdgeDescriptor>;
  onPaneClick: () => void;
};

/**
 * Synchronizes ReactFlow selection to View-owned canvas state.
 */
export function useCanvasInteractions(): UseCanvasInteractionsResult {
  const { elements } = useEditorStatusModelState();
  const { selectedClassIds } = useEditorClassSelectionState();
  const dispatch = useEditorViewDispatch();
  const classIdOrderRef = useRef<readonly ClassId[]>([]);
  classIdOrderRef.current = elements?.classes.map((view) => view.classId) ?? selectedClassIds;

  const onSelectionChange = useCallback<
    OnSelectionChangeFunc<ClassBoxNodeDescriptor, RelationshipEdgeDescriptor>
  >(
    ({ nodes }) => {
      const selected = new Set<ClassId>();
      for (const node of nodes) {
        if (node.type === "classBox") {
          selected.add(node.data.classId);
        }
      }

      const orderedSelection = classIdOrderRef.current.flatMap((classId) =>
        selected.has(classId) ? [classId] : []
      );

      dispatch({ type: "selection.setClassIds", classIds: orderedSelection });
    },
    [dispatch]
  );

  const onPaneClick = useCallback(() => {
    dispatch({ type: "selection.clearClassIds" });
  }, [dispatch]);

  return { onSelectionChange, onPaneClick };
}
