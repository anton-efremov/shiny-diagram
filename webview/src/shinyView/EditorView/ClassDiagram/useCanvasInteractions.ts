/**
 * @fileoverview Hook for translating canvas pane interactions into View state updates.
 */

import { useCallback, useRef } from "react";
import type { OnSelectionChangeFunc } from "@xyflow/react";
import type { ClassId } from "../../../shared/ids";
import type { ClassBoxView } from "./ClassBox/views";
import type { ClassBoxNodeDescriptor, RelationshipEdgeDescriptor } from "./reactFlowAdapters";

type UseCanvasInteractionsResult = {
  onSelectionChange: OnSelectionChangeFunc<ClassBoxNodeDescriptor, RelationshipEdgeDescriptor>;
  onPaneClick: () => void;
};

/**
 * Synchronizes ReactFlow selection to View-owned canvas state.
 */
export function useCanvasInteractions(
  classes: readonly ClassBoxView[],
  onSelectedClassIdsChange: (classIds: readonly ClassId[]) => void
): UseCanvasInteractionsResult {
  const classIdOrderRef = useRef<readonly ClassId[]>([]);
  const onSelectedClassIdsChangeRef = useRef(onSelectedClassIdsChange);
  classIdOrderRef.current = classes.map((view) => view.classId);
  onSelectedClassIdsChangeRef.current = onSelectedClassIdsChange;

  const onSelectionChange = useCallback<
    OnSelectionChangeFunc<ClassBoxNodeDescriptor, RelationshipEdgeDescriptor>
  >(({ nodes }) => {
    const selected = new Set<ClassId>();
    for (const node of nodes) {
      if (node.type === "classBox") {
        selected.add(node.data.classId);
      }
    }

    const orderedSelection = classIdOrderRef.current.flatMap((classId) =>
      selected.has(classId) ? [classId] : []
    );

    onSelectedClassIdsChangeRef.current(orderedSelection);
  }, []);

  const onPaneClick = useCallback(() => {
    onSelectedClassIdsChangeRef.current([]);
  }, []);

  return { onSelectionChange, onPaneClick };
}
