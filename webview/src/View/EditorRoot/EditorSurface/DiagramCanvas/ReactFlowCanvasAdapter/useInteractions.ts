/**
 * @framework React Flow canvas events to View class selection and placement callbacks.
 */

import { useCallback } from "react";
import type { NodeChange, OnNodeDrag } from "@xyflow/react";
import type { ClassId } from "../../../../../shared/ids";
import type { ClassBoxNodeDescriptor } from "./frameworkAdapters";

type ClassBoxPlacementChange = {
  readonly classId: ClassId;
  readonly x: number;
  readonly y: number;
};

type ReactFlowCanvasAdapterCallbacks = {
  readonly onClassBoxPlacementChange: (changes: readonly ClassBoxPlacementChange[]) => void;
  readonly onDragComplete: (finalPositions: readonly ClassBoxPlacementChange[]) => void;
  readonly onSelectionClear: () => void;
};

type Interactions = {
  readonly onNodesChange: (changes: NodeChange<ClassBoxNodeDescriptor>[]) => void;
  readonly onNodeDragStop: OnNodeDrag<ClassBoxNodeDescriptor>;
  readonly onPaneClick: () => void;
};

export function useInteractions(callbacks: ReactFlowCanvasAdapterCallbacks): Interactions {
  // Framework prop and event adaptation
  const onNodesChange = useCallback(
    (changes: NodeChange<ClassBoxNodeDescriptor>[]) => {
      const positionChanges = changes.flatMap((change) => {
        if (change.type !== "position" || change.position === undefined) return [];
        return [{ classId: change.id as ClassId, x: change.position.x, y: change.position.y }];
      });
      if (positionChanges.length > 0) {
        callbacks.onClassBoxPlacementChange(positionChanges);
      }
    },
    [callbacks]
  );

  // Framework prop and event adaptation
  const onNodeDragStop = useCallback<OnNodeDrag<ClassBoxNodeDescriptor>>(
    (_event, _node, rfNodes) => {
      const finalPositions = rfNodes.flatMap((rfNode) => {
        if (rfNode.type !== "classBox") return [];
        return [{ classId: rfNode.data.view.classId, x: rfNode.position.x, y: rfNode.position.y }];
      });
      callbacks.onDragComplete(finalPositions);
    },
    [callbacks]
  );

  // Framework prop and event adaptation
  const onPaneClick = useCallback(() => {
    callbacks.onSelectionClear();
  }, [callbacks]);

  return { onNodesChange, onNodeDragStop, onPaneClick };
}
