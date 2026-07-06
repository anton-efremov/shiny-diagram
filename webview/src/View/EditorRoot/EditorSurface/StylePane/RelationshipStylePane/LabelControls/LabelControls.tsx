/**
 * @behavior Relationship label draft and commit routing.
 * @render Relationship label controls.
 */

import { useEffect, useState } from "react";
import type { ChangeEvent, KeyboardEvent, ReactElement } from "react";
import type { RelationshipView } from "../../../../../views/schema";
import { useInteractions } from "./useInteractions";
import styles from "./LabelControls.module.css";

type LabelControlsProps = {
  readonly view: RelationshipView;
};

export default function LabelControls({ view }: LabelControlsProps): ReactElement {
  // State creation: local state - label draft
  const [draft, setDraft] = useState(view.label ?? "");

  // State reconciliation
  useEffect(() => setDraft(view.label ?? ""), [view.label]);

  // Event handler props derivation
  const { onLabelCommit } = useInteractions(view.relationshipId);

  function onChange(event: ChangeEvent<HTMLInputElement>): void {
    setDraft(event.currentTarget.value);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Escape") {
      setDraft(view.label ?? "");
      return;
    }
    if (event.key !== "Enter") return;
    const value = draft.trim();
    onLabelCommit(value === "" ? null : value);
  }

  function onRemoveLabel(): void {
    setDraft("");
    onLabelCommit(null);
  }

  return (
    <section className={styles.section} aria-label="Relationship label">
      <label className={styles.field}>
        <span>Label</span>
        <input value={draft} onChange={onChange} onKeyDown={onKeyDown} />
      </label>
      <button type="button" onClick={onRemoveLabel}>
        Remove Label
      </button>
    </section>
  );
}
