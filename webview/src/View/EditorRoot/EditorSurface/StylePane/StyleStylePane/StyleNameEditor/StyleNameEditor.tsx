/**
 * @behavior Local style name edit lifecycle.
 * @render Named style swatch and inline name editor.
 */

import { useState, type KeyboardEvent, type ReactElement } from "react";
import type { StyleView } from "../../../../../views/schema";
import { useInteractions } from "./useInteractions";
import { useStateReconciliation } from "./useStateReconciliation";
import styles from "./StyleNameEditor.module.css";

type StyleNameEditorProps = {
  readonly view: StyleView;
  readonly styles: readonly StyleView[];
};

type NotificationState = {
  readonly key: number;
  readonly message: string;
};

export default function StyleNameEditor({
  view,
  styles: styleViews,
}: StyleNameEditorProps): ReactElement {
  // State creation: local state - style name edit lifecycle and entered style name
  const [draftNameState, setDraftNameState] = useState(view.name);
  const [editingState, setEditingState] = useState(false);
  const [notificationState, setNotificationState] = useState<NotificationState | null>(null);

  // State reconciliation
  useStateReconciliation({
    name: view.name,
    setDraftNameState,
    setNotificationState,
  });

  // Event handler props derivation
  const { onEditStart, onDraftNameChange, onNameCommit, onNameCancel } = useInteractions({
    view,
    styles: styleViews,
    draftNameState,
    setDraftNameState,
    setEditingState,
    setNotificationState,
  });

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter") onNameCommit();
    if (event.key === "Escape") onNameCancel();
  }

  return (
    <section className={styles.editor} aria-label="Style name">
      <span
        className={styles.swatch}
        style={{
          background: view.style.fill ?? undefined,
          borderColor: view.style.stroke ?? undefined,
        }}
      />
      {editingState ? (
        <input
          value={draftNameState}
          aria-label="Style name"
          onChange={(event) => onDraftNameChange(event.currentTarget.value)}
          onBlur={onNameCommit}
          onKeyDown={onKeyDown}
          autoFocus
        />
      ) : (
        <button type="button" onClick={onEditStart}>
          {view.name}
        </button>
      )}
      {notificationState ? (
        <p key={notificationState.key} className={styles.notification} role="status">
          {notificationState.message}
        </p>
      ) : null}
    </section>
  );
}
