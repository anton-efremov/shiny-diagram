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
  ClassBoxLayoutState,
  NodePlacementState,
  SelectionState,
} from "../../../../state/editorStates";
import type { ClassPositionChange } from "../state";
import { toClassBoxNodeDescriptors, toRelationshipEdgeDescriptors } from "./reactFlowAdapters";
import { useReactFlowCanvasAdapterInteractions } from "./useInteractions";
import PlacementOverlay from "./PlacementOverlay/PlacementOverlay";
import ReactFlowClassBoxNodeAdapter from "./ReactFlowClassBoxNodeAdapter/ReactFlowClassBoxNodeAdapter";

const NODE_TYPES = { classBox: ReactFlowClassBoxNodeAdapter };

type ReactFlowCanvasAdapterProps = {
  readonly view: DiagramView;
  readonly selectionState: SelectionState;
  readonly nodePlacementState: NodePlacementState;
  readonly classBoxLayoutState: ClassBoxLayoutState;
  readonly onLayoutChange: (changes: readonly ClassPositionChange[]) => void;
  readonly onDragComplete: (finalPositions: readonly ClassPositionChange[]) => void;
  readonly onSelectionChange: (classIds: readonly ClassId[]) => void;
  readonly onPaneClick: () => void;
};

export default function ReactFlowCanvasAdapter({
  view,
  selectionState,
  nodePlacementState,
  classBoxLayoutState,
  onLayoutChange,
  onDragComplete,
  onSelectionChange: onSelectionChangeProp,
  onPaneClick: onPaneClickProp,
}: ReactFlowCanvasAdapterProps): ReactElement {
  // @job connect:framework:props
  const rfNodes = useMemo(
    () => toClassBoxNodeDescriptors(view.classes, selectionState.classIds, classBoxLayoutState),
    [view.classes, selectionState.classIds, classBoxLayoutState]
  );
  const rfEdges = useMemo(
    () => toRelationshipEdgeDescriptors(view.classes, view.relationships, classBoxLayoutState),
    [view.classes, view.relationships, classBoxLayoutState]
  );

  // @job connect:event:wire
  const callbacks = useMemo(
    () => ({
      onLayoutChange,
      onDragComplete,
      onSelectionChange: onSelectionChangeProp,
      onPaneClick: onPaneClickProp,
    }),
    [onLayoutChange, onDragComplete, onSelectionChangeProp, onPaneClickProp]
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
        <PlacementOverlay nodePlacementState={nodePlacementState} />
      </ReactFlow>
    </ReactFlowProvider>
  );
}
