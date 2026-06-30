/**
 * @framework React Flow canvas events to View class selection and placement callbacks.
 */

import { useCallback } from "react";
import type { NodeChange, OnNodeDrag, OnSelectionChangeFunc } from "@xyflow/react";
import type { ClassId } from "../../../../../shared/ids";
import type { DiagramView } from "../../../../views/schema";
import type { ClassBoxNodeDescriptor, RelationshipEdgeDescriptor } from "./frameworkAdapters";

type ClassBoxPlacementChange = {
  readonly classId: ClassId;
  readonly x: number;
  readonly y: number;
};

type ReactFlowCanvasAdapterCallbacks = {
  readonly onClassBoxPlacementChange: (changes: readonly ClassBoxPlacementChange[]) => void;
  readonly onDragComplete: (finalPositions: readonly ClassBoxPlacementChange[]) => void;
  readonly onSelectionChange: (classIds: readonly ClassId[]) => void;
  readonly onSelectionClear: () => void;
};

type Interactions = {
  readonly onNodesChange: (changes: NodeChange<ClassBoxNodeDescriptor>[]) => void;
  readonly onNodeDragStop: OnNodeDrag<ClassBoxNodeDescriptor>;
  readonly onSelectionChange: OnSelectionChangeFunc<
    ClassBoxNodeDescriptor,
    RelationshipEdgeDescriptor
  >;
  readonly onPaneClick: () => void;
};

export function useInteractions(
  view: Pick<DiagramView, "classes">,
  callbacks: ReactFlowCanvasAdapterCallbacks
): Interactions {
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
  const onSelectionChange = useCallback<
    OnSelectionChangeFunc<ClassBoxNodeDescriptor, RelationshipEdgeDescriptor>
  >(
    ({ nodes }) => {
      const selectedIds = new Set(
        nodes.flatMap((n) => (n.type === "classBox" ? [n.data.view.classId] : []))
      );
      const orderedSelection = view.classes
        .map((c) => c.classId)
        .filter((id) => selectedIds.has(id));
      callbacks.onSelectionChange(orderedSelection);
    },
    [callbacks, view.classes]
  );

  // Framework prop and event adaptation
  const onPaneClick = useCallback(() => {
    callbacks.onSelectionClear();
  }, [callbacks]);

  return { onNodesChange, onNodeDragStop, onSelectionChange, onPaneClick };
}
