/**
 * @fileoverview Controlled React Flow state owned by ClassDiagram.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { NodeChange } from "@xyflow/react";
import { applyNodeChanges } from "@xyflow/react";
import type { ClassId } from "../../../shared/ids";
import type { ElementViews } from "../views";
import {
  type ClassBoxNodeDescriptor,
  type RelationshipEdgeDescriptor,
  projectClassBoxNodeSelection,
  toClassBoxNodeDescriptors,
  toRelationshipEdgeDescriptors,
} from "./reactFlowAdapters";

type UseClassDiagramFlowStateResult = {
  readonly rfNodes: ClassBoxNodeDescriptor[];
  readonly rfEdges: RelationshipEdgeDescriptor[];
  readonly onNodesChange: (changes: NodeChange<ClassBoxNodeDescriptor>[]) => void;
};

export function useClassDiagramFlowState(
  elements: ElementViews,
  selectedClassIds: readonly ClassId[]
): UseClassDiagramFlowStateResult {
  const selectedClassIdsRef = useRef(selectedClassIds);
  selectedClassIdsRef.current = selectedClassIds;

  const initialNodes = useMemo(
    () => toClassBoxNodeDescriptors(elements.classes, selectedClassIds),
    [elements.classes, selectedClassIds]
  );
  const relationshipEdges = useMemo(
    () => toRelationshipEdgeDescriptors(elements.classes, elements.relationships),
    [elements.classes, elements.relationships]
  );

  const [rfNodes, setRfNodes] = useState<ClassBoxNodeDescriptor[]>(initialNodes);
  const [rfEdges, setRfEdges] = useState<RelationshipEdgeDescriptor[]>(relationshipEdges);

  useEffect(() => {
    setRfNodes(toClassBoxNodeDescriptors(elements.classes, selectedClassIdsRef.current));
  }, [elements.classes]);

  useEffect(() => {
    setRfNodes((prev) => projectClassBoxNodeSelection(prev, selectedClassIds));
  }, [selectedClassIds]);

  useEffect(() => {
    setRfEdges(relationshipEdges);
  }, [relationshipEdges]);

  const onNodesChange = useCallback((changes: NodeChange<ClassBoxNodeDescriptor>[]) => {
    setRfNodes((prev) => applyNodeChanges(changes, prev));
  }, []);

  return { rfNodes, rfEdges, onNodesChange };
}
