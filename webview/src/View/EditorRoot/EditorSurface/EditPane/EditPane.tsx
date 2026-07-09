/**
 * @behavior Selected diagram element view slicing and edit pane scenario routing.
 * @render Style inspector pane.
 */

import type { ReactElement } from "react";
import EmptyEditPane from "./EmptyEditPane/EmptyEditPane";
import ClassEditPane from "./ClassEditPane/ClassEditPane";
import NoteEditPane from "./NoteEditPane/NoteEditPane";
import RelationshipEditPane from "./RelationshipEditPane/RelationshipEditPane";
import StyleEditPane from "./StyleEditPane/StyleEditPane";
import NamespaceEditPane from "./NamespaceEditPane/NamespaceEditPane";
import type { NamespaceId, NoteId, RelationshipId, StyleDefId } from "../../../../shared/ids";
import type { TransactionResult } from "../../../commands/editorCommands";
import type { RelationshipSeed } from "../../../state/editorStates";
import type { SelectionState } from "../../../state/editorStates";
import type {
  ClassView,
  DiagramView,
  NoteView,
  RelationshipView,
  NamespaceView,
  StyleView,
} from "../../../views/schema";
import { EDIT_PANE_WIDTH } from "../../../config/editorUiConfig";
import PaneFrame from "../../../ui/templates/PaneFrame/PaneFrame";

type EditPaneProps = {
  readonly view: Pick<DiagramView, "classes" | "relationships" | "notes" | "styles" | "namespaces">;
  readonly selectionState: SelectionState;
  readonly onStyleSelect: (styleDefId: StyleDefId) => void;
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
      readonly kind: "style";
      readonly selectedStyle: StyleView;
    }
  | {
      readonly kind: "empty";
    }
  | {
      readonly kind: "classes";
      readonly selectedClasses: readonly ClassView[];
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
      readonly selectedNamespace: NamespaceView;
    };

export default function EditPane({
  view,
  selectionState,
  onStyleSelect,
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
    case "style":
      editPaneContent = (
        <StyleEditPane view={editPaneScenario.selectedStyle} styles={view.styles} />
      );
      break;
    case "empty":
      editPaneContent = <EmptyEditPane />;
      break;
    case "classes":
      editPaneContent = (
        <ClassEditPane
          view={editPaneScenario.selectedClasses}
          styles={view.styles}
          onStyleSelect={onStyleSelect}
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
          view={editPaneScenario.selectedNamespace}
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
      return { kind: "empty" };
    case "classes": {
      const selected = new Set(selectionState.classIds);
      const selectedClasses = view.classes.filter((classView) => selected.has(classView.classId));
      return selectedClasses.length === 0
        ? { kind: "empty" }
        : { kind: "classes", selectedClasses };
    }
    case "style": {
      const selectedStyle = view.styles.find(
        (styleView) => styleView.styleId === selectionState.styleDefId
      );
      return selectedStyle ? { kind: "style", selectedStyle } : { kind: "empty" };
    }
    case "relationship": {
      const selectedRelationship = view.relationships.find(
        (relationshipView) => relationshipView.relationshipId === selectionState.relationshipId
      );
      return selectedRelationship
        ? { kind: "relationship", selectedRelationship }
        : { kind: "empty" };
    }
    case "note": {
      const selectedNote = view.notes.find((noteView) => noteView.noteId === selectionState.noteId);
      return selectedNote ? { kind: "note", selectedNote } : { kind: "empty" };
    }
    case "namespace": {
      const selectedNamespace = view.namespaces.find(
        (namespaceView) => namespaceView.namespaceId === selectionState.namespaceId
      );
      return selectedNamespace ? { kind: "namespace", selectedNamespace } : { kind: "empty" };
    }
  }
}
