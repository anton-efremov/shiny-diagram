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
import type { RelationshipSeed } from "../../../../state/editorStates";
import type { RelationshipView } from "../../../../views/schema";
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
import type { ClassId, RelationshipId } from "../../../../../shared/ids";

type ReactFlowCanvasAdapterCallbacks = {
  readonly onClassBoxPlacementChange: (changes: readonly ClassBoxPlacementChange[]) => void;
  readonly onDragComplete: (finalPositions: readonly ClassBoxPlacementChange[]) => void;
  readonly onClassMoved: (classId: ClassId) => void;
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
  readonly placementStartPointRef: MutableRefObject<XYPosition | null>;
  readonly reconnectSeedRef: MutableRefObject<RelationshipSeed | null>;
  readonly screenToFlowPosition: (position: XYPosition) => XYPosition;
};

type Interactions = {
  readonly onNodesChange: (changes: NodeChange<ClassBoxNodeDescriptor>[]) => void;
  readonly onNodeDragStop: OnNodeDrag<ClassBoxNodeDescriptor>;
  readonly onConnect: (connection: Connection) => void;
  readonly onConnectStart: OnConnectStart;
  readonly onConnectEnd: OnConnectEnd;
  readonly onReconnect: (oldEdge: RelationshipEdgeDescriptor, newConnection: Connection) => void;
  readonly onReconnectStart: OnReconnectStart;
  readonly onPaneClick: (event: ReactMouseEvent) => void;
};

type OnReconnectStart = (
  event: ReactMouseEvent,
  edge: RelationshipEdgeDescriptor,
  handleType: "source" | "target"
) => void;

export function useInteractions({
  callbacks,
  isRelationshipPlacementArmed,
  placementStartPointRef,
  reconnectSeedRef,
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
    (_event, node, rfNodes) => {
      const finalPositions = rfNodes.flatMap((rfNode) => {
        if (rfNode.type !== "classBox") return [];
        return [{ classId: rfNode.data.view.classId, x: rfNode.position.x, y: rfNode.position.y }];
      });
      callbacks.onDragComplete(finalPositions);
      if (node.type === "classBox") {
        callbacks.onClassMoved(node.data.view.classId);
      }
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
      if (!isRelationshipPlacementArmed) return;

      const screenPoint = toScreenPoint(event);
      placementStartPointRef.current = screenPoint ? screenToFlowPosition(screenPoint) : null;
    },
    [isRelationshipPlacementArmed, placementStartPointRef, screenToFlowPosition]
  );

  // Framework prop and event adaptation
  const onConnectEnd = useCallback<OnConnectEnd>(
    (_event, connectionState) => {
      placementStartPointRef.current = null;
      reconnectSeedRef.current = null;
      if (connectionState.isValid === true) return;
      if (!isRelationshipPlacementArmed) return;
      callbacks.onConnectAborted();
    },
    [callbacks, isRelationshipPlacementArmed, placementStartPointRef, reconnectSeedRef]
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
  const onReconnectStart = useCallback<OnReconnectStart>(
    (_event, edge, handleType) => {
      const relationshipView = edge.data?.view;
      reconnectSeedRef.current = relationshipView
        ? toReconnectRelationshipSeed(relationshipView, handleType)
        : null;
    },
    [reconnectSeedRef]
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
    onReconnectStart,
    onPaneClick,
  };
}

// Private helpers
function toReconnectRelationshipSeed(
  relationshipView: RelationshipView,
  stationaryHandleType: "source" | "target"
): RelationshipSeed {
  const seed = toRelationshipSeed(relationshipView);
  return stationaryHandleType === "source" ? seed : toReversedRelationshipSeed(seed);
}

function toRelationshipSeed(relationshipView: RelationshipView): RelationshipSeed {
  return {
    sourceEndpointKind: relationshipView.sourceEndpointKind,
    targetEndpointKind: relationshipView.targetEndpointKind,
    lineKind: relationshipView.lineKind,
    sourceMultiplicity: relationshipView.sourceMultiplicity ?? null,
    targetMultiplicity: relationshipView.targetMultiplicity ?? null,
    label: relationshipView.label ?? null,
  };
}

function toReversedRelationshipSeed(seed: RelationshipSeed): RelationshipSeed {
  return {
    sourceEndpointKind: seed.targetEndpointKind,
    targetEndpointKind: seed.sourceEndpointKind,
    lineKind: seed.lineKind,
    sourceMultiplicity: seed.targetMultiplicity,
    targetMultiplicity: seed.sourceMultiplicity,
    label: seed.label,
  };
}

function toScreenPoint(event: MouseEvent | TouchEvent): XYPosition | null {
  if ("touches" in event) {
    const touch = event.touches[0] ?? event.changedTouches[0];
    return touch ? { x: touch.clientX, y: touch.clientY } : null;
  }
  return { x: event.clientX, y: event.clientY };
}
