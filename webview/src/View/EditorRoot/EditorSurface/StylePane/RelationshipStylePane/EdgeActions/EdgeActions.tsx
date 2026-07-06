/**
 * @behavior Relationship duplicate and delete action routing.
 * @render Relationship action buttons.
 */

import type { ReactElement } from "react";
import type { RelationshipSeed } from "../../../../../state/editorStates";
import type { RelationshipView } from "../../../../../views/schema";
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
  const { onDuplicate, onDelete } = useInteractions(view, onRelationshipDuplicate);

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
