/**
 * @framework React Flow canvas events to View class selection and placement callbacks.
 */

import { useCallback } from "react";
import type { MutableRefObject } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import type {
  Connection,
  NodeChange,
  OnConnectEnd,
  OnConnectStart,
  OnNodeDrag,
  XYPosition,
} from "@xyflow/react";
import type {
  ClassBoxNodeDescriptor,
  ClassBoxPlacementChange,
  RelationshipEdgeDescriptor,
} from "./frameworkAdapters";
import {
  toClassBoxPlacementChanges,
  toRelationshipConnection,
  toRelationshipReconnect,
} from "./frameworkAdapters";
import type { ClassId, RelationshipId } from "../../../../../../shared/ids";

type ReactFlowCanvasAdapterCallbacks = {
  readonly onClassBoxPlacementChange: (changes: readonly ClassBoxPlacementChange[]) => void;
  readonly onDragComplete: (finalPositions: readonly ClassBoxPlacementChange[]) => void;
  readonly onRelationshipConnect: (sourceClassId: ClassId, targetClassId: ClassId) => void;
  readonly onRelationshipReconnect: (
    relationshipId: RelationshipId,
    end: "source" | "target",
    newClassId: ClassId
  ) => void;
  readonly onBackgroundClick: () => void;
  readonly onConnectAborted: () => void;
};

type UseInteractionsInput = {
  readonly callbacks: ReactFlowCanvasAdapterCallbacks;
  readonly isRelationshipPlacementArmed: boolean;
  readonly pressPointRef: MutableRefObject<XYPosition | null>;
  readonly screenToFlowPosition: (position: XYPosition) => XYPosition;
};

type Interactions = {
  readonly onNodesChange: (changes: NodeChange<ClassBoxNodeDescriptor>[]) => void;
  readonly onNodeDragStop: OnNodeDrag<ClassBoxNodeDescriptor>;
  readonly onConnect: (connection: Connection) => void;
  readonly onConnectStart: OnConnectStart;
  readonly onConnectEnd: OnConnectEnd;
  readonly onReconnect: (oldEdge: RelationshipEdgeDescriptor, newConnection: Connection) => void;
  readonly onPaneClick: (event: ReactMouseEvent) => void;
};

export function useInteractions({
  callbacks,
  isRelationshipPlacementArmed,
  pressPointRef,
  screenToFlowPosition,
}: UseInteractionsInput): Interactions {
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
  const onConnectStart = useCallback<OnConnectStart>(
    (event) => {
      const screenPoint = toScreenPoint(event);
      pressPointRef.current = screenPoint ? screenToFlowPosition(screenPoint) : null;
    },
    [pressPointRef, screenToFlowPosition]
  );

  // Framework prop and event adaptation
  const onConnectEnd = useCallback<OnConnectEnd>(
    (_event, connectionState) => {
      pressPointRef.current = null;
      if (connectionState.isValid === true) return;
      if (!isRelationshipPlacementArmed) return;
      callbacks.onConnectAborted();
    },
    [callbacks, isRelationshipPlacementArmed, pressPointRef]
  );

  // Framework prop and event adaptation
  const onReconnect = useCallback(
    (oldEdge: RelationshipEdgeDescriptor, newConnection: Connection) => {
      const reconnect = toRelationshipReconnect(oldEdge, newConnection);
      if (!reconnect) return;
      callbacks.onRelationshipReconnect(
        reconnect.relationshipId,
        reconnect.end,
        reconnect.newClassId
      );
    },
    [callbacks]
  );

  // Framework prop and event adaptation
  const onPaneClick = useCallback(
    (event: ReactMouseEvent) => {
      if (event.target !== event.currentTarget) return;
      callbacks.onBackgroundClick();
    },
    [callbacks]
  );

  return {
    onNodesChange,
    onNodeDragStop,
    onConnect,
    onConnectStart,
    onConnectEnd,
    onReconnect,
    onPaneClick,
  };
}

// Private helpers
function toScreenPoint(event: MouseEvent | TouchEvent): XYPosition | null {
  if ("touches" in event) {
    const touch = event.touches[0] ?? event.changedTouches[0];
    return touch ? { x: touch.clientX, y: touch.clientY } : null;
  }
  return { x: event.clientX, y: event.clientY };
}
