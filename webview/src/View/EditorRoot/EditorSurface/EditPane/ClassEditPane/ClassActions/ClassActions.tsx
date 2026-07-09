/**
 * @behavior Class action interaction routing.
 * @render Duplicate and delete class actions.
 */

import { useEffect, type ReactElement } from "react";
import type { ClassView } from "../../../../../views/schema";
import { shouldIgnoreKeyboardShortcutEvent } from "../../../../../utils/keyboardEvents";
import Button from "../../../../../ui/primitives/Button/Button";
import { useInteractions } from "./useInteractions";

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
    <>
      <Button label="Duplicate" onClick={onDuplicate} />
      <Button label="Delete" tone="danger" onClick={onDelete} />
    </>
  );
}
