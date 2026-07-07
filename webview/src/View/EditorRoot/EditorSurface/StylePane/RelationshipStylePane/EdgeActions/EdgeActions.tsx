/**
 * @behavior Relationship duplicate and delete action routing.
 * @render Relationship action buttons.
 */

import { useEffect, type ReactElement } from "react";
import type { RelationshipSeed } from "../../../../../state/editorStates";
import type { RelationshipView } from "../../../../../views/schema";
import { shouldIgnoreKeyboardShortcutEvent } from "../../../../../utils/keyboardEvents";
import { useInteractions } from "./useInteractions";
import styles from "./EdgeActions.module.css";

type EdgeActionsProps = {
  readonly view: RelationshipView;
  readonly onRelationshipDuplicate: (seed: RelationshipSeed) => void;
};

export default function EdgeActions({
  view,
  onRelationshipDuplicate,
}: EdgeActionsProps): ReactElement {
  // Event handler props derivation
  const { onDuplicate, onDelete } = useInteractions(view, onRelationshipDuplicate);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key !== "Delete" || shouldIgnoreKeyboardShortcutEvent(event)) return;

      event.preventDefault();
      onDelete();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onDelete]);

  return (
    <section className={styles.actions} aria-label="Relationship actions">
      <button type="button" onClick={onDuplicate}>
        Duplicate
      </button>
      <button type="button" className={styles.danger} onClick={onDelete}>
        Delete
      </button>
    </section>
  );
}
