/**
 * @behavior Ready editor selection, placement, relationship placement, text edit semantic handlers, and SelectionState, NodePlacementState, and EditingState updates.
 */

import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { ClassId, NoteId, RelationshipId, StyleDefId } from "../../../shared/ids";
import type {
  EditingState,
  NodePlacementState,
  NoteAttachState,
  RelationshipSeed,
  SelectionState,
} from "../../state/editorStates";
import type { RelationshipView } from "../../views/schema";
import type { TransactionResult } from "../../commands/editorCommands";
import { useDispatchTransaction } from "../../contexts";
import {
  toNoteAttachmentSetTransaction,
  toRelationshipCreateTransaction,
  toRelationshipReconnectTransaction,
} from "./transactions";

type Interactions = {
  readonly onClassPlacementStart: () => void;
  readonly onNotePlacementStart: () => void;
  readonly onRelationshipPlacementStart: (seed: RelationshipSeed) => void;
  readonly onClassSelect: (classId: ClassId, additive: boolean) => void;
  readonly onClassMoved: (classId: ClassId) => void;
  readonly onNoteSelect: (noteId: NoteId) => void;
  readonly onNoteMoved: (noteId: NoteId) => void;
  readonly onNoteAttachStart: (noteId: NoteId) => void;
  readonly onNoteAttachCancel: () => void;
  readonly onNoteDuplicateCommitted: (result: TransactionResult) => void;
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
  readonly onPlacementComplete: (result: TransactionResult | null) => void;
  readonly onTextBlockEditStart: (
    editingState: Exclude<EditingState, { readonly kind: "none" }>
  ) => void;
  readonly onTextBlockEditCancel: () => void;
};

type UseInteractionsInput = {
  readonly relationships: readonly RelationshipView[];
  readonly editingState: EditingState;
  readonly nodePlacementState: NodePlacementState;
  readonly noteAttachState: NoteAttachState;
  readonly setSelectionState: Dispatch<SetStateAction<SelectionState>>;
  readonly setNodePlacementState: Dispatch<SetStateAction<NodePlacementState>>;
  readonly setEditingState: Dispatch<SetStateAction<EditingState>>;
  readonly setNoteAttachState: Dispatch<SetStateAction<NoteAttachState>>;
};

export function useInteractions({
  relationships,
  editingState,
  nodePlacementState,
  noteAttachState,
  setSelectionState,
  setNodePlacementState,
  setEditingState,
  setNoteAttachState,
}: UseInteractionsInput): Interactions {
  const dispatchTransaction = useDispatchTransaction();

  // Event handler props derivation
  const onClassPlacementStart = useCallback(() => {
    setNodePlacementState((state) => updateNodePlacementState(state, { kind: "class" }));
  }, [setNodePlacementState]);

  const onNotePlacementStart = useCallback(() => {
    setNodePlacementState((state) => updateNodePlacementState(state, { kind: "note" }));
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
      if (noteAttachState.kind === "attaching") {
        dispatchTransaction(toNoteAttachmentSetTransaction(noteAttachState.noteId, classId));
        setNoteAttachState({ kind: "none" });
        setSelectionState({ kind: "note", noteId: noteAttachState.noteId });
        return;
      }
      setSelectionState((selectionState) =>
        updateSelectedClassIds(selectionState, classId, additive)
      );
    },
    [
      dispatchTransaction,
      nodePlacementState,
      noteAttachState,
      setNoteAttachState,
      setSelectionState,
    ]
  );

  const onClassMoved = useCallback(
    (classId: ClassId) => {
      setSelectionState((selectionState) =>
        selectionState.kind === "classes" && selectionState.classIds.includes(classId)
          ? selectionState
          : { kind: "classes", classIds: [classId] }
      );
    },
    [setSelectionState]
  );

  const onNoteSelect = useCallback(
    (noteId: NoteId) => {
      if (noteAttachState.kind === "attaching") {
        setNoteAttachState({ kind: "none" });
        return;
      }
      setSelectionState((selectionState) => updateSelectedNoteId(selectionState, noteId));
    },
    [noteAttachState.kind, setNoteAttachState, setSelectionState]
  );

  const onNoteMoved = useCallback(
    (noteId: NoteId) => {
      setSelectionState((selectionState) => updateSelectedNoteId(selectionState, noteId));
    },
    [setSelectionState]
  );

  const onNoteAttachStart = useCallback(
    (noteId: NoteId) => {
      setSelectionState({ kind: "note", noteId });
      setNoteAttachState({ kind: "attaching", noteId });
    },
    [setNoteAttachState, setSelectionState]
  );

  const onNoteAttachCancel = useCallback(() => {
    setNoteAttachState({ kind: "none" });
  }, [setNoteAttachState]);

  const onNoteDuplicateCommitted = useCallback(
    (result: TransactionResult) => {
      const createdNoteId =
        result.status === "committed" ? result.outcome.notes.created.at(-1) : undefined;
      if (!createdNoteId) return;
      setSelectionState({ kind: "note", noteId: createdNoteId });
    },
    [setSelectionState]
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
      const nextRelationshipId =
        outcome.status === "committed"
          ? (outcome.outcome.relationships.renamed[0]?.to ?? relationshipId)
          : relationshipId;
      setSelectionState((selectionState) =>
        updateSelectedRelationshipId(selectionState, nextRelationshipId)
      );
    },
    [dispatchTransaction, relationships, setSelectionState]
  );

  const onRelationshipSelect = useCallback(
    (relationshipId: RelationshipId) => {
      if (noteAttachState.kind === "attaching") {
        setNoteAttachState({ kind: "none" });
        return;
      }
      if (nodePlacementState?.kind === "relationship") return;
      setSelectionState((selectionState) =>
        updateSelectedRelationshipId(selectionState, relationshipId)
      );
    },
    [nodePlacementState, noteAttachState.kind, setNoteAttachState, setSelectionState]
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
    if (noteAttachState.kind === "attaching") {
      setNoteAttachState({ kind: "none" });
      return;
    }
    if (editingState.kind === "none") {
      setSelectionState((state) => clearSelectionState(state));
    } else {
      setEditingState({ kind: "none" });
    }
    setNodePlacementState((state) => (state?.kind === "relationship" ? null : state));
  }, [
    editingState.kind,
    noteAttachState.kind,
    setEditingState,
    setNodePlacementState,
    setNoteAttachState,
    setSelectionState,
  ]);

  const onConnectAborted = useCallback(() => {
    setNodePlacementState((state) => (state?.kind === "relationship" ? null : state));
  }, [setNodePlacementState]);

  const onPlacementComplete = useCallback(
    (result: TransactionResult | null) => {
      const createdNoteId =
        result?.status === "committed" ? result.outcome.notes.created.at(-1) : undefined;
      if (createdNoteId) {
        setSelectionState({ kind: "note", noteId: createdNoteId });
        setEditingState({ kind: "noteText", noteId: createdNoteId });
      }
      setNodePlacementState((state) => updateNodePlacementState(state, null));
    },
    [setEditingState, setNodePlacementState, setSelectionState]
  );

  const onTextBlockEditStart = useCallback(
    (nextEditingState: Exclude<EditingState, { readonly kind: "none" }>) => {
      if (nextEditingState.kind === "noteText") {
        setSelectionState({ kind: "note", noteId: nextEditingState.noteId });
      } else {
        setSelectionState({ kind: "classes", classIds: [nextEditingState.classId] });
      }
      setEditingState(nextEditingState);
    },
    [setEditingState, setSelectionState]
  );

  const onTextBlockEditCancel = useCallback(() => {
    setEditingState({ kind: "none" });
  }, [setEditingState]);

  return {
    onClassPlacementStart,
    onNotePlacementStart,
    onRelationshipPlacementStart,
    onClassSelect,
    onClassMoved,
    onNoteSelect,
    onNoteMoved,
    onNoteAttachStart,
    onNoteAttachCancel,
    onNoteDuplicateCommitted,
    onRelationshipConnect,
    onRelationshipReconnect,
    onRelationshipSelect,
    onRelationshipDuplicate,
    onStyleSelect,
    onBackgroundClick,
    onConnectAborted,
    onPlacementComplete,
    onTextBlockEditStart,
    onTextBlockEditCancel,
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

function updateSelectedNoteId(selectionState: SelectionState, noteId: NoteId): SelectionState {
  return selectionState.kind === "note" && selectionState.noteId === noteId
    ? selectionState
    : { kind: "note", noteId };
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
