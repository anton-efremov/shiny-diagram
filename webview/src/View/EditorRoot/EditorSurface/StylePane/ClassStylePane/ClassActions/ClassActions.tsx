/**
 * @behavior Class action interaction routing.
 * @render Duplicate and delete class actions.
 */

import type { ReactElement } from "react";
import type { ClassView } from "../../../../../views/schema";
import { useInteractions } from "./useInteractions";
import styles from "./ClassActions.module.css";

type ClassActionsProps = {
  readonly view: readonly ClassView[];
};

export default function ClassActions({ view }: ClassActionsProps): ReactElement {
  const { onDuplicate, onDelete } = useInteractions(view);

  return (
    <section className={styles.actions} aria-label="Class actions">
      <button type="button" onClick={onDuplicate}>
        Duplicate
      </button>
      <button type="button" className={styles.danger} onClick={onDelete}>
        Delete
      </button>
    </section>
  );
}
