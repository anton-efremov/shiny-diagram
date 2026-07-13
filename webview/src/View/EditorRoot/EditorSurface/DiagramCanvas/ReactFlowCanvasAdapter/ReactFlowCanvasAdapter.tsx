/**
 * @behavior Adapter-local namespace and note gesture snapshots.
 * @framework View diagram canvas props to React Flow canvas props and events.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactElement } from "react";
import {
  ConnectionMode,
  Controls,
  ReactFlow,
  type ConnectionLineComponent,
  useReactFlow,
  type XYPosition,
} from "@xyflow/react";
import type { Point, Rect } from "../../../../../shared/geometry";
import type { ClassId, NamespaceId, RelationshipId } from "../../../../../shared/ids";
import type { TransactionResult } from "../../../../commands/editorCommands";
import {
  NAMESPACE_GESTURE_Z_INDEX,
  RELATIONSHIP_RECONNECT_RADIUS,
} from "../../../../config/editorUiConfig";
import { reactFlowCanvasBoundaryProps } from "../../../../config/reactFlowConfig";
import type {
  ClassBoxPlacementState,
  EditingState,
  NamespaceGestureState,
  NodePlacementState,
  NoteAttachState,
  NoteBoxPlacementState,
  RelationshipSeed,
  SelectionState,
} from "../../../../state/editorStates";
import type { DiagramView } from "../../../../views/schema";
import NoteAttachmentEdgeAdapter from "./NoteAttachmentEdgeAdapter/NoteAttachmentEdgeAdapter";
import NoteAttachGhostLine from "./NoteAttachGhostLine/NoteAttachGhostLine";
import PlacementOverlay from "./PlacementOverlay/PlacementOverlay";
import ReactFlowClassBoxNodeAdapter from "./ReactFlowClassBoxAdapter/ReactFlowClassBoxAdapter";
import ReactFlowNamespaceAdapter from "./ReactFlowNamespaceAdapter/ReactFlowNamespaceAdapter";
import ReactFlowNoteAdapter from "./ReactFlowNoteAdapter/ReactFlowNoteAdapter";
import RelationshipConnectionLineAdapter from "./RelationshipConnectionLineAdapter/RelationshipConnectionLineAdapter";
import RelationshipEdgeAdapter from "./RelationshipEdgeAdapter/RelationshipEdgeAdapter";
import type {
  ClassBoxNodeDescriptor,
  ClassBoxPlacementChange,
  NamespaceDragState,
  NamespaceNodeDescriptor,
  NoteAttachmentEdgeDescriptor,
  NoteBoxNodeDescriptor,
  NoteBoxPlacementChange,
  RelationshipEdgeDescriptor,
} from "./frameworkAdapters";
import {
  toClassBoxNodeDescriptors,
  toNamespaceDragClassBoxPlacementState,
  toNamespaceGeometry,
  toNamespaceNodeDescriptors,
  toNoteAttachmentEdgeDescriptors,
  toNoteBoxNodeDescriptors,
  toRelationshipEdgeDescriptors,
} from "./frameworkAdapters";
import { useInteractions } from "./useInteractions";
import GridFrame from "../../../../../ui/canvas/templates/GridFrame/GridFrame";
import DraftRect from "../../../../../ui/canvas/primitives/DraftRect/DraftRect";
import type {
  ClassResizePointerState,
  NamespaceResizePointerState,
  NoteResizePointerState,
} from "./useInteractions";

const nodeTypes = {
  classBox: ReactFlowClassBoxNodeAdapter,
  noteBox: ReactFlowNoteAdapter,
  namespaceBox: ReactFlowNamespaceAdapter,
};
const edgeTypes = {
  relationship: RelationshipEdgeAdapter,
  noteAttachment: NoteAttachmentEdgeAdapter,
};

type ReactFlowCanvasAdapterProps = {
  readonly view: DiagramView;
  readonly selectionState: SelectionState;
  readonly editingState: EditingState;
  readonly nodePlacementState: NodePlacementState;
  readonly noteAttachState: NoteAttachState;
  readonly namespaceGestureState: NamespaceGestureState;
  readonly classBoxPlacementState: ClassBoxPlacementState;
  readonly noteBoxPlacementState: NoteBoxPlacementState;
  readonly onClassBoxPlacementChange: (changes: readonly ClassBoxPlacementChange[]) => void;
  readonly onNoteBoxPlacementChange: (changes: readonly NoteBoxPlacementChange[]) => void;
  readonly onDragComplete: (
    finalPositions: readonly ClassBoxPlacementChange[],
    finalNotePositions: readonly NoteBoxPlacementChange[]
  ) => void;
  readonly onClassSelect: (classId: ClassId, additive: boolean) => void;
  readonly onClassMoved: (classId: ClassId) => void;
  readonly onNoteSelect: (noteId: DiagramView["notes"][number]["noteId"]) => void;
  readonly onNoteMoved: (noteId: DiagramView["notes"][number]["noteId"]) => void;
  readonly onNoteAttachCancel: () => void;
  readonly onRelationshipConnect: (sourceClassId: ClassId, targetClassId: ClassId) => void;
  readonly onRelationshipReconnect: (
    relationshipId: RelationshipId,
    end: "source" | "target",
    newClassId: ClassId
  ) => void;
  readonly onRelationshipSelect: (relationshipId: RelationshipId) => void;
  readonly onBackgroundClick: () => void;
  readonly onConnectAborted: () => void;
  readonly onPlacementComplete: (result: TransactionResult | null) => void;
  readonly onNamespaceGestureCancel: () => void;
  readonly onNamespaceGestureChange: (rect: Rect) => void;
  readonly onNamespaceCreateCommitted: (result: TransactionResult | null) => void;
  readonly onNamespaceResizeStart: (namespaceId: NamespaceId, rect: Rect) => void;
  readonly onNamespaceResizeCommitted: (result: TransactionResult | null) => void;
  readonly onNamespaceSelect: (namespaceId: NamespaceId) => void;
  readonly onNamespaceRenameCommitted: (
    result: TransactionResult,
    previousNamespaceId: NamespaceId
  ) => void;
  readonly onTextBlockEditStart: (
    editingState: Exclude<EditingState, { readonly kind: "none" }>
  ) => void;
  readonly onTextBlockEditCancel: () => void;
};

export default function ReactFlowCanvasAdapter({
  view,
  selectionState,
  editingState,
  nodePlacementState,
  noteAttachState,
  namespaceGestureState,
  classBoxPlacementState,
  noteBoxPlacementState,
  onClassBoxPlacementChange,
  onNoteBoxPlacementChange,
  onDragComplete,
  onClassSelect,
  onClassMoved,
  onNoteSelect,
  onNoteMoved,
  onNoteAttachCancel,
  onRelationshipConnect,
  onRelationshipReconnect,
  onRelationshipSelect,
  onBackgroundClick,
  onConnectAborted,
  onPlacementComplete,
  onNamespaceGestureCancel,
  onNamespaceGestureChange,
  onNamespaceCreateCommitted,
  onNamespaceResizeStart,
  onNamespaceResizeCommitted,
  onNamespaceSelect,
  onNamespaceRenameCommitted,
  onTextBlockEditStart,
  onTextBlockEditCancel,
}: ReactFlowCanvasAdapterProps): ReactElement {
  // Framework prop and event adaptation
  const { flowToScreenPosition, screenToFlowPosition } = useReactFlow();

  // State creation: adapter-local state - transient React Flow gesture snapshots
  const [noteAttachCursor, setNoteAttachCursor] = useState<Point | null>(null);
  const [namespaceDragState, setNamespaceDragState] = useState<NamespaceDragState | null>(null);
  const [namespaceDragBoundsState, setNamespaceDragBoundsState] = useState<ReadonlyMap<
    NamespaceId,
    Rect
  > | null>(null);
  const [isSurfaceResizeActive, setSurfaceResizeActive] = useState(false);
  const placementStartPointRef = useRef<XYPosition | null>(null);
  const namespaceDragStartPointRef = useRef<XYPosition | null>(null);
  const namespaceDropBoundsRef = useRef<ReadonlyMap<NamespaceId, Rect> | null>(null);
  const namespaceStartPointRef = useRef<XYPosition | null>(null);
  const namespaceResizePointerStateRef = useRef<NamespaceResizePointerState | null>(null);
  const classResizePointerStateRef = useRef<ClassResizePointerState | null>(null);
  const noteResizePointerStateRef = useRef<NoteResizePointerState | null>(null);
  const reconnectSeedRef = useRef<RelationshipSeed | null>(null);
  const isPlacementActive = nodePlacementState !== null;
  const isNamespaceGestureActive = namespaceGestureState.kind !== "none";
  const relationshipPlacementState =
    nodePlacementState?.kind === "relationship" ? nodePlacementState : null;
  const isRelationshipPlacementActive = relationshipPlacementState !== null;
  const noteAttachSource = toNoteAttachSourcePoint(
    noteAttachState,
    noteBoxPlacementState,
    noteAttachCursor,
    flowToScreenPosition
  );
  const namespaceDraftStyle = toNamespaceDraftStyle(namespaceGestureState, flowToScreenPosition);
  const effectiveClassBoxPlacementState = useMemo(
    () => toNamespaceDragClassBoxPlacementState(view, classBoxPlacementState, namespaceDragState),
    [view, classBoxPlacementState, namespaceDragState]
  );
  const namespaceGeometry = useMemo(
    () => toNamespaceGeometry(view, effectiveClassBoxPlacementState, namespaceGestureState),
    [view, effectiveClassBoxPlacementState, namespaceGestureState]
  );
  const renderedNamespaceGeometry = useMemo(
    () =>
      namespaceDragBoundsState
        ? { ...namespaceGeometry, boundsByNamespaceId: namespaceDragBoundsState }
        : namespaceGeometry,
    [namespaceGeometry, namespaceDragBoundsState]
  );

  const callbacks = useMemo(
    () => ({
      onClassBoxPlacementChange,
      onNoteBoxPlacementChange,
      onDragComplete,
      onClassMoved,
      onNoteMoved,
      onRelationshipConnect,
      onRelationshipReconnect,
      onBackgroundClick,
      onConnectAborted,
      onNoteAttachCancel,
      onNamespaceGestureCancel,
      onNamespaceGestureChange,
      onNamespaceCreateCommitted,
      onNamespaceResizeStart,
      onNamespaceResizeCommitted,
      onNamespaceSelect,
    }),
    [
      onClassBoxPlacementChange,
      onNoteBoxPlacementChange,
      onDragComplete,
      onClassMoved,
      onNoteMoved,
      onRelationshipConnect,
      onRelationshipReconnect,
      onBackgroundClick,
      onConnectAborted,
      onNoteAttachCancel,
      onNamespaceGestureCancel,
      onNamespaceGestureChange,
      onNamespaceCreateCommitted,
      onNamespaceResizeStart,
      onNamespaceResizeCommitted,
      onNamespaceSelect,
    ]
  );

  // Event handler props derivation
  const {
    onNodesChange,
    onNoteResizeEnd,
    onNodeDragStop,
    onNodeDrag,
    onNodeDragStart,
    onCanvasGestureCancel,
    onClassResizeHandlePress,
    onNoteResizeHandlePress,
    onNamespaceResizeHandlePress,
    onConnect,
    onConnectStart,
    onConnectEnd,
    onReconnect,
    onReconnectStart,
    onCanvasMouseMove,
    onCanvasPointerDown,
    onCanvasPointerMove,
    onCanvasPointerUp,
    onPaneClick,
  } = useInteractions({
    callbacks,
    isRelationshipPlacementArmed: isRelationshipPlacementActive,
    noteAttachState,
    setNoteAttachCursor,
    setSurfaceResizeActive,
    placementStartPointRef,
    namespaceStartPointRef,
    namespaceDragStartPointRef,
    namespaceDropBoundsRef,
    namespaceResizePointerStateRef,
    classResizePointerStateRef,
    noteResizePointerStateRef,
    reconnectSeedRef,
    screenToFlowPosition,
    namespaceGestureState,
    namespaceGeometry: renderedNamespaceGeometry,
    setNamespaceDragState,
    setNamespaceDragBoundsState,
    view,
    classBoxPlacementState,
  });

  // Keystroke listener registration
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key !== "Escape") return;
      if (
        !namespaceDragState &&
        namespaceGestureState.kind === "none" &&
        !isSurfaceResizeActive &&
        !namespaceResizePointerStateRef.current &&
        !classResizePointerStateRef.current &&
        !noteResizePointerStateRef.current
      ) {
        return;
      }
      event.preventDefault();
      onCanvasGestureCancel();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isSurfaceResizeActive,
    namespaceDragState,
    namespaceGestureState.kind,
    onCanvasGestureCancel,
  ]);

  const rfNodes = useMemo(() => {
    const selectedClassIds = selectionState.kind === "classes" ? selectionState.classIds : [];
    const namespaceNodes = toNamespaceNodeDescriptors(
      view.namespaces,
      renderedNamespaceGeometry,
      selectionState,
      onNamespaceSelect,
      onNamespaceResizeHandlePress,
      editingState,
      onTextBlockEditStart,
      onTextBlockEditCancel,
      onNamespaceRenameCommitted
    );
    const classNodes = toClassBoxNodeDescriptors(
      view.classes,
      view.baseStyle,
      selectedClassIds,
      effectiveClassBoxPlacementState,
      renderedNamespaceGeometry,
      isRelationshipPlacementActive,
      onClassSelect,
      onClassResizeHandlePress,
      editingState,
      onTextBlockEditStart,
      onTextBlockEditCancel
    );
    const noteNodes = toNoteBoxNodeDescriptors(
      view.notes,
      selectionState,
      editingState,
      noteBoxPlacementState,
      onNoteSelect,
      onNoteResizeEnd,
      onNoteResizeHandlePress,
      onTextBlockEditStart,
      onTextBlockEditCancel
    );
    return [...namespaceNodes, ...classNodes, ...noteNodes];
  }, [
    view,
    selectionState,
    effectiveClassBoxPlacementState,
    renderedNamespaceGeometry,
    noteBoxPlacementState,
    isRelationshipPlacementActive,
    onClassSelect,
    onNoteSelect,
    onNoteResizeEnd,
    onNoteResizeHandlePress,
    onClassResizeHandlePress,
    onNamespaceSelect,
    onNamespaceRenameCommitted,
    onNamespaceResizeHandlePress,
    editingState,
    onTextBlockEditStart,
    onTextBlockEditCancel,
  ]);
  const rfEdges = useMemo<Array<RelationshipEdgeDescriptor | NoteAttachmentEdgeDescriptor>>(
    () => [
      ...toRelationshipEdgeDescriptors(
        view.classes,
        view.relationships,
        selectionState,
        effectiveClassBoxPlacementState,
        isRelationshipPlacementActive,
        onRelationshipSelect
      ),
      ...toNoteAttachmentEdgeDescriptors(
        view.notes,
        view.classes,
        effectiveClassBoxPlacementState,
        noteBoxPlacementState,
        noteAttachState
      ),
    ],
    [
      view.classes,
      view.relationships,
      view.notes,
      selectionState,
      effectiveClassBoxPlacementState,
      noteBoxPlacementState,
      noteAttachState,
      isRelationshipPlacementActive,
      onRelationshipSelect,
    ]
  );
  const renderedNodes = useMemo(
    () =>
      isRelationshipPlacementActive
        ? rfNodes.map((node) => ({ ...node, style: { ...node.style, cursor: "inherit" } }))
        : rfNodes,
    [isRelationshipPlacementActive, rfNodes]
  );

  // Rendered for both placement and reconnect drags; reconnect drags carry no
  // placement seed and fall back to the neutral ghost styling.
  const connectionLineComponent = useMemo<
    ConnectionLineComponent<
      ClassBoxNodeDescriptor | NamespaceNodeDescriptor | NoteBoxNodeDescriptor
    >
  >(() => {
    const placementSeed = relationshipPlacementState?.seed ?? null;
    return function ArmedRelationshipConnectionLine(props): ReactElement {
      return (
        <RelationshipConnectionLineAdapter
          {...props}
          placementSeed={placementSeed}
          placementStartPointRef={placementStartPointRef}
          reconnectSeedRef={reconnectSeedRef}
        />
      );
    };
  }, [relationshipPlacementState]);

  return (
    <GridFrame variant="canvas" placementActive={isRelationshipPlacementActive}>
      <ReactFlow<
        ClassBoxNodeDescriptor | NamespaceNodeDescriptor | NoteBoxNodeDescriptor,
        RelationshipEdgeDescriptor | NoteAttachmentEdgeDescriptor
      >
        // Editable React Flow canvas boundary.
        nodes={renderedNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onNodeDrag={onNodeDrag}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onReconnect={onReconnect}
        onReconnectStart={onReconnectStart}
        onMouseMove={onCanvasMouseMove}
        onPointerDown={onCanvasPointerDown}
        onPointerMove={onCanvasPointerMove}
        onPointerUp={onCanvasPointerUp}
        onPaneClick={onPaneClick}
        connectionMode={ConnectionMode.Loose}
        reconnectRadius={RELATIONSHIP_RECONNECT_RADIUS}
        connectionLineComponent={connectionLineComponent}
        fitView
        nodesDraggable={!isPlacementActive && !isNamespaceGestureActive && !isSurfaceResizeActive}
        panOnDrag={!isPlacementActive && !isNamespaceGestureActive && !isSurfaceResizeActive}
        zoomOnScroll
        // Keep last. This enforces Shiny's React Flow boundary policy.
        {...reactFlowCanvasBoundaryProps}
      >
        <Controls showInteractive={false} />
        <PlacementOverlay
          nodePlacementState={nodePlacementState}
          onPlacementComplete={onPlacementComplete}
        />
      </ReactFlow>
      {noteAttachSource && noteAttachCursor ? (
        <NoteAttachGhostLine sourcePoint={noteAttachSource} targetPoint={noteAttachCursor} />
      ) : null}
      {namespaceDraftStyle ? (
        <DraftRect
          rect={namespaceDraftStyle}
          tone="positive"
          positioning="fixed"
          stacking={NAMESPACE_GESTURE_Z_INDEX}
        />
      ) : null}
    </GridFrame>
  );
}

// Private helpers
function toNamespaceDraftStyle(
  namespaceGestureState: NamespaceGestureState,
  flowToScreenPosition: (position: XYPosition) => XYPosition
): Rect | null {
  if (namespaceGestureState.kind !== "creating") return null;
  if (namespaceGestureState.rect.w === 0 && namespaceGestureState.rect.h === 0) return null;
  const topLeft = flowToScreenPosition({
    x: namespaceGestureState.rect.x,
    y: namespaceGestureState.rect.y,
  });
  const bottomRight = flowToScreenPosition({
    x: namespaceGestureState.rect.x + namespaceGestureState.rect.w,
    y: namespaceGestureState.rect.y + namespaceGestureState.rect.h,
  });
  return {
    x: Math.min(topLeft.x, bottomRight.x),
    y: Math.min(topLeft.y, bottomRight.y),
    w: Math.abs(bottomRight.x - topLeft.x),
    h: Math.abs(bottomRight.y - topLeft.y),
  };
}

function toNoteAttachSourcePoint(
  noteAttachState: NoteAttachState,
  noteBoxPlacementState: NoteBoxPlacementState,
  targetPoint: Point | null,
  flowToScreenPosition: (position: XYPosition) => XYPosition
): Point | null {
  if (noteAttachState.kind !== "attaching") return null;
  if (!targetPoint) return null;
  const rect = noteBoxPlacementState.rectByNoteId.get(noteAttachState.noteId);
  if (!rect) return null;
  const topLeft = flowToScreenPosition({ x: rect.x, y: rect.y });
  const bottomRight = flowToScreenPosition({ x: rect.x + rect.w, y: rect.y + rect.h });
  return toRectEdgePoint(
    {
      x: Math.min(topLeft.x, bottomRight.x),
      y: Math.min(topLeft.y, bottomRight.y),
      w: Math.abs(bottomRight.x - topLeft.x),
      h: Math.abs(bottomRight.y - topLeft.y),
    },
    targetPoint
  );
}

type ScreenRect = {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
};

function toRectEdgePoint(rect: ScreenRect, targetPoint: Point): Point {
  const center = { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 };
  const dx = targetPoint.x - center.x;
  const dy = targetPoint.y - center.y;

  if (dx === 0 && dy === 0) {
    return { x: rect.x + rect.w, y: center.y };
  }

  const xScale = dx === 0 ? Number.POSITIVE_INFINITY : rect.w / 2 / Math.abs(dx);
  const yScale = dy === 0 ? Number.POSITIVE_INFINITY : rect.h / 2 / Math.abs(dy);
  const edgeScale = Math.min(xScale, yScale);
  return {
    x: center.x + dx * edgeScale,
    y: center.y + dy * edgeScale,
  };
}
