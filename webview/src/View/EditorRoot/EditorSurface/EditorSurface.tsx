/**
 * @behavior Ready editor selection, placement state lifecycle, and child interaction routing.
 * @render Ready editor layout.
 */

import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import type {
  EditingState,
  NodePlacementState,
  NoteAttachState,
  SelectionState,
} from "../../state/editorStates";
import type { DiagramView } from "../../views/schema";
import ClassDiagram from "./DiagramCanvas/DiagramCanvas";
import StylePane from "./StylePane/StylePane";
import ToolPane from "./ToolPane/ToolPane";
import {
  toInitialEditingState,
  toInitialNodePlacementState,
  toInitialNoteAttachState,
  toInitialSelectionState,
} from "./state";
import { useInteractions } from "./useInteractions";
import { useStateReconciliation } from "./useStateReconciliation";
import styles from "./EditorSurface.module.css";

type EditorSurfaceProps = {
  readonly view: DiagramView;
};

export default function EditorSurface({ view }: EditorSurfaceProps): ReactElement {
  // State creation: ledger states - selected editor entities and active node placement kind
  const [selectionState, setSelectionState] = useState<SelectionState>(() =>
    toInitialSelectionState()
  );
  const [nodePlacementState, setNodePlacementState] = useState<NodePlacementState>(() =>
    toInitialNodePlacementState()
  );
  const [editingState, setEditingState] = useState<EditingState>(() => toInitialEditingState());
  const [noteAttachState, setNoteAttachState] = useState<NoteAttachState>(() =>
    toInitialNoteAttachState()
  );

  // State reconciliation
  useStateReconciliation({ view, setSelectionState, setEditingState, setNoteAttachState });

  // Event handler props derivation
  const {
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
  } = useInteractions({
    relationships: view.relationships,
    editingState,
    nodePlacementState,
    noteAttachState,
    setSelectionState,
    setNodePlacementState,
    setEditingState,
    setNoteAttachState,
  });

  // Keystroke listener registration
  useEffect(() => {
    if (noteAttachState.kind !== "attaching") return;

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onNoteAttachCancel();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [noteAttachState.kind, onNoteAttachCancel]);

  return (
    <section className={styles.editorShell} aria-label="Class diagram editor">
      <ToolPane
        nodePlacementState={nodePlacementState}
        onClassPlacementStart={onClassPlacementStart}
        onNotePlacementStart={onNotePlacementStart}
        onRelationshipPlacementStart={onRelationshipPlacementStart}
      />
      <div className={styles.canvasRegion}>
        <ClassDiagram
          view={view}
          selectionState={selectionState}
          editingState={editingState}
          nodePlacementState={nodePlacementState}
          noteAttachState={noteAttachState}
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
      </div>
      <StylePane
        view={view}
        selectionState={selectionState}
        onStyleSelect={onStyleSelect}
        onNoteAttachStart={onNoteAttachStart}
        onNoteDuplicateCommitted={onNoteDuplicateCommitted}
        onRelationshipSelect={onRelationshipSelect}
        onRelationshipDuplicate={onRelationshipDuplicate}
      />
    </section>
  );
}
