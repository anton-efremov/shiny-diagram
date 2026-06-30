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
import { toClassBoxNodeDescriptors, toRelationshipEdgeDescriptors } from "./frameworkAdapters";
import { useInteractions } from "./useInteractions";
import PlacementOverlay from "./PlacementOverlay/PlacementOverlay";
import ReactFlowClassBoxNodeAdapter from "./ReactFlowClassBoxAdapter/ReactFlowClassBoxAdapter";

const NODE_TYPES = { classBox: ReactFlowClassBoxNodeAdapter };

type ClassBoxPlacementChange = {
  readonly classId: ClassId;
  readonly x: number;
  readonly y: number;
};

type ReactFlowCanvasAdapterProps = {
  readonly view: DiagramView;
  readonly selectionState: SelectionState;
  readonly nodePlacementState: NodePlacementState;
  readonly classBoxPlacementState: ClassBoxPlacementState;
  readonly onClassBoxPlacementChange: (changes: readonly ClassBoxPlacementChange[]) => void;
  readonly onDragComplete: (finalPositions: readonly ClassBoxPlacementChange[]) => void;
  readonly onSelectionChange: (classIds: readonly ClassId[]) => void;
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
  onSelectionChange,
  onSelectionClear,
  onPlacementComplete,
}: ReactFlowCanvasAdapterProps): ReactElement {
  // Framework prop and event adaptation
  const rfNodes = useMemo(
    () =>
      toClassBoxNodeDescriptors(
        view.classes,
        selectionState.classIds,
        classBoxPlacementState,
        onSelectionChange
      ),
    [view.classes, selectionState.classIds, classBoxPlacementState, onSelectionChange]
  );
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
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={NODE_TYPES}
        onNodesChange={onNodesChange}
        onNodeDragStop={onNodeDragStop}
        onPaneClick={onPaneClick}
        fitView
        nodesDraggable={nodePlacementState === null}
        nodesConnectable={false}
        elementsSelectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        panOnDrag={nodePlacementState === null}
        disableKeyboardA11y
        deleteKeyCode={null}
        zoomOnScroll
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
