/**
 * @framework View diagram canvas props to React Flow canvas props and events.
 */

import { useMemo, useRef } from "react";
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
import type { ClassId, RelationshipId } from "../../../../../shared/ids";
import { RELATIONSHIP_RECONNECT_RADIUS } from "../../../../config/editorUiConfig";
import { reactFlowCanvasBoundaryProps } from "../../../../config/reactFlowConfig";
import type {
  ClassBoxPlacementState,
  EditingState,
  NodePlacementState,
  RelationshipSeed,
  SelectionState,
} from "../../../../state/editorStates";
import type { DiagramView } from "../../../../views/schema";
import PlacementOverlay from "./PlacementOverlay/PlacementOverlay";
import ReactFlowClassBoxNodeAdapter from "./ReactFlowClassBoxAdapter/ReactFlowClassBoxAdapter";
import RelationshipConnectionLineAdapter from "./RelationshipConnectionLineAdapter/RelationshipConnectionLineAdapter";
import RelationshipEdgeAdapter from "./RelationshipEdgeAdapter/RelationshipEdgeAdapter";
import type { ClassBoxNodeDescriptor, ClassBoxPlacementChange } from "./frameworkAdapters";
import { toClassBoxNodeDescriptors, toRelationshipEdgeDescriptors } from "./frameworkAdapters";
import { useInteractions } from "./useInteractions";
import styles from "./ReactFlowCanvasAdapter.module.css";

const nodeTypes = { classBox: ReactFlowClassBoxNodeAdapter };
const edgeTypes = { relationship: RelationshipEdgeAdapter };

type ReactFlowCanvasAdapterProps = {
  readonly view: DiagramView;
  readonly selectionState: SelectionState;
  readonly editingState: EditingState;
  readonly nodePlacementState: NodePlacementState;
  readonly classBoxPlacementState: ClassBoxPlacementState;
  readonly onClassBoxPlacementChange: (changes: readonly ClassBoxPlacementChange[]) => void;
  readonly onDragComplete: (finalPositions: readonly ClassBoxPlacementChange[]) => void;
  readonly onClassSelect: (classId: ClassId, additive: boolean) => void;
  readonly onClassMoved: (classId: ClassId) => void;
  readonly onRelationshipConnect: (sourceClassId: ClassId, targetClassId: ClassId) => void;
  readonly onRelationshipReconnect: (
    relationshipId: RelationshipId,
    end: "source" | "target",
    newClassId: ClassId
  ) => void;
  readonly onRelationshipSelect: (relationshipId: RelationshipId) => void;
  readonly onBackgroundClick: () => void;
  readonly onConnectAborted: () => void;
  readonly onPlacementComplete: () => void;
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
  classBoxPlacementState,
  onClassBoxPlacementChange,
  onDragComplete,
  onClassSelect,
  onClassMoved,
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
  const { screenToFlowPosition } = useReactFlow();
  const placementStartPointRef = useRef<XYPosition | null>(null);
  const reconnectSeedRef = useRef<RelationshipSeed | null>(null);
  const isPlacementActive = nodePlacementState !== null;
  const relationshipPlacementState =
    nodePlacementState?.kind === "relationship" ? nodePlacementState : null;
  const isRelationshipPlacementActive = relationshipPlacementState !== null;

  const rfNodes = useMemo(() => {
    const selectedClassIds = selectionState.kind === "classes" ? selectionState.classIds : [];
    return toClassBoxNodeDescriptors(
      view.classes,
      selectedClassIds,
      classBoxPlacementState,
      isRelationshipPlacementActive,
      onClassSelect,
      editingState,
      onTextBlockEditStart,
      onTextBlockEditCancel
    );
  }, [
    view.classes,
    selectionState,
    classBoxPlacementState,
    isRelationshipPlacementActive,
    onClassSelect,
    editingState,
    onTextBlockEditStart,
    onTextBlockEditCancel,
  ]);
  const rfEdges = useMemo(
    () =>
      toRelationshipEdgeDescriptors(
        view.classes,
        view.relationships,
        selectionState,
        classBoxPlacementState,
        isRelationshipPlacementActive,
        onRelationshipSelect
      ),
    [
      view.classes,
      view.relationships,
      selectionState,
      classBoxPlacementState,
      isRelationshipPlacementActive,
      onRelationshipSelect,
    ]
  );

  const callbacks = useMemo(
    () => ({
      onClassBoxPlacementChange,
      onDragComplete,
      onClassMoved,
      onRelationshipConnect,
      onRelationshipReconnect,
      onBackgroundClick,
      onConnectAborted,
    }),
    [
      onClassBoxPlacementChange,
      onDragComplete,
      onClassMoved,
      onRelationshipConnect,
      onRelationshipReconnect,
      onBackgroundClick,
      onConnectAborted,
    ]
  );

  // Rendered for both placement and reconnect drags; reconnect drags carry no
  // placement seed and fall back to the neutral ghost styling.
  const connectionLineComponent = useMemo<ConnectionLineComponent<ClassBoxNodeDescriptor>>(() => {
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

  // Event handler props derivation
  const {
    onNodesChange,
    onNodeDragStop,
    onConnect,
    onConnectStart,
    onConnectEnd,
    onReconnect,
    onReconnectStart,
    onPaneClick,
  } = useInteractions({
    callbacks,
    isRelationshipPlacementArmed: isRelationshipPlacementActive,
    placementStartPointRef,
    reconnectSeedRef,
    screenToFlowPosition,
  });

  return (
    <ReactFlow
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
      <Background />
      <Controls showInteractive={false} />
      <PlacementOverlay
        nodePlacementState={nodePlacementState}
        onPlacementComplete={onPlacementComplete}
      />
    </ReactFlow>
  );
}
