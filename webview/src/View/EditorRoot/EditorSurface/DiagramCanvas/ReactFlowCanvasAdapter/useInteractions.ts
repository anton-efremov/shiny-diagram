/**
 * @framework React Flow canvas events to View class selection and placement callbacks.
 */

import { useCallback } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import type { Connection, NodeChange, OnConnectEnd, OnNodeDrag } from "@xyflow/react";
import type { ClassBoxNodeDescriptor, ClassBoxPlacementChange } from "./frameworkAdapters";
import { toClassBoxPlacementChanges, toRelationshipConnection } from "./frameworkAdapters";
import type { ClassId } from "../../../../../shared/ids";

type ReactFlowCanvasAdapterCallbacks = {
  readonly onClassBoxPlacementChange: (changes: readonly ClassBoxPlacementChange[]) => void;
  readonly onDragComplete: (finalPositions: readonly ClassBoxPlacementChange[]) => void;
  readonly onRelationshipConnect: (sourceClassId: ClassId, targetClassId: ClassId) => void;
  readonly onSelectionClear: () => void;
};

type Interactions = {
  readonly onNodesChange: (changes: NodeChange<ClassBoxNodeDescriptor>[]) => void;
  readonly onNodeDragStop: OnNodeDrag<ClassBoxNodeDescriptor>;
  readonly onConnect: (connection: Connection) => void;
  readonly onConnectEnd: OnConnectEnd;
  readonly onPaneClick: (event: ReactMouseEvent) => void;
};

export function useInteractions(callbacks: ReactFlowCanvasAdapterCallbacks): Interactions {
  // Framework prop and event adaptation
  const onNodesChange = useCallback(
    (changes: NodeChange<ClassBoxNodeDescriptor>[]) => {
      const placementChanges = toClassBoxPlacementChanges(changes);
      if (placementChanges.length > 0) {
        callbacks.onClassBoxPlacementChange(placementChanges);
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
  const onConnect = useCallback(
    (connection: Connection) => {
      const relationshipConnection = toRelationshipConnection(connection);
      if (!relationshipConnection) return;
      callbacks.onRelationshipConnect(
        relationshipConnection.sourceClassId,
        relationshipConnection.targetClassId
      );
    },
    [callbacks]
  );

  // Framework prop and event adaptation
  const onConnectEnd = useCallback<OnConnectEnd>(
    (_event, connectionState) => {
      if (connectionState.isValid === true) return;
      callbacks.onSelectionClear();
    },
    [callbacks]
  );

  // Framework prop and event adaptation
  const onPaneClick = useCallback(
    (event: ReactMouseEvent) => {
      if (event.target !== event.currentTarget) return;
      callbacks.onSelectionClear();
    },
    [callbacks]
  );

  return { onNodesChange, onNodeDragStop, onConnect, onConnectEnd, onPaneClick };
}
