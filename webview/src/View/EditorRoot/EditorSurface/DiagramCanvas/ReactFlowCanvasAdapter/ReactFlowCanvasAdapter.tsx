/**
 * @framework View diagram canvas props to React Flow canvas props and events.
 */

import { useMemo, useRef, useState } from "react";
import type { ReactElement } from "react";
import {
  Background,
  ConnectionMode,
  Controls,
  ReactFlow,
  type ConnectionLineComponent,
  useReactFlow,
  type XYPosition,
} from "@xyflow/react";
import type { Point } from "../../../../../shared/geometry";
import type { ClassId, RelationshipId } from "../../../../../shared/ids";
import type { TransactionResult } from "../../../../commands/editorCommands";
import { RELATIONSHIP_RECONNECT_RADIUS } from "../../../../config/editorUiConfig";
import { reactFlowCanvasBoundaryProps } from "../../../../config/reactFlowConfig";
import type {
  ClassBoxPlacementState,
  EditingState,
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
import ReactFlowNoteAdapter from "./ReactFlowNoteAdapter/ReactFlowNoteAdapter";
import RelationshipConnectionLineAdapter from "./RelationshipConnectionLineAdapter/RelationshipConnectionLineAdapter";
import RelationshipEdgeAdapter from "./RelationshipEdgeAdapter/RelationshipEdgeAdapter";
import type {
  ClassBoxNodeDescriptor,
  ClassBoxPlacementChange,
  NoteAttachmentEdgeDescriptor,
  NoteBoxNodeDescriptor,
  NoteBoxPlacementChange,
  RelationshipEdgeDescriptor,
} from "./frameworkAdapters";
import {
  toClassBoxNodeDescriptors,
  toNoteAttachmentEdgeDescriptors,
  toNoteBoxNodeDescriptors,
  toRelationshipEdgeDescriptors,
} from "./frameworkAdapters";
import { useInteractions } from "./useInteractions";
import styles from "./ReactFlowCanvasAdapter.module.css";

const nodeTypes = { classBox: ReactFlowClassBoxNodeAdapter, noteBox: ReactFlowNoteAdapter };
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
  onTextBlockEditStart,
  onTextBlockEditCancel,
}: ReactFlowCanvasAdapterProps): ReactElement {
  // Framework prop and event adaptation
  const { flowToScreenPosition, screenToFlowPosition } = useReactFlow();
  const [noteAttachCursor, setNoteAttachCursor] = useState<Point | null>(null);
  const placementStartPointRef = useRef<XYPosition | null>(null);
  const reconnectSeedRef = useRef<RelationshipSeed | null>(null);
  const isPlacementActive = nodePlacementState !== null;
  const relationshipPlacementState =
    nodePlacementState?.kind === "relationship" ? nodePlacementState : null;
  const isRelationshipPlacementActive = relationshipPlacementState !== null;
  const noteAttachSource = toNoteAttachSourcePoint(
    noteAttachState,
    noteBoxPlacementState,
    flowToScreenPosition
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
    ]
  );

  // Event handler props derivation
  const {
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
  } = useInteractions({
    callbacks,
    isRelationshipPlacementArmed: isRelationshipPlacementActive,
    noteAttachState,
    setNoteAttachCursor,
    placementStartPointRef,
    reconnectSeedRef,
    screenToFlowPosition,
  });

  const rfNodes = useMemo(() => {
    const selectedClassIds = selectionState.kind === "classes" ? selectionState.classIds : [];
    const classNodes = toClassBoxNodeDescriptors(
      view.classes,
      selectedClassIds,
      classBoxPlacementState,
      isRelationshipPlacementActive,
      onClassSelect,
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
      onTextBlockEditStart,
      onTextBlockEditCancel
    );
    return [...classNodes, ...noteNodes];
  }, [
    view.classes,
    view.notes,
    selectionState,
    classBoxPlacementState,
    noteBoxPlacementState,
    isRelationshipPlacementActive,
    onClassSelect,
    onNoteSelect,
    onNoteResizeEnd,
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
        classBoxPlacementState,
        isRelationshipPlacementActive,
        onRelationshipSelect
      ),
      ...toNoteAttachmentEdgeDescriptors(
        view.notes,
        view.classes,
        classBoxPlacementState,
        noteBoxPlacementState,
        noteAttachState
      ),
    ],
    [
      view.classes,
      view.relationships,
      view.notes,
      selectionState,
      classBoxPlacementState,
      noteBoxPlacementState,
      noteAttachState,
      isRelationshipPlacementActive,
      onRelationshipSelect,
    ]
  );

  // Rendered for both placement and reconnect drags; reconnect drags carry no
  // placement seed and fall back to the neutral ghost styling.
  const connectionLineComponent = useMemo<
    ConnectionLineComponent<ClassBoxNodeDescriptor | NoteBoxNodeDescriptor>
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
    <ReactFlow<
      ClassBoxNodeDescriptor | NoteBoxNodeDescriptor,
      RelationshipEdgeDescriptor | NoteAttachmentEdgeDescriptor
    >
      // Editable React Flow canvas boundary.
      nodes={rfNodes}
      edges={rfEdges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onNodeDragStop={onNodeDragStop}
      onConnect={onConnect}
      onConnectStart={onConnectStart}
      onConnectEnd={onConnectEnd}
      onReconnect={onReconnect}
      onReconnectStart={onReconnectStart}
      onMouseMove={onCanvasMouseMove}
      onPaneClick={onPaneClick}
      connectionMode={ConnectionMode.Loose}
      reconnectRadius={RELATIONSHIP_RECONNECT_RADIUS}
      connectionLineComponent={connectionLineComponent}
      className={isRelationshipPlacementActive ? styles.relationshipPlacement : undefined}
      fitView
      nodesDraggable={!isPlacementActive}
      panOnDrag={!isPlacementActive}
      zoomOnScroll
      // Keep last. This enforces Shiny's React Flow boundary policy.
      {...reactFlowCanvasBoundaryProps}
    >
      {noteAttachSource && noteAttachCursor ? (
        <NoteAttachGhostLine sourcePoint={noteAttachSource} targetPoint={noteAttachCursor} />
      ) : null}
      <Background />
      <Controls showInteractive={false} />
      <PlacementOverlay
        nodePlacementState={nodePlacementState}
        onPlacementComplete={onPlacementComplete}
      />
    </ReactFlow>
  );
}

function toNoteAttachSourcePoint(
  noteAttachState: NoteAttachState,
  noteBoxPlacementState: NoteBoxPlacementState,
  flowToScreenPosition: (position: XYPosition) => XYPosition
): Point | null {
  if (noteAttachState.kind !== "attaching") return null;
  const rect = noteBoxPlacementState.rectByNoteId.get(noteAttachState.noteId);
  if (!rect) return null;
  return flowToScreenPosition({ x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 });
}
