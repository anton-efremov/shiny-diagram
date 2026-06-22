import { useCallback, useEffect, useState } from "react";
import type { ReactElement } from "react";
import type { NodeChange } from "@xyflow/react";
import {
  applyNodeChanges,
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import type { EditorDispatch } from "../../commands/editorCommand";
import type { ClassId } from "../../../shared/ids";
import type { PlacementMode } from "../placementMode";
import type { ElementViews } from "../views";
import { useClassBoxNodeInteractions } from "./useClassBoxNodeInteractions";
import { useCanvasInteractions } from "./useCanvasInteractions";
import ClassBox from "./ClassBox/ClassBox";
import PlacementOverlay from "./PlacementOverlay/PlacementOverlay";
import {
  type ClassBoxNodeDescriptor,
  type RelationshipEdgeDescriptor,
  toClassBoxNodeDescriptors,
  toRelationshipEdgeDescriptors,
} from "./reactFlowAdapters";
import styles from "./ClassDiagram.module.css";

type ClassDiagramProps = {
  elements: ElementViews;
  selectedClassIds: readonly ClassId[];
  placementMode: PlacementMode | null;
  onSelectedClassIdsChange: (classIds: readonly ClassId[]) => void;
  onPlacementModeChange: (placementMode: PlacementMode | null) => void;
  dispatch: EditorDispatch;
};

/**
 * Renders the ReactFlow class diagram canvas.
 */
export default function ClassDiagram({
  elements,
  selectedClassIds,
  placementMode,
  onSelectedClassIdsChange,
  onPlacementModeChange,
  dispatch,
}: ClassDiagramProps): ReactElement {
  const isPlacementActive = placementMode !== null;
  const [rfNodes, setRfNodes] = useState<ClassBoxNodeDescriptor[]>(() =>
    toClassBoxNodeDescriptors(elements.classes, selectedClassIds, dispatch)
  );
  const [rfEdges, setRfEdges] = useState<RelationshipEdgeDescriptor[]>(() =>
    toRelationshipEdgeDescriptors(elements.classes, elements.relationships)
  );

  useEffect(() => {
    setRfNodes(toClassBoxNodeDescriptors(elements.classes, [], dispatch));
  }, [elements.classes, dispatch]);

  useEffect(() => {
    const selected = new Set(selectedClassIds);
    const hasSoleSelection = selectedClassIds.length === 1;
    setRfNodes((prev) =>
      prev.map((node) => ({
        ...node,
        selected: selected.has(node.data.classId),
        data: {
          ...node.data,
          dispatch,
          isSoleSelection: hasSoleSelection && selected.has(node.data.classId),
        },
      }))
    );
  }, [selectedClassIds, dispatch]);

  useEffect(() => {
    setRfEdges(toRelationshipEdgeDescriptors(elements.classes, elements.relationships));
  }, [elements.classes, elements.relationships]);

  const handleNodesChange = useCallback((changes: NodeChange<ClassBoxNodeDescriptor>[]) => {
    setRfNodes((prev) => applyNodeChanges(changes, prev));
  }, []);

  const { onNodeDragStop } = useClassBoxNodeInteractions(elements, dispatch);
  const { onSelectionChange } = useCanvasInteractions(
    elements,
    selectedClassIds,
    onSelectedClassIdsChange
  );

  return (
    <section className={styles.diagramShell} aria-label="Static editor boxes">
      <ReactFlowProvider>
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          nodeTypes={{ classBox: ClassBox }}
          onNodesChange={handleNodesChange}
          onSelectionChange={onSelectionChange}
          onNodeDragStop={onNodeDragStop}
          fitView
          nodesDraggable={!isPlacementActive}
          nodesConnectable={false}
          elementsSelectable={!isPlacementActive}
          nodesFocusable={!isPlacementActive}
          edgesFocusable={false}
          disableKeyboardA11y
          deleteKeyCode={null}
          panOnDrag={!isPlacementActive}
          zoomOnScroll
        >
          {rfNodes.length === 0 ? (
            <p className={styles.emptyState}>No spatial annotations found.</p>
          ) : null}
          <Background />
          <Controls showInteractive={false} />
          <PlacementOverlay
            placementMode={placementMode}
            dispatch={dispatch}
            onPlacementModeChange={onPlacementModeChange}
          />
        </ReactFlow>
      </ReactFlowProvider>
    </section>
  );
}
