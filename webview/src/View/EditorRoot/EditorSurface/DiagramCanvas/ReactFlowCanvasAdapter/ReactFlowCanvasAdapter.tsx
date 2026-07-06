/**
 * @framework View diagram canvas props to React Flow canvas props and events.
 */

import { useMemo } from "react";
import type { ReactElement } from "react";
import { Background, Controls, ReactFlow, ReactFlowProvider } from "@xyflow/react";
import type { ClassId } from "../../../../../shared/ids";
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

const nodeTypes = { classBox: ReactFlowClassBoxNodeAdapter };

type ReactFlowCanvasAdapterProps = {
  readonly view: DiagramView;
  readonly selectionState: SelectionState;
  readonly nodePlacementState: NodePlacementState;
  readonly classBoxPlacementState: ClassBoxPlacementState;
  readonly onClassBoxPlacementChange: (changes: readonly ClassBoxPlacementChange[]) => void;
  readonly onDragComplete: (finalPositions: readonly ClassBoxPlacementChange[]) => void;
  readonly onClassSelect: (classId: ClassId, additive: boolean) => void;
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
  onSelectionClear,
  onPlacementComplete,
}: ReactFlowCanvasAdapterProps): ReactElement {
  // Framework prop and event adaptation
  const isPlacementActive = nodePlacementState !== null;

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
    () => toRelationshipEdgeDescriptors(view.classes, view.relationships, classBoxPlacementState),
    [view.classes, view.relationships, classBoxPlacementState]
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
        onNodesChange={onNodesChange}
        onNodeDragStop={onNodeDragStop}
        onPaneClick={onPaneClick}
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
