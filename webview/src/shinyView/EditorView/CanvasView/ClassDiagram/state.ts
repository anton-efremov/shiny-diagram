/**
 * @fileoverview Pure controlled React Flow node state for ClassDiagram.
 */

import type { NodeChange } from "@xyflow/react";
import { applyNodeChanges } from "@xyflow/react";
import type { ClassId } from "../../../../shared/ids";
import type { ClassBoxView } from "./ClassBox/views";
import type { ClassBoxNodeDescriptor } from "./reactFlowAdapters";
import { toClassBoxNodeDescriptors } from "./reactFlowAdapters";
import type { ClassDiagramView } from "./views";

export type ClassDiagramState = {
  readonly rfNodes: ClassBoxNodeDescriptor[];
};

// @job-helper logic:state:initialize
export function createInitialClassDiagramState(view: ClassDiagramView): ClassDiagramState {
  return {
    rfNodes: toClassBoxNodeDescriptors(view.elements.classes, view.selectedClassIds),
  };
}

// @job-helper logic:state:transform
export function applyClassDiagramNodeChanges(
  state: ClassDiagramState,
  changes: NodeChange<ClassBoxNodeDescriptor>[]
): ClassDiagramState {
  return updateClassBoxNodes(state, applyNodeChanges(changes, state.rfNodes));
}

// @job-helper logic:state:reconcile
export function rebuildClassDiagramNodesFromClassViews(
  state: ClassDiagramState,
  classes: readonly ClassBoxView[],
  selectedClassIds: readonly ClassId[]
): ClassDiagramState {
  return reconcileClassBoxNodes(state, toClassBoxNodeDescriptors(classes, selectedClassIds));
}

// @job-helper logic:state:reconcile
export function projectClassDiagramSelectionToNodes(
  state: ClassDiagramState,
  selectedClassIds: readonly ClassId[]
): ClassDiagramState {
  return reconcileClassBoxNodes(
    state,
    projectClassBoxNodeSelection(state.rfNodes, selectedClassIds)
  );
}

// @job-helper logic:state:transform
function updateClassBoxNodes(
  state: ClassDiagramState,
  rfNodes: ClassBoxNodeDescriptor[]
): ClassDiagramState {
  return rfNodes === state.rfNodes ? state : { ...state, rfNodes };
}

// @job-helper logic:state:reconcile
function reconcileClassBoxNodes(
  state: ClassDiagramState,
  rfNodes: ClassBoxNodeDescriptor[]
): ClassDiagramState {
  return areClassBoxNodeCollectionsEquivalent(state.rfNodes, rfNodes)
    ? state
    : { ...state, rfNodes };
}

// @job-helper logic:state:reconcile
function projectClassBoxNodeSelection(
  nodes: readonly ClassBoxNodeDescriptor[],
  selectedClassIds: readonly ClassId[]
): ClassBoxNodeDescriptor[] {
  const selected = new Set<ClassId>(selectedClassIds);
  const hasSoleSelection = selectedClassIds.length === 1;
  let didChange = false;

  const projected = nodes.map((node) => {
    const isSelected = selected.has(node.data.view.view.classId);
    const isResizeVisible = hasSoleSelection && isSelected;

    if (node.selected === isSelected && node.data.view.isResizeVisible === isResizeVisible) {
      return node;
    }

    didChange = true;

    return {
      ...node,
      selected: isSelected,
      data:
        node.data.view.isResizeVisible === isResizeVisible
          ? node.data
          : {
              view: {
                ...node.data.view,
                isResizeVisible,
              },
            },
    };
  });

  return didChange ? projected : (nodes as ClassBoxNodeDescriptor[]);
}

function areClassBoxNodeCollectionsEquivalent(
  left: readonly ClassBoxNodeDescriptor[],
  right: readonly ClassBoxNodeDescriptor[]
): boolean {
  return (
    left.length === right.length &&
    left.every((leftNode, index) => areClassBoxNodesEquivalent(leftNode, right[index]))
  );
}

function areClassBoxNodesEquivalent(
  left: ClassBoxNodeDescriptor,
  right: ClassBoxNodeDescriptor | undefined
): boolean {
  return (
    right !== undefined &&
    left.id === right.id &&
    left.type === right.type &&
    left.selected === right.selected &&
    left.position.x === right.position.x &&
    left.position.y === right.position.y &&
    left.width === right.width &&
    left.height === right.height &&
    left.style?.width === right.style?.width &&
    left.style?.height === right.style?.height &&
    left.data.view.view === right.data.view.view &&
    left.data.view.isResizeVisible === right.data.view.isResizeVisible
  );
}
