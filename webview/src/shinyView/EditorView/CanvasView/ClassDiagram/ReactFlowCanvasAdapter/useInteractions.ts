/**
 * @fileoverview ReactFlowCanvasAdapter interaction pipeline.
 * Normalizes React Flow canvas events into framework-neutral callbacks for ClassDiagram.
 */

import { useCallback } from "react";
import type { NodeChange, OnNodeDrag, OnSelectionChangeFunc } from "@xyflow/react";
import type { ClassId } from "../../../../../shared/ids";
import type { ClassPositionChange } from "../state";
import type { ClassBoxNodeDescriptor, RelationshipEdgeDescriptor } from "./reactFlowAdapters";
import type { ReactFlowCanvasAdapterView } from "./views";

type ReactFlowCanvasAdapterCallbacks = {
  readonly onLayoutChange: (changes: readonly ClassPositionChange[]) => void;
  readonly onDragComplete: (finalPositions: readonly ClassPositionChange[]) => void;
  readonly onSelectionChange: (classIds: readonly ClassId[]) => void;
  readonly onPaneClick: () => void;
};

type UseReactFlowCanvasAdapterInteractionsResult = {
  readonly onNodesChange: (changes: NodeChange<ClassBoxNodeDescriptor>[]) => void;
  readonly onNodeDragStop: OnNodeDrag<ClassBoxNodeDescriptor>;
  readonly onSelectionChange: OnSelectionChangeFunc<
    ClassBoxNodeDescriptor,
    RelationshipEdgeDescriptor
  >;
  readonly onPaneClick: () => void;
};

// @job-helper connect:event:normalize
export function useReactFlowCanvasAdapterInteractions(
  view: ReactFlowCanvasAdapterView,
  callbacks: ReactFlowCanvasAdapterCallbacks
): UseReactFlowCanvasAdapterInteractionsResult {
  // @job connect:event:normalize
  const onNodesChange = useCallback(
    (changes: NodeChange<ClassBoxNodeDescriptor>[]) => {
      const positionChanges = changes.flatMap((change) => {
        if (change.type !== "position" || change.position === undefined) return [];
        return [{ classId: change.id as ClassId, x: change.position.x, y: change.position.y }];
      });
      if (positionChanges.length > 0) {
        callbacks.onLayoutChange(positionChanges);
      }
    },
    [callbacks]
  );

  // @job connect:event:normalize
  const onNodeDragStop = useCallback<OnNodeDrag<ClassBoxNodeDescriptor>>(
    (_event, _node, rfNodes) => {
      const finalPositions = rfNodes.flatMap((rfNode) => {
        if (rfNode.type !== "classBox") return [];
        return [{ classId: rfNode.data.classId, x: rfNode.position.x, y: rfNode.position.y }];
      });
      callbacks.onDragComplete(finalPositions);
    },
    [callbacks]
  );

  // @job connect:event:normalize
  const onSelectionChange = useCallback<
    OnSelectionChangeFunc<ClassBoxNodeDescriptor, RelationshipEdgeDescriptor>
  >(
    ({ nodes }) => {
      const selectedIds = new Set(
        nodes.flatMap((n) => (n.type === "classBox" ? [n.data.classId] : []))
      );
      const orderedSelection = view.classes
        .map((c) => c.classId)
        .filter((id) => selectedIds.has(id));
      callbacks.onSelectionChange(orderedSelection);
    },
    [callbacks, view.classes]
  );

  // @job connect:event:wire
  const onPaneClick = useCallback(() => {
    callbacks.onPaneClick();
  }, [callbacks]);

  return { onNodesChange, onNodeDragStop, onSelectionChange, onPaneClick };
}
