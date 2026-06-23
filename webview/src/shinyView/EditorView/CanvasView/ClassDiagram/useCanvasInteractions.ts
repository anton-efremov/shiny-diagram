/**
 * @fileoverview Hook for translating canvas pane interactions into View state updates.
 */

import { useCallback, useRef } from "react";
import type { OnSelectionChangeFunc } from "@xyflow/react";
import type { ClassId } from "../../../../shared/ids";
import { useDispatchEditorStateAction } from "../../contexts";
import type { ClassBoxNodeDescriptor, RelationshipEdgeDescriptor } from "./reactFlowAdapters";

type UseCanvasInteractionsResult = {
  onSelectionChange: OnSelectionChangeFunc<ClassBoxNodeDescriptor, RelationshipEdgeDescriptor>;
  onPaneClick: () => void;
};

/**
 * Synchronizes ReactFlow selection to View-owned canvas state.
 */
export function useCanvasInteractions(
  classIdOrder: readonly ClassId[]
): UseCanvasInteractionsResult {
  const dispatchEditorStateAction = useDispatchEditorStateAction();
  const classIdOrderRef = useRef<readonly ClassId[]>([]);
  classIdOrderRef.current = classIdOrder;

  const onSelectionChange = useCallback<
    OnSelectionChangeFunc<ClassBoxNodeDescriptor, RelationshipEdgeDescriptor>
  >(
    ({ nodes }) => {
      const selected = new Set<ClassId>();
      for (const node of nodes) {
        if (node.type === "classBox") {
          selected.add(node.data.view.view.classId);
        }
      }

      const orderedSelection = classIdOrderRef.current.flatMap((classId) =>
        selected.has(classId) ? [classId] : []
      );

      dispatchEditorStateAction({ type: "selection.setClassIds", classIds: orderedSelection });
    },
    [dispatchEditorStateAction]
  );

  const onPaneClick = useCallback(() => {
    dispatchEditorStateAction({ type: "selection.clearClassIds" });
  }, [dispatchEditorStateAction]);

  return { onSelectionChange, onPaneClick };
}
