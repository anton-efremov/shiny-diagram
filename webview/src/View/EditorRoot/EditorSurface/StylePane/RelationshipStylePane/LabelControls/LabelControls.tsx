/**
 * @behavior Relationship label draft and commit routing.
 * @render Relationship label controls.
 */

import { useState } from "react";
import type { ReactElement } from "react";
import type { RelationshipView } from "../../../../../views/schema";
import { useInteractions } from "./useInteractions";
import { useStateReconciliation } from "./useStateReconciliation";
import styles from "./LabelControls.module.css";

type LabelControlsProps = {
  readonly view: RelationshipView;
};

export default function LabelControls({ view }: LabelControlsProps): ReactElement {
  // State creation: local state - label draft
  const [draft, setDraft] = useState(view.label ?? "");

  // State reconciliation
  useStateReconciliation({ label: view.label, setDraft });

  // Event handler props derivation
  const { onInputChange, onInputKeyDown, onLabelRemove } = useInteractions({
    relationshipId: view.relationshipId,
    label: view.label,
    draft,
    setDraft,
  });

  return (
    <section className={styles.section} aria-label="Relationship label">
      <label className={styles.field}>
        <span>Label</span>
        <input
          value={draft}
          onChange={(event) => onInputChange(event.currentTarget.value)}
          onKeyDown={(event) => onInputKeyDown(event.key)}
        />
      </label>
      <button type="button" onClick={onLabelRemove}>
        Remove Label
      </button>
    </section>
  );
}
