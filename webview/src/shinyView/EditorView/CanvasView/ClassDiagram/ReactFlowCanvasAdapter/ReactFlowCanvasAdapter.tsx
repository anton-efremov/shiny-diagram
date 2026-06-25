/**
 * @role [A] Framework adapter
 * @adapts React Flow canvas, controlled node descriptors, and event callbacks.
 */

import { useMemo } from "react";
import type { ReactElement } from "react";
import { Background, Controls, ReactFlow, ReactFlowProvider } from "@xyflow/react";
import type { ClassId } from "../../../../../shared/ids";
import type { ClassPositionChange } from "../state";
import type { ReactFlowCanvasAdapterView } from "./views";
import { toClassBoxNodeDescriptors, toRelationshipEdgeDescriptors } from "./reactFlowAdapters";
import { useReactFlowCanvasAdapterInteractions } from "./useInteractions";
import PlacementOverlay from "./PlacementOverlay/PlacementOverlay";
import ReactFlowClassBoxNodeAdapter from "./ReactFlowClassBoxNodeAdapter/ReactFlowClassBoxNodeAdapter";

const NODE_TYPES = { classBox: ReactFlowClassBoxNodeAdapter };

type ReactFlowCanvasAdapterProps = {
  readonly view: ReactFlowCanvasAdapterView;
  readonly onLayoutChange: (changes: readonly ClassPositionChange[]) => void;
  readonly onDragComplete: (finalPositions: readonly ClassPositionChange[]) => void;
  readonly onSelectionChange: (classIds: readonly ClassId[]) => void;
  readonly onPaneClick: () => void;
};

export default function ReactFlowCanvasAdapter({
  view,
  onLayoutChange,
  onDragComplete,
  onSelectionChange: onSelectionChangeProp,
  onPaneClick: onPaneClickProp,
}: ReactFlowCanvasAdapterProps): ReactElement {
  // @job connect:framework:props
  const rfNodes = useMemo(
    () => toClassBoxNodeDescriptors(view.classes, view.selectedClassIds),
    [view.classes, view.selectedClassIds]
  );
  const rfEdges = useMemo(
    () => toRelationshipEdgeDescriptors(view.classes, view.relationships),
    [view.classes, view.relationships]
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
        nodesDraggable={!view.isPlacementActive}
        nodesConnectable={false}
        elementsSelectable={!view.isPlacementActive}
        nodesFocusable={!view.isPlacementActive}
        edgesFocusable={false}
        panOnDrag={!view.isPlacementActive}
        disableKeyboardA11y
        deleteKeyCode={null}
        zoomOnScroll
      >
        <Background />
        <Controls showInteractive={false} />
        <PlacementOverlay view={view.placementOverlayView} />
      </ReactFlow>
    </ReactFlowProvider>
  );
}
