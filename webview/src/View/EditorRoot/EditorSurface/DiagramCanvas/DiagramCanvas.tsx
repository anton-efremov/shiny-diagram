/**
 * @behavior ClassBoxPlacementState and NoteBoxPlacementState lifecycle plus diagram interaction routing.
 * @render Diagram shell and empty state.
 */

import { useState } from "react";
import type { ReactElement } from "react";
import type { ClassId, NoteId, RelationshipId } from "../../../../shared/ids";
import type { TransactionResult } from "../../../commands/editorCommands";
import type { DiagramView } from "../../../views/schema";
import type {
  EditingState,
  NodePlacementState,
  NoteAttachState,
  SelectionState,
} from "../../../state/editorStates";
import { toInitialClassBoxPlacementState, toInitialNoteBoxPlacementState } from "./state";
import { useInteractions } from "./useInteractions";
import { useStateReconciliation } from "./useStateReconciliation";
import ReactFlowCanvasAdapter from "./ReactFlowCanvasAdapter/ReactFlowCanvasAdapter";
import ReactFlowProviderAdapter from "./ReactFlowProviderAdapter/ReactFlowProviderAdapter";
import styles from "./DiagramCanvas.module.css";

type DiagramCanvasProps = {
  readonly view: DiagramView;
  readonly selectionState: SelectionState;
  readonly editingState: EditingState;
  readonly nodePlacementState: NodePlacementState;
  readonly noteAttachState: NoteAttachState;
  readonly onClassSelect: (classId: ClassId, additive: boolean) => void;
  readonly onClassMoved: (classId: ClassId) => void;
  readonly onNoteSelect: (noteId: NoteId) => void;
  readonly onNoteMoved: (noteId: NoteId) => void;
  readonly onNoteAttachCancel: () => void;
  readonly onRelationshipConnect: (sourceClassId: ClassId, targetClassId: ClassId) => void;
  readonly onRelationshipReconnect: (
    relationshipId: RelationshipId,
    end: "source" | "target",
    newClassId: ClassId
  ) => void;
  readonly onRelationshipSelect: (relationshipId: RelationshipId) => void;
  readonly onBackgroundClick: () => void;
  readonly onConnectAborted: () => void;
  readonly onPlacementComplete: (result: TransactionResult | null) => void;
  readonly onTextBlockEditStart: (
    editingState: Exclude<EditingState, { readonly kind: "none" }>
  ) => void;
  readonly onTextBlockEditCancel: () => void;
};

export default function DiagramCanvas({
  view,
  selectionState,
  editingState,
  nodePlacementState,
  noteAttachState,
  onClassSelect,
  onClassMoved,
  onNoteSelect,
  onNoteMoved,
  onNoteAttachCancel,
  onRelationshipConnect,
  onRelationshipReconnect,
  onRelationshipSelect,
  onBackgroundClick,
  onConnectAborted,
  onPlacementComplete,
  onTextBlockEditStart,
  onTextBlockEditCancel,
}: DiagramCanvasProps): ReactElement {
  // State creation: ledger state - framework-neutral class box positions and dimensions
  const [classBoxPlacementState, setClassBoxPlacementState] = useState(() =>
    toInitialClassBoxPlacementState(view.classes)
  );
  const [noteBoxPlacementState, setNoteBoxPlacementState] = useState(() =>
    toInitialNoteBoxPlacementState(view.notes)
  );

  // State reconciliation
  useStateReconciliation({
    view: view.classes,
    notes: view.notes,
    setClassBoxPlacementState,
    setNoteBoxPlacementState,
  });

  // Event handler props derivation
  const { onClassBoxPlacementChange, onNoteBoxPlacementChange, onDragComplete } = useInteractions({
    view: view.classes,
    notes: view.notes,
    setClassBoxPlacementState,
    setNoteBoxPlacementState,
  });

  return (
    <section className={styles.diagramShell} aria-label="Static editor boxes">
      {view.classes.length === 0 ? (
        <p className={styles.emptyState}>No spatial annotations found.</p>
      ) : null}
      <ReactFlowProviderAdapter>
        <ReactFlowCanvasAdapter
          view={view}
          selectionState={selectionState}
          editingState={editingState}
          nodePlacementState={nodePlacementState}
          noteAttachState={noteAttachState}
          classBoxPlacementState={classBoxPlacementState}
          noteBoxPlacementState={noteBoxPlacementState}
          onClassBoxPlacementChange={onClassBoxPlacementChange}
          onNoteBoxPlacementChange={onNoteBoxPlacementChange}
          onDragComplete={onDragComplete}
          onClassSelect={onClassSelect}
          onClassMoved={onClassMoved}
          onNoteSelect={onNoteSelect}
          onNoteMoved={onNoteMoved}
          onNoteAttachCancel={onNoteAttachCancel}
          onRelationshipConnect={onRelationshipConnect}
          onRelationshipReconnect={onRelationshipReconnect}
          onRelationshipSelect={onRelationshipSelect}
          onBackgroundClick={onBackgroundClick}
          onConnectAborted={onConnectAborted}
          onPlacementComplete={onPlacementComplete}
          onTextBlockEditStart={onTextBlockEditStart}
          onTextBlockEditCancel={onTextBlockEditCancel}
        />
      </ReactFlowProviderAdapter>
    </section>
  );
}
