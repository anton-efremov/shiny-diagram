/**
 * @framework View diagram canvas props to React Flow canvas props and events.
 */

import { useMemo } from "react";
import type { ReactElement } from "react";
import { Background, Controls, ReactFlow, ReactFlowProvider } from "@xyflow/react";
import type { ClassId, RelationshipId } from "../../../../../shared/ids";
import type { DiagramView } from "../../../../views/schema";
import type {
  ClassBoxPlacementState,
  NodePlacementState,
  SelectionState,
} from "../../../../state/editorStates";
import { reactFlowCanvasBoundaryProps } from "../../../../config/reactFlowConfig";
import type { ClassBoxPlacementChange } from "./frameworkAdapters";
import { toClassBoxNodeDescriptors, toRelationshipEdgeDescriptors } from "./frameworkAdapters";
import { useInteractions } from "./useInteractions";
import PlacementOverlay from "./PlacementOverlay/PlacementOverlay";
import ReactFlowClassBoxNodeAdapter from "./ReactFlowClassBoxAdapter/ReactFlowClassBoxAdapter";
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
  onRelationshipSelect,
  onSelectionClear,
  onPlacementComplete,
}: ReactFlowCanvasAdapterProps): ReactElement {
  // Framework prop and event adaptation
  const isPlacementActive = nodePlacementState !== null;
  const isRelationshipPlacementActive = nodePlacementState?.kind === "relationship";

  const rfNodes = useMemo(() => {
    const selectedClassIds = selectionState.kind === "classes" ? selectionState.classIds : [];
    return toClassBoxNodeDescriptors(
      view.classes,
      selectedClassIds,
      classBoxPlacementState,
      onClassSelect
    );
  }, [view.classes, selectionState, classBoxPlacementState, onClassSelect]);
  const rfEdges = useMemo(
    () =>
      toRelationshipEdgeDescriptors(
        view.classes,
        view.relationships,
        selectionState,
        classBoxPlacementState,
        onRelationshipSelect
      ),
    [view.classes, view.relationships, selectionState, classBoxPlacementState, onRelationshipSelect]
  );

  const callbacks = useMemo(
    () => ({
      onClassBoxPlacementChange,
      onDragComplete,
      onSelectionClear,
    }),
    [onClassBoxPlacementChange, onDragComplete, onSelectionClear]
  );

  // Event handler props derivation
  const { onNodesChange, onNodeDragStop, onPaneClick } = useInteractions(callbacks);

  return (
    <ReactFlowProvider>
      <ReactFlow
        // Editable React Flow canvas boundary.
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onNodeDragStop={onNodeDragStop}
        onPaneClick={onPaneClick}
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
    </ReactFlowProvider>
  );
}
