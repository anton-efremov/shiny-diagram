/**
 * @role [L+P] Logic plus presentational
 * @logic Placement-active canvas interaction gating.
 * @presents React Flow class diagram canvas.
 */
import { useCallback, useMemo, useState } from "react";
import type { ReactElement } from "react";
import type { NodeChange, NodeTypes } from "@xyflow/react";
import { Background, Controls, ReactFlow, ReactFlowProvider } from "@xyflow/react";
import { useClassBoxNodeInteractions } from "./useClassBoxNodeInteractions";
import { useCanvasInteractions } from "./useCanvasInteractions";
import ClassBox from "./ClassBox/ClassBox";
import PlacementOverlay from "./PlacementOverlay/PlacementOverlay";
import {
  applyClassDiagramNodeChanges,
  createInitialClassDiagramState,
  projectClassDiagramSelectionToNodes,
  rebuildClassDiagramNodesFromClassViews,
} from "./state";
import type { ClassBoxNodeDescriptor } from "./reactFlowAdapters";
import { toRelationshipEdgeDescriptors } from "./reactFlowAdapters";
import { useStateReconciliation } from "./useStateReconciliation";
import type { ClassDiagramView } from "./views";
import styles from "./ClassDiagram.module.css";

// @job-helper adapt:framework-props
const nodeTypes = { classBox: ClassBox } satisfies NodeTypes;

type ClassDiagramProps = {
  readonly view: ClassDiagramView;
};

/**
 * Renders the ReactFlow class diagram canvas.
 */
export default function ClassDiagram({ view }: ClassDiagramProps): ReactElement {
  
  // @job logic:state:initialize
  const [classDiagramState, setClassDiagramState] = useState(() =>
    createInitialClassDiagramState(view)
  );

  // @job logic:state:transform
  const applyNodeChanges = useCallback((changes: NodeChange<ClassBoxNodeDescriptor>[]) => {
    setClassDiagramState((state) => applyClassDiagramNodeChanges(state, changes));
  }, []);

  // @job logic:state:reconcile
  const rebuildNodesFromClassViews = useCallback(
    (
      classes: ClassDiagramView["elements"]["classes"],
      selectedClassIds: ClassDiagramView["selectedClassIds"]
    ) => {
      setClassDiagramState((state) =>
        rebuildClassDiagramNodesFromClassViews(state, classes, selectedClassIds)
      );
    },
    []
  );
  const projectSelectionToNodes = useCallback(
    (selectedClassIds: ClassDiagramView["selectedClassIds"]) => {
      setClassDiagramState((state) => projectClassDiagramSelectionToNodes(state, selectedClassIds));
    },
    []
  );

  // @job logic:state:reconcile
  useStateReconciliation(view, rebuildNodesFromClassViews, projectSelectionToNodes);

  // @job adapt:framework-props
  const rfNodes = classDiagramState.rfNodes;
  const rfEdges = useMemo(
    () => toRelationshipEdgeDescriptors(view.elements.classes, view.elements.relationships),
    [view.elements.classes, view.elements.relationships]
  );

  // @job logic:ui-prop
  const isPlacementActive = view.placementMode !== null;

  // @job logic:state:transport
  const onNodesChange = useCallback(
    (changes: NodeChange<ClassBoxNodeDescriptor>[]) => {
      applyNodeChanges(changes);
    },
    [applyNodeChanges]
  );

  // @job wire:command
  const { onNodeDragStop } = useClassBoxNodeInteractions(view.elements.classes);

  // @job wire:action
  const { onSelectionChange, onPaneClick } = useCanvasInteractions(
    view.elements.classes.map((classView) => classView.classId)
  );

  // @job render:ui
  return (
    <section className={styles.diagramShell} aria-label="Static editor boxes">
      <ReactFlowProvider>
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onSelectionChange={onSelectionChange}
          onPaneClick={onPaneClick}
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
          {/* @job render:ui */}
          {rfNodes.length === 0 ? (
            <p className={styles.emptyState}>No spatial annotations found.</p>
          ) : null}
          <Background />
          <Controls showInteractive={false} />
          <PlacementOverlay view={{ placementMode: view.placementMode }} />
        </ReactFlow>
      </ReactFlowProvider>
    </section>
  );
}
