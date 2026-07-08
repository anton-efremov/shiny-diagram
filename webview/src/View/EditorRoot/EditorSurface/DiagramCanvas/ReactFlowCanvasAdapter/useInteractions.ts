/**
 * @framework React Flow canvas events to View class selection and placement callbacks.
 */

import { useCallback, useEffect } from "react";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import type {
  Connection,
  NodeChange,
  OnConnectEnd,
  OnConnectStart,
  OnNodeDrag,
  XYPosition,
} from "@xyflow/react";
import type { NoteAttachState, RelationshipSeed } from "../../../../state/editorStates";
import type { RelationshipView } from "../../../../views/schema";
import type {
  ClassBoxNodeDescriptor,
  ClassBoxPlacementChange,
  NoteBoxNodeDescriptor,
  NoteBoxPlacementChange,
  NoteAttachmentEdgeDescriptor,
  RelationshipEdgeDescriptor,
} from "./frameworkAdapters";
import {
  toClassBoxPlacementChanges,
  toNoteBoxPlacementChanges,
  toRelationshipConnection,
  toRelationshipReconnect,
} from "./frameworkAdapters";
import type { ClassId, NoteId, RelationshipId } from "../../../../../shared/ids";
import type { Point } from "../../../../../shared/geometry";

type ReactFlowCanvasAdapterCallbacks = {
  readonly onClassBoxPlacementChange: (changes: readonly ClassBoxPlacementChange[]) => void;
  readonly onNoteBoxPlacementChange: (changes: readonly NoteBoxPlacementChange[]) => void;
  readonly onDragComplete: (
    finalPositions: readonly ClassBoxPlacementChange[],
    finalNotePositions: readonly NoteBoxPlacementChange[]
  ) => void;
  readonly onClassMoved: (classId: ClassId) => void;
  readonly onNoteMoved: (noteId: NoteId) => void;
  readonly onRelationshipConnect: (sourceClassId: ClassId, targetClassId: ClassId) => void;
  readonly onRelationshipReconnect: (
    relationshipId: RelationshipId,
    end: "source" | "target",
    newClassId: ClassId
  ) => void;
  readonly onBackgroundClick: () => void;
  readonly onConnectAborted: () => void;
  readonly onNoteAttachCancel: () => void;
};

type UseInteractionsInput = {
  readonly callbacks: ReactFlowCanvasAdapterCallbacks;
  readonly isRelationshipPlacementArmed: boolean;
  readonly noteAttachState: NoteAttachState;
  readonly setNoteAttachCursor: Dispatch<SetStateAction<Point | null>>;
  readonly placementStartPointRef: MutableRefObject<XYPosition | null>;
  readonly reconnectSeedRef: MutableRefObject<RelationshipSeed | null>;
  readonly screenToFlowPosition: (position: XYPosition) => XYPosition;
};

type Interactions = {
  readonly onNodesChange: (
    changes: NodeChange<ClassBoxNodeDescriptor | NoteBoxNodeDescriptor>[]
  ) => void;
  readonly onNoteResizeEnd: (change: NoteBoxPlacementChange) => void;
  readonly onNodeDragStop: OnNodeDrag<ClassBoxNodeDescriptor | NoteBoxNodeDescriptor>;
  readonly onConnect: (connection: Connection) => void;
  readonly onConnectStart: OnConnectStart;
  readonly onConnectEnd: OnConnectEnd;
  readonly onReconnect: (
    oldEdge: RelationshipEdgeDescriptor | NoteAttachmentEdgeDescriptor,
    newConnection: Connection
  ) => void;
  readonly onReconnectStart: OnReconnectStart;
  readonly onCanvasMouseMove: (event: ReactMouseEvent) => void;
  readonly onPaneClick: (event: ReactMouseEvent) => void;
};

type OnReconnectStart = (
  event: ReactMouseEvent,
  edge: RelationshipEdgeDescriptor | NoteAttachmentEdgeDescriptor,
  handleType: "source" | "target"
) => void;

export function useInteractions({
  callbacks,
  isRelationshipPlacementArmed,
  noteAttachState,
  setNoteAttachCursor,
  placementStartPointRef,
  reconnectSeedRef,
  screenToFlowPosition,
}: UseInteractionsInput): Interactions {
  // Framework prop and event adaptation
  useEffect(() => {
    function updatePointerPosition(event: PointerEvent): void {
      setNoteAttachCursor({ x: event.clientX, y: event.clientY });
    }

    window.addEventListener("pointerdown", updatePointerPosition);
    window.addEventListener("pointermove", updatePointerPosition);
    return () => {
      window.removeEventListener("pointerdown", updatePointerPosition);
      window.removeEventListener("pointermove", updatePointerPosition);
    };
  }, [setNoteAttachCursor]);

  // Framework prop and event adaptation
  const onNodesChange = useCallback(
    (changes: NodeChange<ClassBoxNodeDescriptor | NoteBoxNodeDescriptor>[]) => {
      const placementChanges = toClassBoxPlacementChanges(changes);
      if (placementChanges.length > 0) {
        callbacks.onClassBoxPlacementChange(placementChanges);
      }
      const notePlacementChanges = toNoteBoxPlacementChanges(changes);
      if (notePlacementChanges.length > 0) {
        callbacks.onNoteBoxPlacementChange(notePlacementChanges);
      }
    },
    [callbacks]
  );

  // Framework prop and event adaptation
  const onNoteResizeEnd = useCallback(
    (change: NoteBoxPlacementChange) => {
      callbacks.onDragComplete([], [change]);
      callbacks.onNoteMoved(change.noteId);
    },
    [callbacks]
  );

  // Framework prop and event adaptation
  const onNodeDragStop = useCallback<OnNodeDrag<ClassBoxNodeDescriptor | NoteBoxNodeDescriptor>>(
    (_event, node, rfNodes) => {
      const finalPositions = rfNodes.flatMap((rfNode) => {
        if (rfNode.type !== "classBox") return [];
        return [{ classId: rfNode.data.view.classId, x: rfNode.position.x, y: rfNode.position.y }];
      });
      const finalNotePositions = rfNodes.flatMap((rfNode) => {
        if (rfNode.type !== "noteBox") return [];
        return [
          {
            noteId: rfNode.data.view.noteId,
            x: rfNode.position.x,
            y: rfNode.position.y,
            w: rfNode.width,
            h: rfNode.height,
          },
        ];
      });
      callbacks.onDragComplete(finalPositions, finalNotePositions);
      if (node.type === "classBox") {
        callbacks.onClassMoved(node.data.view.classId);
      }
      if (node.type === "noteBox") {
        callbacks.onNoteMoved(node.data.view.noteId);
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
    (
      oldEdge: RelationshipEdgeDescriptor | NoteAttachmentEdgeDescriptor,
      newConnection: Connection
    ) => {
      if (oldEdge.type !== "relationship") return;
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
      if (edge.type !== "relationship") {
        reconnectSeedRef.current = null;
        return;
      }
      const relationshipView = edge.data?.view;
      reconnectSeedRef.current = relationshipView
        ? toReconnectRelationshipSeed(relationshipView, handleType)
        : null;
    },
    [reconnectSeedRef]
  );

  // Framework prop and event adaptation
  const onCanvasMouseMove = useCallback(
    (event: ReactMouseEvent) => {
      if (noteAttachState.kind !== "attaching") return;
      setNoteAttachCursor({ x: event.clientX, y: event.clientY });
    },
    [noteAttachState.kind, setNoteAttachCursor]
  );

  // Framework prop and event adaptation
  const onPaneClick = useCallback(
    (event: ReactMouseEvent) => {
      if (event.target !== event.currentTarget) return;
      if (noteAttachState.kind === "attaching") {
        callbacks.onNoteAttachCancel();
        return;
      }
      callbacks.onBackgroundClick();
    },
    [callbacks, noteAttachState.kind]
  );

  return {
    onNodesChange,
    onNoteResizeEnd,
    onNodeDragStop,
    onConnect,
    onConnectStart,
    onConnectEnd,
    onReconnect,
    onReconnectStart,
    onCanvasMouseMove,
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
