/**
 * @behavior Ready editor selection, class placement, and relationship placement semantic handlers.
 * @state SelectionState and NodePlacementState updates.
 */

import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { ClassId, RelationshipId, StyleDefId } from "../../../shared/ids";
import type {
  NodePlacementState,
  RelationshipSeed,
  SelectionState,
} from "../../state/editorStates";
import type { RelationshipView } from "../../views/schema";
import { useDispatchTransaction } from "../../contexts";
import {
  toRelationshipCreateTransaction,
  toRelationshipReconnectTransaction,
} from "./transactions";

type Interactions = {
  readonly onClassPlacementStart: () => void;
  readonly onRelationshipPlacementStart: (seed: RelationshipSeed) => void;
  readonly onClassSelect: (classId: ClassId, additive: boolean) => void;
  readonly onRelationshipConnect: (sourceClassId: ClassId, targetClassId: ClassId) => void;
  readonly onRelationshipReconnect: (
    relationshipId: RelationshipId,
    end: "source" | "target",
    newClassId: ClassId
  ) => void;
  readonly onRelationshipSelect: (relationshipId: RelationshipId) => void;
  readonly onRelationshipDuplicate: (seed: RelationshipSeed) => void;
  readonly onStyleSelect: (styleDefId: StyleDefId) => void;
  readonly onBackgroundClick: () => void;
  readonly onConnectAborted: () => void;
  readonly onPlacementComplete: () => void;
};

type UseInteractionsInput = {
  readonly relationships: readonly RelationshipView[];
  readonly nodePlacementState: NodePlacementState;
  readonly setSelectionState: Dispatch<SetStateAction<SelectionState>>;
  readonly setNodePlacementState: Dispatch<SetStateAction<NodePlacementState>>;
};

export function useInteractions({
  relationships,
  nodePlacementState,
  setSelectionState,
  setNodePlacementState,
}: UseInteractionsInput): Interactions {
  const dispatchTransaction = useDispatchTransaction();

  // Event handler props derivation
  const onClassPlacementStart = useCallback(() => {
    setNodePlacementState((state) => updateNodePlacementState(state, { kind: "class" }));
  }, [setNodePlacementState]);

  const onRelationshipPlacementStart = useCallback(
    (seed: RelationshipSeed) => {
      setSelectionState((state) => clearSelectionState(state));
      setNodePlacementState({
        kind: "relationship",
        seed,
      });
    },
    [setNodePlacementState, setSelectionState]
  );

  const onClassSelect = useCallback(
    (classId: ClassId, additive: boolean) => {
      if (nodePlacementState?.kind === "relationship") return;
      setSelectionState((selectionState) =>
        updateSelectedClassIds(selectionState, classId, additive)
      );
    },
    [nodePlacementState, setSelectionState]
  );

  const onRelationshipConnect = useCallback(
    (sourceClassId: ClassId, targetClassId: ClassId) => {
      if (nodePlacementState?.kind !== "relationship") return;
      // Implementing interaction through command transaction
      dispatchTransaction(
        toRelationshipCreateTransaction(nodePlacementState.seed, sourceClassId, targetClassId)
      );
      setNodePlacementState(null);
      setSelectionState((selectionState) => clearSelectionState(selectionState));
    },
    [dispatchTransaction, nodePlacementState, setNodePlacementState, setSelectionState]
  );

  const onRelationshipReconnect = useCallback(
    (relationshipId: RelationshipId, end: "source" | "target", newClassId: ClassId) => {
      const relationship = relationships.find(
        (relationshipView) => relationshipView.relationshipId === relationshipId
      );
      if (!relationship) return;
      const existingClassId =
        end === "source" ? relationship.sourceClassId : relationship.targetClassId;
      if (existingClassId === newClassId) return;

      // Implementing interaction through command transaction
      const outcome = dispatchTransaction(
        toRelationshipReconnectTransaction(relationshipId, end, newClassId)
      );
      const nextRelationshipId = outcome.relationships.renamed[0]?.to ?? relationshipId;
      setSelectionState((selectionState) =>
        selectionState.kind === "relationship" && selectionState.relationshipId === relationshipId
          ? updateSelectedRelationshipId(selectionState, nextRelationshipId)
          : selectionState
      );
    },
    [dispatchTransaction, relationships, setSelectionState]
  );

  const onRelationshipSelect = useCallback(
    (relationshipId: RelationshipId) => {
      if (nodePlacementState?.kind === "relationship") return;
      setSelectionState((selectionState) =>
        updateSelectedRelationshipId(selectionState, relationshipId)
      );
    },
    [nodePlacementState, setSelectionState]
  );

  const onRelationshipDuplicate = useCallback(
    (seed: RelationshipSeed) => {
      setSelectionState((selectionState) => clearSelectionState(selectionState));
      setNodePlacementState({
        kind: "relationship",
        seed,
      });
    },
    [setNodePlacementState, setSelectionState]
  );

  const onStyleSelect = useCallback(
    (styleDefId: StyleDefId) => {
      setSelectionState((state) => updateSelectedStyleDefId(state, styleDefId));
    },
    [setSelectionState]
  );

  const onBackgroundClick = useCallback(() => {
    setSelectionState((state) => clearSelectionState(state));
    setNodePlacementState((state) => (state?.kind === "relationship" ? null : state));
  }, [setNodePlacementState, setSelectionState]);

  const onConnectAborted = useCallback(() => {
    setNodePlacementState((state) => (state?.kind === "relationship" ? null : state));
  }, [setNodePlacementState]);

  const onPlacementComplete = useCallback(() => {
    setNodePlacementState((state) => updateNodePlacementState(state, null));
  }, [setNodePlacementState]);

  return {
    onClassPlacementStart,
    onRelationshipPlacementStart,
    onClassSelect,
    onRelationshipConnect,
    onRelationshipReconnect,
    onRelationshipSelect,
    onRelationshipDuplicate,
    onStyleSelect,
    onBackgroundClick,
    onConnectAborted,
    onPlacementComplete,
  };
}

// Private helpers
function updateSelectedRelationshipId(
  selectionState: SelectionState,
  relationshipId: RelationshipId
): SelectionState {
  return selectionState.kind === "relationship" && selectionState.relationshipId === relationshipId
    ? selectionState
    : { kind: "relationship", relationshipId };
}

function updateSelectedClassIds(
  selectionState: SelectionState,
  classId: ClassId,
  additive: boolean
): SelectionState {
  const classIds =
    selectionState.kind === "classes" && additive
      ? toToggledClassIds(selectionState.classIds, classId)
      : [classId];
  return selectionState.kind === "classes" &&
    areClassIdCollectionsEqual(selectionState.classIds, classIds)
    ? selectionState
    : toClassSelectionState(classIds);
}

function updateNodePlacementState(
  state: NodePlacementState,
  nodePlacementState: NodePlacementState
): NodePlacementState {
  if (state === nodePlacementState) return state;
  if (state?.kind === "class" && nodePlacementState?.kind === "class") return state;
  return nodePlacementState;
}

function toToggledClassIds(
  selectedClassIds: readonly ClassId[],
  classId: ClassId
): readonly ClassId[] {
  return selectedClassIds.includes(classId)
    ? selectedClassIds.filter((selectedClassId) => selectedClassId !== classId)
    : [...selectedClassIds, classId];
}

function updateSelectedStyleDefId(
  selectionState: SelectionState,
  styleDefId: StyleDefId
): SelectionState {
  return selectionState.kind === "style" && selectionState.styleDefId === styleDefId
    ? selectionState
    : toStyleSelectionState(styleDefId);
}

function clearSelectionState(selectionState: SelectionState): SelectionState {
  return selectionState.kind === "none" ? selectionState : { kind: "none" };
}

function toStyleSelectionState(styleDefId: StyleDefId): SelectionState {
  return { kind: "style", styleDefId };
}

function toClassSelectionState(classIds: readonly ClassId[]): SelectionState {
  return classIds.length === 0 ? { kind: "none" } : { kind: "classes", classIds };
}

function areClassIdCollectionsEqual(left: readonly ClassId[], right: readonly ClassId[]): boolean {
  return left.length === right.length && left.every((id, index) => id === right[index]);
}
