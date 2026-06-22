/**
 * @fileoverview Hook for translating canvas pane interactions into View state updates.
 */

import { useCallback } from "react";
import type { OnSelectionChangeFunc } from "@xyflow/react";
import { useCanvasState } from "../../../contexts/CanvasStateContext";
import type { ElementViews } from "../views";
import type { ClassId } from "../../../../shared/ids";
import type { ClassBoxNodeDescriptor, RelationshipEdgeDescriptor } from "./reactFlowAdapters";

type UseCanvasInteractionsResult = {
  onSelectionChange: OnSelectionChangeFunc<ClassBoxNodeDescriptor, RelationshipEdgeDescriptor>;
};

/**
 * Synchronizes ReactFlow selection to View-owned canvas state.
 */
export function useCanvasInteractions(views: ElementViews | null): UseCanvasInteractionsResult {
  const { canvasState, setCanvasState } = useCanvasState();

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

      const orderedSelection =
        views?.classes.flatMap((view) => (selected.has(view.classId) ? [view.classId] : [])) ?? [];

      if (areClassIdCollectionsEqual(canvasState.selectedClassIds, orderedSelection)) return;

      setCanvasState({ selectedClassIds: orderedSelection });
    },
    [views, canvasState.selectedClassIds, setCanvasState]
  );

  return { onSelectionChange };
}

function areClassIdCollectionsEqual(left: readonly ClassId[], right: readonly ClassId[]): boolean {
  return left.length === right.length && left.every((id, index) => id === right[index]);
}
