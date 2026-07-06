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
  ReactFlowProvider,
  type ConnectionLineComponent,
  useReactFlow,
  type XYPosition,
} from "@xyflow/react";
import type { ClassId, RelationshipId } from "../../../../../shared/ids";
import type { DiagramView } from "../../../../views/schema";
import type {
  ClassBoxPlacementState,
  NodePlacementState,
  SelectionState,
} from "../../../../state/editorStates";
import { reactFlowCanvasBoundaryProps } from "../../../../config/reactFlowConfig";
import type {
  ClassBoxNodeDescriptor,
  ClassBoxPlacementChange,
  RelationshipEdgeDescriptor,
} from "./frameworkAdapters";
import { toClassBoxNodeDescriptors, toRelationshipEdgeDescriptors } from "./frameworkAdapters";
import { useInteractions } from "./useInteractions";
import PlacementOverlay from "./PlacementOverlay/PlacementOverlay";
import ReactFlowClassBoxNodeAdapter from "./ReactFlowClassBoxAdapter/ReactFlowClassBoxAdapter";
import RelationshipConnectionLineAdapter from "./RelationshipConnectionLineAdapter/RelationshipConnectionLineAdapter";
import RelationshipEdgeAdapter from "./RelationshipEdgeAdapter/RelationshipEdgeAdapter";
import styles from "./ReactFlowCanvasAdapter.module.css";

const nodeTypes = { classBox: ReactFlowClassBoxNodeAdapter };
const edgeTypes = { relationship: RelationshipEdgeAdapter };

type ReactFlowCanvasAdapterProps = {
  readonly view: DiagramView;
  readonly selectionState: SelectionState;
  readonly nodePlacementState: NodePlacementState;
  readonly classBoxPlacementState: ClassBoxPlacementState;
  readonly onClassBoxPlacementChange: (changes: readonly ClassBoxPlacementChange[]) => void;
  readonly onDragComplete: (finalPositions: readonly ClassBoxPlacementChange[]) => void;
  readonly onClassSelect: (classId: ClassId, additive: boolean) => void;
  readonly onRelationshipConnect: (sourceClassId: ClassId, targetClassId: ClassId) => void;
  readonly onRelationshipReconnect: (
    relationshipId: RelationshipId,
    end: "source" | "target",
    newClassId: ClassId
  ) => void;
  readonly onRelationshipSelect: (relationshipId: RelationshipId) => void;
  readonly onSelectionClear: () => void;
  readonly onPlacementComplete: () => void;
};

export default function ReactFlowCanvasAdapter({
  view,
  selectionState,
  nodePlacementState,
  classBoxPlacementState,
  onClassBoxPlacementChange,
  onDragComplete,
  onClassSelect,
  onRelationshipConnect,
  onRelationshipReconnect,
  onRelationshipSelect,
  onSelectionClear,
  onPlacementComplete,
}: ReactFlowCanvasAdapterProps): ReactElement {
  return (
    <ReactFlowProvider>
      <ReactFlowCanvasAdapterContent
        view={view}
        selectionState={selectionState}
        nodePlacementState={nodePlacementState}
        classBoxPlacementState={classBoxPlacementState}
        onClassBoxPlacementChange={onClassBoxPlacementChange}
        onDragComplete={onDragComplete}
        onClassSelect={onClassSelect}
        onRelationshipConnect={onRelationshipConnect}
        onRelationshipReconnect={onRelationshipReconnect}
        onRelationshipSelect={onRelationshipSelect}
        onSelectionClear={onSelectionClear}
        onPlacementComplete={onPlacementComplete}
      />
    </ReactFlowProvider>
  );
}

function ReactFlowCanvasAdapterContent({
  view,
  selectionState,
  nodePlacementState,
  classBoxPlacementState,
  onClassBoxPlacementChange,
  onDragComplete,
  onClassSelect,
  onRelationshipConnect,
  onRelationshipReconnect,
  onRelationshipSelect,
  onSelectionClear,
  onPlacementComplete,
}: ReactFlowCanvasAdapterProps): ReactElement {
  // Framework prop and event adaptation
  const { screenToFlowPosition } = useReactFlow<
    ClassBoxNodeDescriptor,
    RelationshipEdgeDescriptor
  >();
  const pressPointRef = useRef<XYPosition | null>(null);
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
      onClassSelect
    );
  }, [
    view.classes,
    selectionState,
    classBoxPlacementState,
    isRelationshipPlacementActive,
    onClassSelect,
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
      onRelationshipConnect,
      onRelationshipReconnect,
      onSelectionClear,
    }),
    [
      onClassBoxPlacementChange,
      onDragComplete,
      onRelationshipConnect,
      onRelationshipReconnect,
      onSelectionClear,
    ]
  );

  const connectionLineComponent = useMemo<
    ConnectionLineComponent<ClassBoxNodeDescriptor> | undefined
  >(() => {
    if (!relationshipPlacementState) return undefined;
    const seed = relationshipPlacementState.seed;
    return function ArmedRelationshipConnectionLine(props): ReactElement {
      return (
        <RelationshipConnectionLineAdapter {...props} seed={seed} pressPointRef={pressPointRef} />
      );
    };
  }, [pressPointRef, relationshipPlacementState]);

  // Event handler props derivation
  const {
    onNodesChange,
    onNodeDragStop,
    onConnect,
    onConnectStart,
    onConnectEnd,
    onReconnect,
    onPaneClick,
  } = useInteractions({
    callbacks,
    isRelationshipPlacementArmed: isRelationshipPlacementActive,
    pressPointRef,
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
      onPaneClick={onPaneClick}
      connectionMode={ConnectionMode.Loose}
      reconnectRadius={12}
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
