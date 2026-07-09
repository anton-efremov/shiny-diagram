/**
 * @behavior Class action interaction routing.
 * @render Duplicate and delete class actions.
 */

import { useEffect, type ReactElement } from "react";
import type { ClassView } from "../../../../../views/schema";
import { shouldIgnoreKeyboardShortcutEvent } from "../../../../../utils/keyboardEvents";
import { useInteractions } from "./useInteractions";
import styles from "./ClassActions.module.css";

type ClassActionsProps = {
  readonly view: readonly ClassView[];
};

export default function ClassActions({ view }: ClassActionsProps): ReactElement {
  // Event handler props derivation
  const { onDuplicate, onDelete } = useInteractions(view);

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
