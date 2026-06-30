/**
 * @role [A] Framework adapter
 * @adapts React Flow canvas, controlled node descriptors, and event callbacks.
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
import { toClassBoxNodeDescriptors, toRelationshipEdgeDescriptors } from "./reactFlowAdapters";
import { useReactFlowCanvasAdapterInteractions } from "./useInteractions";
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
  onSelectionChange: onSelectionChangeProp,
  onSelectionClear,
  onPlacementComplete,
}: ReactFlowCanvasAdapterProps): ReactElement {
  // @job connect:framework:props
  const rfNodes = useMemo(
    () => toClassBoxNodeDescriptors(view.classes, selectionState.classIds, classBoxPlacementState),
    [view.classes, selectionState.classIds, classBoxPlacementState]
  );
  const rfEdges = useMemo(
    () => toRelationshipEdgeDescriptors(view.classes, view.relationships, classBoxPlacementState),
    [view.classes, view.relationships, classBoxPlacementState]
  );

  // @job connect:event:wire
  const callbacks = useMemo(
    () => ({
      onClassBoxPlacementChange,
      onDragComplete,
      onSelectionChange: onSelectionChangeProp,
      onSelectionClear,
    }),
    [onClassBoxPlacementChange, onDragComplete, onSelectionChangeProp, onSelectionClear]
  );

  const { onNodesChange, onNodeDragStop, onSelectionChange, onPaneClick } =
    useReactFlowCanvasAdapterInteractions(view, callbacks);

  return (
    <ReactFlowProvider>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={NODE_TYPES}
        onNodesChange={onNodesChange}
        onNodeDragStop={onNodeDragStop}
        onSelectionChange={onSelectionChange}
        onPaneClick={onPaneClick}
        fitView
        nodesDraggable={nodePlacementState === null}
        nodesConnectable={false}
        elementsSelectable={nodePlacementState === null}
        nodesFocusable={nodePlacementState === null}
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
