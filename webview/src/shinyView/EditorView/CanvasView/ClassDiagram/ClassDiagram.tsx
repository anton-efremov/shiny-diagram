/**
 * @role [L] Logic
 * @logic React Flow node state and placement interaction props.
 * @adapts React Flow.
 * @presents React Flow class diagram canvas.
 */
import { useCallback, useMemo, useState } from "react";
import type { ReactElement } from "react";
import type { NodeChange, NodeTypes, OnNodeDrag, OnSelectionChangeFunc } from "@xyflow/react";
import { Background, Controls, ReactFlow, ReactFlowProvider } from "@xyflow/react";
import type { ClassId } from "../../../../shared/ids";
import { useDispatchCommand } from "../../contexts";
import { useDispatchEditorStateAction } from "../contexts";
import ClassBox from "./ClassBox/ClassBox";
import PlacementOverlay from "./PlacementOverlay/PlacementOverlay";
import {
  applyClassDiagramNodeChanges,
  createInitialClassDiagramState,
  projectClassDiagramSelectionToNodes,
  rebuildClassDiagramNodesFromClassViews,
} from "./state";
import type { ClassBoxNodeDescriptor, RelationshipEdgeDescriptor } from "./reactFlowAdapters";
import { toRelationshipEdgeDescriptors } from "./reactFlowAdapters";
import { useStateReconciliation } from "./useStateReconciliation";
import type { ClassDiagramView } from "./views";
import styles from "./ClassDiagram.module.css";

const nodeTypes = { classBox: ClassBox } satisfies NodeTypes;

type ClassDiagramProps = {
  readonly view: ClassDiagramView;
};

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

  // @job connect:adapt:framework
  const rfNodes = classDiagramState.rfNodes;
  const rfEdges = useMemo(
    () => toRelationshipEdgeDescriptors(view.elements.classes, view.elements.relationships),
    [view.elements.classes, view.elements.relationships]
  );

  // @job logic:view:prop
  const isPlacementActive = view.placementMode !== null;

  // @job logic:state:transport
  const onNodesChange = useCallback(
    (changes: NodeChange<ClassBoxNodeDescriptor>[]) => {
      applyNodeChanges(changes);
    },
    [applyNodeChanges]
  );

  // @job connect:adapt:event
  const dispatchCommand = useDispatchCommand();
  const dispatchEditorStateAction = useDispatchEditorStateAction();
  const onNodeDragStop = useCallback<OnNodeDrag<ClassBoxNodeDescriptor>>(
    (_event, _rfNode, rfNodes) => {
      const viewsById = new Map(
        view.elements.classes.map((classView) => [classView.classId, classView])
      );
      const finalPositionsByClassId = new Map(
        rfNodes.flatMap((rfNode) => {
          if (rfNode.type !== "classBox") return [];

          const classView = viewsById.get(rfNode.data.view.view.classId);
          if (!classView) return [];

          return [[classView.classId, rfNode.position] as const];
        })
      );

      // @job logic:command:derive
      const moves = view.elements.classes.flatMap((classView) => {
        const position = finalPositionsByClassId.get(classView.classId);
        if (!position) return [];

        return [
          {
            classId: classView.classId,
            rect: {
              x: position.x,
              y: position.y,
              w: classView.w,
              h: classView.h,
            },
          },
        ];
      });

      if (moves.length === 0) return;

      // @job connect:wire:command
      dispatchCommand({ type: "class.move", moves });
    },
    [dispatchCommand, view.elements.classes]
  );

  // @job connect:adapt:event
  const onSelectionChange = useCallback<
    OnSelectionChangeFunc<ClassBoxNodeDescriptor, RelationshipEdgeDescriptor>
  >(
    ({ nodes }) => {
      const selected = new Set<ClassId>();
      for (const node of nodes) {
        if (node.type === "classBox") {
          selected.add(node.data.view.view.classId);
        }
      }

      const orderedSelection = view.elements.classes.flatMap((classView) =>
        selected.has(classView.classId) ? [classView.classId] : []
      );

      // @job connect:wire:action
      dispatchEditorStateAction({ type: "selection.setClassIds", classIds: orderedSelection });
    },
    [dispatchEditorStateAction, view.elements.classes]
  );

  // @job connect:wire:action
  const onPaneClick = useCallback(() => {
    dispatchEditorStateAction({ type: "selection.clearClassIds" });
  }, [dispatchEditorStateAction]);

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
