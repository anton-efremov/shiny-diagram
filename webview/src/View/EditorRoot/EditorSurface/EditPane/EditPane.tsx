/**
 * @behavior Selected diagram element view slicing and edit pane scenario routing.
 * @render Style inspector pane.
 */

import type { ReactElement } from "react";
import DiagramEditPane from "./DiagramEditPane/DiagramEditPane";
import ClassEditPane from "./ClassEditPane/ClassEditPane";
import NoteEditPane from "./NoteEditPane/NoteEditPane";
import RelationshipEditPane from "./RelationshipEditPane/RelationshipEditPane";
import NamespaceEditPane from "./NamespaceEditPane/NamespaceEditPane";
import type { NamespaceId, NoteId, RelationshipId, StyleDefId } from "../../../../shared/ids";
import type { TransactionResult } from "../../../commands/editorCommands";
import type { RelationshipSeed } from "../../../state/editorStates";
import type { SelectionState } from "../../../state/editorStates";
import type { DiagramView, NoteView, RelationshipView } from "../../../views/schema";
import { EDIT_PANE_WIDTH } from "../../../config/editorUiConfig";
import PaneFrame from "../../../ui/templates/PaneFrame/PaneFrame";

type EditPaneProps = {
  readonly view: Pick<DiagramView, "classes" | "relationships" | "notes" | "styles" | "namespaces">;
  readonly selectionState: SelectionState;
  readonly onStyleSelect: (
    styleDefId: StyleDefId,
    origin?: Extract<SelectionState, { readonly kind: "classes" }>
  ) => void;
  readonly onSelectionRestore: (selectionState: SelectionState) => void;
  readonly onStyleCreateCommitted: (
    result: TransactionResult,
    origin?: Extract<SelectionState, { readonly kind: "classes" }>
  ) => void;
  readonly onStyleRenameCommitted: (
    result: TransactionResult,
    previousStyleDefId: StyleDefId
  ) => void;
  readonly onNoteAttachStart: (noteId: NoteId) => void;
  readonly onNoteDuplicateCommitted: (result: TransactionResult) => void;
  readonly onNamespaceRenameCommitted: (
    result: TransactionResult,
    previousNamespaceId: NamespaceId
  ) => void;
  readonly onRelationshipSelect: (relationshipId: RelationshipId) => void;
  readonly onRelationshipDuplicate: (seed: RelationshipSeed) => void;
};

type EditPaneScenario =
  | {
      readonly kind: "diagram";
      readonly selectionState: SelectionState;
    }
  | {
      readonly kind: "classes";
      readonly selectionState: Extract<SelectionState, { readonly kind: "classes" }>;
    }
  | {
      readonly kind: "relationship";
      readonly selectedRelationship: RelationshipView;
    }
  | {
      readonly kind: "note";
      readonly selectedNote: NoteView;
    }
  | {
      readonly kind: "namespace";
      readonly selectionState: Extract<SelectionState, { readonly kind: "namespace" }>;
    };

export default function EditPane({
  view,
  selectionState,
  onStyleSelect,
  onSelectionRestore,
  onStyleCreateCommitted,
  onStyleRenameCommitted,
  onNoteAttachStart,
  onNoteDuplicateCommitted,
  onNamespaceRenameCommitted,
  onRelationshipSelect,
  onRelationshipDuplicate,
}: EditPaneProps): ReactElement {
  // View and State slice props derivation
  const editPaneScenario = toEditPaneScenario(view, selectionState);

  // Child component routing
  let editPaneContent: ReactElement;
  switch (editPaneScenario.kind) {
    case "diagram":
      editPaneContent = (
        <DiagramEditPane
          view={view}
          selectionState={editPaneScenario.selectionState}
          onSelectionRestore={onSelectionRestore}
          onStyleSelect={onStyleSelect}
          onStyleCreateCommitted={onStyleCreateCommitted}
          onStyleRenameCommitted={onStyleRenameCommitted}
        />
      );
      break;
    case "classes":
      editPaneContent = (
        <ClassEditPane
          view={view}
          selectionState={editPaneScenario.selectionState}
          onStyleSelect={onStyleSelect}
          onStyleCreateCommitted={onStyleCreateCommitted}
        />
      );
      break;
    case "relationship":
      editPaneContent = (
        <RelationshipEditPane
          view={editPaneScenario.selectedRelationship}
          onRelationshipSelect={onRelationshipSelect}
          onRelationshipDuplicate={onRelationshipDuplicate}
        />
      );
      break;
    case "note":
      editPaneContent = (
        <NoteEditPane
          view={editPaneScenario.selectedNote}
          onNoteAttachStart={onNoteAttachStart}
          onNoteDuplicateCommitted={onNoteDuplicateCommitted}
        />
      );
      break;
    case "namespace":
      editPaneContent = (
        <NamespaceEditPane
          view={view}
          selectionState={editPaneScenario.selectionState}
          onNamespaceRenameCommitted={onNamespaceRenameCommitted}
        />
      );
      break;
  }

  return <PaneFrame width={EDIT_PANE_WIDTH}>{editPaneContent}</PaneFrame>;
}

// Private helpers
function toEditPaneScenario(
  view: Pick<DiagramView, "classes" | "relationships" | "notes" | "styles" | "namespaces">,
  selectionState: SelectionState
): EditPaneScenario {
  switch (selectionState.kind) {
    case "none":
      return { kind: "diagram", selectionState };
    case "classes": {
      const selected = new Set(selectionState.classIds);
      const selectedClasses = view.classes.filter((classView) => selected.has(classView.classId));
      return selectedClasses.length === 0
        ? { kind: "diagram", selectionState }
        : { kind: "classes", selectionState };
    }
    case "style": {
      const selectedStyle = view.styles.find(
        (styleView) =>
          styleView.kind === "declared" && styleView.styleDefId === selectionState.styleDefId
      );
      return selectedStyle
        ? { kind: "diagram", selectionState }
        : { kind: "diagram", selectionState };
    }
    case "relationship": {
      const selectedRelationship = view.relationships.find(
        (relationshipView) => relationshipView.relationshipId === selectionState.relationshipId
      );
      return selectedRelationship
        ? { kind: "relationship", selectedRelationship }
        : { kind: "diagram", selectionState };
    }
    case "note": {
      const selectedNote = view.notes.find((noteView) => noteView.noteId === selectionState.noteId);
      return selectedNote ? { kind: "note", selectedNote } : { kind: "diagram", selectionState };
    }
    case "namespace": {
      const selectedNamespace = view.namespaces.find(
        (namespaceView) => namespaceView.namespaceId === selectionState.namespaceId
      );
      return selectedNamespace
        ? { kind: "namespace", selectionState }
        : { kind: "diagram", selectionState };
    }
  }
}
