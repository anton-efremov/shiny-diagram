/**
 * @behavior Selected diagram element view slicing and style pane scenario routing.
 * @render Style inspector pane.
 */

import type { ReactElement } from "react";
import EmptyStylePane from "./EmptyStylePane/EmptyStylePane";
import ClassStylePane from "./ClassStylePane/ClassStylePane";
import NoteStylePane from "./NoteStylePane/NoteStylePane";
import RelationshipStylePane from "./RelationshipStylePane/RelationshipStylePane";
import StyleStylePane from "./StyleStylePane/StyleStylePane";
import type { NoteId, RelationshipId, StyleDefId } from "../../../../shared/ids";
import type { TransactionResult } from "../../../commands/editorCommands";
import type { RelationshipSeed } from "../../../state/editorStates";
import type { SelectionState } from "../../../state/editorStates";
import type {
  ClassView,
  DiagramView,
  NoteView,
  RelationshipView,
  StyleView,
} from "../../../views/schema";
import styles from "./StylePane.module.css";

type StylePaneProps = {
  readonly view: Pick<DiagramView, "classes" | "relationships" | "notes" | "styles">;
  readonly selectionState: SelectionState;
  readonly onStyleSelect: (styleDefId: StyleDefId) => void;
  readonly onNoteAttachStart: (noteId: NoteId) => void;
  readonly onNoteDuplicateCommitted: (result: TransactionResult) => void;
  readonly onRelationshipSelect: (relationshipId: RelationshipId) => void;
  readonly onRelationshipDuplicate: (seed: RelationshipSeed) => void;
};

type StylePaneScenario =
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
    };

export default function StylePane({
  view,
  selectionState,
  onStyleSelect,
  onNoteAttachStart,
  onNoteDuplicateCommitted,
  onRelationshipSelect,
  onRelationshipDuplicate,
}: StylePaneProps): ReactElement {
  // View and State slice props derivation
  const stylePaneScenario = toStylePaneScenario(view, selectionState);

  // Child component routing
  let stylePaneContent: ReactElement;
  switch (stylePaneScenario.kind) {
    case "style":
      stylePaneContent = (
        <StyleStylePane view={stylePaneScenario.selectedStyle} styles={view.styles} />
      );
      break;
    case "empty":
      stylePaneContent = <EmptyStylePane />;
      break;
    case "classes":
      stylePaneContent = (
        <ClassStylePane
          view={stylePaneScenario.selectedClasses}
          styles={view.styles}
          onStyleSelect={onStyleSelect}
        />
      );
      break;
    case "relationship":
      stylePaneContent = (
        <RelationshipStylePane
          view={stylePaneScenario.selectedRelationship}
          onRelationshipSelect={onRelationshipSelect}
          onRelationshipDuplicate={onRelationshipDuplicate}
        />
      );
      break;
    case "note":
      stylePaneContent = (
        <NoteStylePane
          view={stylePaneScenario.selectedNote}
          onNoteAttachStart={onNoteAttachStart}
          onNoteDuplicateCommitted={onNoteDuplicateCommitted}
        />
      );
      break;
  }

  return (
    <aside className={styles.stylePane} aria-label="Styles pane">
      <header className={styles.header}>Styles</header>
      {stylePaneContent}
    </aside>
  );
}

// Private helpers
function toStylePaneScenario(
  view: Pick<DiagramView, "classes" | "relationships" | "notes" | "styles">,
  selectionState: SelectionState
): StylePaneScenario {
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
  }
}
